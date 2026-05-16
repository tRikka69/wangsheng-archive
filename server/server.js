const express    = require('express');
const cors       = require('cors');
const { EnkaClient } = require('enka-network-api');
const { createClient } = require('@libsql/client');

const _turso = createClient({
    url:       process.env.TURSO_DATABASE_URL || 'file:./database.sqlite',
    authToken: process.env.TURSO_AUTH_TOKEN   || undefined,
});

const db = {
    get: async (sql, args = []) => {
        const r = await _turso.execute({ sql, args });
        return r.rows[0] ? convertRow(r.rows[0]) : null;
    },
    all: async (sql, args = []) => {
        const r = await _turso.execute({ sql, args });
        return r.rows.map(convertRow);
    },
    run: async (sql, args = []) => {
        await _turso.execute({ sql, args });
    },
    exec: async (sql) => {
        for (const s of sql.split(';').map(x => x.trim()).filter(Boolean)) {
            await _turso.execute(s);
        }
    }
};

function convertRow(row) {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
        if (k === 'uid') {
            out[k] = String(v).replace(/\.0$/, ''); // Жорстко відсікаємо плаваючу крапку
        } else {
            out[k] = typeof v === 'bigint' ? Number(v) : v;
        }
    }
    return out;
}
// genshin-db відключений в production через обмеження RAM (165MB)
// Використовуємо захардкоджені fallback значення
let genshindb = null;
if (process.env.NODE_ENV !== 'production') {
    try {
        genshindb = require('genshin-db');
        console.log('[GENSHIN-DB] ✓ Підключено (dev mode)');
    } catch (e) {
        console.warn('[GENSHIN-DB] ✗ Не знайдено');
    }
}
const app  = express();
const port = 3000;
const enka = new EnkaClient({ cacheDirectory: './cache' });
enka.cachedAssetsManager.cacheDirectorySetup();

app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.FRONTEND_URL,
        /\.vercel\.app$/
    ].filter(Boolean)
}));
app.use(express.json());

// ══════════════════════════════════════════════════════════
//  ІНІЦІАЛІЗАЦІЯ БД
// ══════════════════════════════════════════════════════════
(async () => {
    console.log('[ЯДРО] Ініціалізація бази даних...');

    await db.exec(`CREATE TABLE IF NOT EXISTS builds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT, nickname TEXT, signature TEXT, player_avatar TEXT, player_level INTEGER,
        world_level INTEGER DEFAULT 0,
        achievement_num INTEGER DEFAULT 0,
        tower_floor INTEGER DEFAULT 0,
        tower_level INTEGER DEFAULT 0,
        char_key TEXT, char_name_ru TEXT, char_name_en TEXT, char_icon TEXT, char_level INTEGER,
        friendship INTEGER, constellations INTEGER, constellations_data TEXT,
        weapon_name_ru TEXT, weapon_name_en TEXT, weapon_level INTEGER, weapon_ref INTEGER, weapon_icon TEXT,
        artifacts TEXT,
        hp REAL, attack REAL, defense REAL, mastery REAL, crit_rate REAL, crit_damage REAL, er REAL,
        skill_level_a INTEGER DEFAULT 0,
        skill_level_e INTEGER DEFAULT 0,
        skill_level_q INTEGER DEFAULT 0,
        hydro_dmg_bonus REAL DEFAULT 0,
        geo_dmg_bonus REAL DEFAULT 0,
        cryo_dmg_bonus REAL DEFAULT 0,
        updated_at INTEGER, UNIQUE(uid, char_key)
    )`);

    // Авто-міграції (додано таланти та гео бонус для Навії)
    const migrationCols = [
        'world_level INTEGER DEFAULT 0',
        'achievement_num INTEGER DEFAULT 0',
        'tower_floor INTEGER DEFAULT 0',
        'tower_level INTEGER DEFAULT 0',
        'constellations_data TEXT',
        'skill_level_a INTEGER DEFAULT 0',
        'skill_level_e INTEGER DEFAULT 0',
        'skill_level_q INTEGER DEFAULT 0',
        'hydro_dmg_bonus REAL DEFAULT 0',
        'geo_dmg_bonus REAL DEFAULT 0',
        'cryo_dmg_bonus REAL DEFAULT 0'
    ];
    for (const colDef of migrationCols) {
        const colName = colDef.split(' ')[0];
        try {
            await db.exec(`ALTER TABLE builds ADD COLUMN ${colDef}`);
            console.log(`[МІГРАЦІЯ] Додано колонку: ${colName}`);
        } catch (e) { /* вже існує */ }
    }

    console.log('[ЯДРО] База даних готова');
    console.log(`[WANGSHENG] Сервер активовано на http://localhost:${port}`);
})();

// ══════════════════════════════════════════════════════════
//  ДОПОМІЖНІ ФУНКЦІЇ
// ══════════════════════════════════════════════════════════
const formatDate = (ms, lang = 'ru') => {
    const date = new Date(ms);
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

const getImageUrl = (iconProp) => {
    if (!iconProp) return '';
    const name = typeof iconProp === 'string' ? iconProp : (iconProp.name || iconProp.url || '');
    if (!name) return '';
    if (name.startsWith('http')) return name;
    return `https://enka.network/ui/${name}.png`;
};

const equipTypeMap = {
    'EQUIP_BRACER':'Цветок жизни','EQUIP_NECKLACE':'Перо смерти',
    'EQUIP_SHOES':'Пески времени','EQUIP_RING':'Кубок пространства','EQUIP_DRESS':'Корона разума'
};

const appendPropMap = {
    'FIGHT_PROP_BASE_ATTACK':{isPercent:false},'FIGHT_PROP_HP':{isPercent:false},
    'FIGHT_PROP_ATTACK':{isPercent:false},'FIGHT_PROP_DEFENSE':{isPercent:false},
    'FIGHT_PROP_HP_PERCENT':{isPercent:true},'FIGHT_PROP_ATTACK_PERCENT':{isPercent:true},
    'FIGHT_PROP_DEFENSE_PERCENT':{isPercent:true},'FIGHT_PROP_CRITICAL':{isPercent:true},
    'FIGHT_PROP_CRITICAL_HURT':{isPercent:true},'FIGHT_PROP_CHARGE_EFFICIENCY':{isPercent:true},
    'FIGHT_PROP_HEAL_ADD':{isPercent:true},'FIGHT_PROP_ELEMENT_MASTERY':{isPercent:false},
    'FIGHT_PROP_PHYSICAL_ADD_HURT':{isPercent:true},'FIGHT_PROP_FIRE_ADD_HURT':{isPercent:true},
    'FIGHT_PROP_ELEC_ADD_HURT':{isPercent:true},'FIGHT_PROP_WATER_ADD_HURT':{isPercent:true},
    'FIGHT_PROP_WIND_ADD_HURT':{isPercent:true},'FIGHT_PROP_ICE_ADD_HURT':{isPercent:true},
    'FIGHT_PROP_ROCK_ADD_HURT':{isPercent:true},'FIGHT_PROP_GRASS_ADD_HURT':{isPercent:true}
};

const formatStat = (propId, value) => {
    const prop = appendPropMap[propId] || { isPercent: false };
    const v = prop.isPercent ? (value <= 1 ? value * 100 : value).toFixed(1) + '%' : Math.round(value).toString();
    return { id: propId, value: v };
};

// ══════════════════════════════════════════════════════════
//  ПАРСИНГ ТАЛАНТІВ (Всі 3 таланти)
// ══════════════════════════════════════════════════════════
function extractSkillLevels(char) {
    let a = 1, e = 1, q = 1;
    try {
        const rawMap = char._data?.skillLevelMap || char.avatarInfo?.skillLevelMap;
        if (rawMap) {
            const sortedKeys = Object.keys(rawMap).map(Number).sort((a, b) => a - b);
            if (sortedKeys.length >= 3) {
                a = rawMap[sortedKeys[0]] || 1;
                e = rawMap[sortedKeys[1]] || 1;
                q = rawMap[sortedKeys[2]] || 1;
                return { a, e, q };
            }
        }
        const skills = char.skillLevels || [];
        const aSkill = skills.find(s => s.skillType === 'NormalAttack') || skills[0];
        const eSkill = skills.find(s => s.skillType === 'ElementalSkill') || skills[1];
        const qSkill = skills.find(s => s.skillType === 'ElementalBurst') || skills[2];
        
        a = aSkill?.level?.value || aSkill?.level || 1;
        e = eSkill?.level?.value || eSkill?.level || 1;
        q = qSkill?.level?.value || qSkill?.level || 1;
    } catch (err) {}
    return { a, e, q };
}

function extractElementDmgBonus(char, propId) {
    try {
        const fpm = char._data?.fightPropMap || char.avatarInfo?.fightPropMap || {};
        return fpm[String(propId)] || fpm[Number(propId)] || 0;
    } catch (e) {
        return 0;
    }
}

// ══════════════════════════════════════════════════════════
//  FURINA CALC
// ══════════════════════════════════════════════════════════
const FURINA_FALLBACK_SCALING = [
    { usher: 0.0703, cheval: 0.0469, crab: 0.0879 }, { usher: 0.0756, cheval: 0.0504, crab: 0.0945 },
    { usher: 0.0808, cheval: 0.0539, crab: 0.1010 }, { usher: 0.0879, cheval: 0.0586, crab: 0.1099 },
    { usher: 0.0931, cheval: 0.0621, crab: 0.1165 }, { usher: 0.0984, cheval: 0.0656, crab: 0.1230 },
    { usher: 0.1055, cheval: 0.0703, crab: 0.1319 }, { usher: 0.1126, cheval: 0.0751, crab: 0.1408 },
    { usher: 0.1198, cheval: 0.0799, crab: 0.1497 }, { usher: 0.1269, cheval: 0.0846, crab: 0.1587 },
    { usher: 0.1390, cheval: 0.0927, crab: 0.1737 }, { usher: 0.1481, cheval: 0.0987, crab: 0.1851 },
    { usher: 0.1549, cheval: 0.1033, crab: 0.1936 },
];
let _furinaScalingCache = null;

function getFurinaScalings() {
    if (_furinaScalingCache) return _furinaScalingCache;
    if (!genshindb) { _furinaScalingCache = FURINA_FALLBACK_SCALING; return _furinaScalingCache; }
    try {
        const talents = genshindb.talents('Furina', { resultLanguage: 'English' });
        const data = talents.combat2.attributes?.data || {};
        const keys = Object.keys(data);
        const usherKey = keys.find(k => k.toLowerCase().includes('usher') || k.toLowerCase().includes('slap'));
        const chevalKey = keys.find(k => k.toLowerCase().includes('chevalmarin') || k.toLowerCase().includes('kick'));
        const crabKey = keys.find(k => k.toLowerCase().includes('crabaletta') || k.toLowerCase().includes('crab'));
        if (!usherKey || !chevalKey || !crabKey) throw new Error();
        const parse = (str) => { const m = str?.match(/(\d+\.?\d*)\s*%/); return m ? parseFloat(m[1]) / 100 : 0; };
        const scalings = [];
        for (let i = 0; i < 13; i++) scalings.push({ usher: parse(data[usherKey]?.[i]), cheval: parse(data[chevalKey]?.[i]), crab: parse(data[crabKey]?.[i]) });
        _furinaScalingCache = scalings;
        return scalings;
    } catch (e) { return FURINA_FALLBACK_SCALING; }
}

function calculateFurinaSkillDmg(build) {
    const { hp, crit_rate, crit_damage, constellations, skill_level_e, hydro_dmg_bonus, artifacts } = build;
    if (!hp || hp === 0) return 0;
    let effE = Math.max(1, Math.min(skill_level_e + (constellations >= 3 ? 3 : 0), 13));
    const s = getFurinaScalings()[effE - 1] || getFurinaScalings()[12];
    const baseDmg = (s.usher + s.cheval + s.crab) * hp;
    const a4 = Math.min(Math.max((hp - 10000) / 1000 * 0.007, 0), 0.28);
    let gtCount = 0;
    try {
        const arts = typeof artifacts === 'string' ? JSON.parse(artifacts) : (artifacts || []);
        arts.forEach(a => { if (a.setName?.en === 'Golden Troupe' || a.setName?.ru === 'Золотая труппа') gtCount++; });
    } catch (e) {}
    const gt = gtCount >= 4 ? 0.70 : (gtCount >= 2 ? 0.20 : 0);
    const c1 = constellations >= 1 ? 0.25 : 0;
    const cr = Math.min((crit_rate || 0) / 100, 1);
    const cd = (crit_damage || 0) / 100;
    return Math.round(baseDmg * (1 + (hydro_dmg_bonus || 0) + a4 + gt + c1) * (1 + cr * cd));
}

// ══════════════════════════════════════════════════════════
//  NAVIA CALC (Ротація: Q + 2x E + 10x NA)
// ══════════════════════════════════════════════════════════
function calculateNaviaRotationDmg(build) {
    const { attack, crit_rate, crit_damage, constellations, skill_level_a, skill_level_e, skill_level_q, geo_dmg_bonus, artifacts } = build;
    if (!attack || attack === 0) return 0;

    let nwCount = 0, marCount = 0;
    try {
        const artsList = typeof artifacts === 'string' ? JSON.parse(artifacts) : (artifacts || []);
        artsList.forEach(a => {
            if (a.setName?.en === 'Nighttime Whispers in the Echoing Woods' || a.setName?.ru === 'Ночной шёпот в лесу эха') nwCount++;
            if (a.setName?.en === 'Marechaussee Hunter' || a.setName?.ru === 'Охотник Сумеречного двора') marCount++;
        });
    } catch (e) {}

    // A4 Passive: Team Navia+Furina+Mavuika+Xilonen = 2 stacks = +40% ATK (Додається до базової атаки, для спрощення беремо 350 флет АТК або ігноруємо, бо в Енка АПІ атака вже з баффами екрану. Будемо точними і додамо 20% множник як аналог)
    // Nighttime Whispers 4pc = +50% Geo DMG
    let bonusDmg = (geo_dmg_bonus || 0) + (nwCount >= 4 ? 0.50 : 0);

    let cr = crit_rate;
    if (marCount >= 4) cr += 36; // Сет мисливця
    cr = Math.min(cr / 100, 1);
    let cd = crit_damage / 100;

    let effA = Math.min(11, Math.max(1, skill_level_a || 1));
    let effE = Math.min(13, Math.max(1, (skill_level_e || 1) + (constellations >= 3 ? 3 : 0)));
    let effQ = Math.min(13, Math.max(1, (skill_level_q || 1) + (constellations >= 5 ? 3 : 0)));

    // Точні множники Навії з датамайну
    const eBaseArr = [0, 3.948, 4.244, 4.54, 4.935, 5.231, 5.527, 5.922, 6.317, 6.712, 7.106, 7.501, 7.896, 8.44];
    let eTotalMult = (eBaseArr[effE] || eBaseArr[13]) * 2.0 * 1.45; // 6 стаків: x2 базова шкода, +45% додаткова = 2.9x множник

    const qInitArr = [0, 0.725, 0.78, 0.834, 0.907, 0.961, 1.015, 1.088, 1.161, 1.233, 1.306, 1.378, 1.451, 1.551];
    const qCanArr  = [0, 0.424, 0.456, 0.488, 0.53,  0.562, 0.594, 0.636, 0.678, 0.721, 0.763, 0.805, 0.848, 0.906];
    let qTotalMult = (qInitArr[effQ] || qInitArr[13]) + ((qCanArr[effQ] || qCanArr[13]) * 12); // Удар + 12 гармат

    const naComboArr = [0, 4.72, 5.09, 5.46, 6.02, 6.39, 6.81, 7.37, 7.93, 8.49, 9.06, 9.77];
    let naTotalMult = naComboArr[effA] || naComboArr[11]; // Одне повне комбо N1+N2+N3+N1+N2

    let eCr = Math.min(cr + (constellations >= 2 ? 0.36 : 0), 1);
    let eCd = cd + (constellations >= 6 ? 1.35 : 0);
    let resMult = constellations >= 4 ? 1.1 : 1.0; // С4 зрізає резисти
    let a1NaDmgBonus = 0.40; // Інфузія

    let qDmg = attack * qTotalMult * (1 + bonusDmg) * (1 + cr * cd) * resMult;
    let eDmg = 2 * (attack * eTotalMult * (1 + bonusDmg) * (1 + eCr * eCd) * resMult);
    let naDmg = 2 * (attack * naTotalMult * (1 + bonusDmg + a1NaDmgBonus) * (1 + cr * cd) * resMult);

    return Math.round(qDmg + eDmg + naDmg);
}

// ══════════════════════════════════════════════════════════
//  ELITE STATS
// ══════════════════════════════════════════════════════════
async function getEliteStats(charKey, topLimit) {
    return await db.get(`
        SELECT
            (SELECT AVG(hp)          FROM (SELECT hp          FROM builds WHERE char_key=? ORDER BY hp          DESC LIMIT ?)) as hp,
            (SELECT AVG(attack)      FROM (SELECT attack      FROM builds WHERE char_key=? ORDER BY attack      DESC LIMIT ?)) as attack,
            (SELECT AVG(defense)     FROM (SELECT defense     FROM builds WHERE char_key=? ORDER BY defense     DESC LIMIT ?)) as defense,
            (SELECT AVG(mastery)     FROM (SELECT mastery     FROM builds WHERE char_key=? ORDER BY mastery     DESC LIMIT ?)) as mastery,
            (SELECT AVG(crit_rate)   FROM (SELECT crit_rate   FROM builds WHERE char_key=? ORDER BY crit_rate   DESC LIMIT ?)) as critRate,
            (SELECT AVG(crit_damage) FROM (SELECT crit_damage FROM builds WHERE char_key=? ORDER BY crit_damage DESC LIMIT ?)) as critDamage,
            (SELECT AVG(er)          FROM (SELECT er          FROM builds WHERE char_key=? ORDER BY er          DESC LIMIT ?)) as er
    `, [
        charKey,topLimit, charKey,topLimit, charKey,topLimit, charKey,topLimit,
        charKey,topLimit, charKey,topLimit, charKey,topLimit
    ]);
}

// ══════════════════════════════════════════════════════════
//  GET /api/user/:uid
// ══════════════════════════════════════════════════════════
app.get('/api/user/:uid', async (req, res) => {
    const uid          = String(req.params.uid).trim();
    const forceRefresh = req.query.refresh === 'true';
    const now          = Date.now();

    console.log(`\n[API /user] UID: ${uid} | force: ${forceRefresh}`);

    let canonicalUid = uid; // може бути оновлений після Enka запиту
    try {
        const existingRecord = await db.get(`SELECT updated_at FROM builds WHERE uid = ?`, [uid]);
        let needsFetchFromEnka = !existingRecord;
        let nextRefreshReadyAt = existingRecord ? existingRecord.updated_at + 120000 : 0;

        if (existingRecord && forceRefresh) {
            if (now < nextRefreshReadyAt) {
                return res.status(429).json({ error: 'Кулдаун', nextRefreshReadyAt });
            }
            needsFetchFromEnka = true;
        }

        if (needsFetchFromEnka) {
            console.log(`[ENKA] Запит: UID ${uid}`);
            let user;
            try {
                user = await enka.fetchUser(uid);
            } catch (e) {
                throw new Error('Профіль не існує або вітрина прихована.');
            }

            const playerAvatar   = getImageUrl(user.profilePicture?.icon || user.profilePicture?.picture);
            const worldLevel     = user.worldLevel     ?? 0;
            const achievementNum = user.finishAchievementNum ?? user.achievementCount ?? 0;
            const towerFloor     = user.towerFloorIndex ?? 0;
            const towerLevel     = user.towerLevelIndex ?? 0;

            for (const char of user.characters) {
                const charNameRu = char.characterData.name.get('ru') || 'Неизвестно';
                const charNameEn = char.characterData.name.get('en') || 'Unknown';
                const charKey    = charNameEn;
                const charIcon   = getImageUrl(char.costume?.icon) || getImageUrl(char.characterData?.icon) || getImageUrl(char.characterData?.sideIcon);
                const friendship     = char.friendship || 1;
                const constellations = char.unlockedConstellations ? char.unlockedConstellations.length : 0;

                // ══ Рівні всіх талантів та елементальний урон ══
                const { a: skillLevelA, e: skillLevelE, q: skillLevelQ } = extractSkillLevels(char);
                const hydroDmgBonus = extractElementDmgBonus(char, 42);
                const geoDmgBonus   = extractElementDmgBonus(char, 45);
                const cryoDmgBonus  = extractElementDmgBonus(char, 46);

                let constellationsData = [];
                try {
                    const allCons = char.characterData?.constellations || [];
                    constellationsData = allCons.map((con, idx) => ({
                        name: { ru: con?.name?.get?.('ru') || `C${idx+1}`, en: con?.name?.get?.('en') || `C${idx+1}` },
                        icon: getImageUrl(con?.icon), unlocked: idx < constellations
                    }));
                } catch (e) {}

                const stats = {
                    hp:          char.stats.maxHp?.value || char.stats.maxHealth?.value || 0,
                    attack:      char.stats.attack?.value || 0,
                    defense:     char.stats.defense?.value || 0,
                    mastery:     char.stats.elementMastery?.value || 0,
                    crit_rate:   (char.stats.critRate?.value   || 0) * 100,
                    crit_damage: (char.stats.critDamage?.value || 0) * 100,
                    er:          (char.stats.chargeEfficiency?.value || 0) * 100
                };

                let wNameRu='Отсутствует', wNameEn='None', wLevel=0, wRef=1, wIcon='';
                if (char.weapon) {
                    wNameRu = char.weapon.weaponData?.name?.get('ru') || 'Оружие';
                    wNameEn = char.weapon.weaponData?.name?.get('en') || 'Weapon';
                    wLevel  = char.weapon.level || 0;
                    wRef    = char.weapon.refinementRank || 1;
                    wIcon   = getImageUrl(char.weapon._data?.flat?.icon || char.weapon.weaponData?.icon);
                }

                let artifactsData = [];
                (char.artifacts || []).forEach(art => {
                    const flat = art._data?.flat || {};
                    artifactsData.push({
                        equipType: equipTypeMap[flat.equipType || ''] || (flat.equipType || 'UNKNOWN'),
                        setName: { ru: art.artifactData?.set?.name?.get('ru') || 'Артефакт', en: art.artifactData?.set?.name?.get('en') || 'Artifact' },
                        icon: getImageUrl(flat.icon || art.artifactData?.icon),
                        level: art.level || 1,
                        mainstat: formatStat((flat.reliquaryMainstat || {}).mainPropId, (flat.reliquaryMainstat || {}).statValue || 0),
                        substats: (flat.reliquarySubstats || []).map(s => formatStat(s.appendPropId, s.statValue || 0))
                    });
                });

                await db.run(
                    `INSERT INTO builds (
                        uid, nickname, signature, player_avatar, player_level,
                        world_level, achievement_num, tower_floor, tower_level,
                        char_key, char_name_ru, char_name_en, char_icon, char_level,
                        friendship, constellations, constellations_data,
                        weapon_name_ru, weapon_name_en, weapon_level, weapon_ref, weapon_icon,
                        artifacts, hp, attack, defense, mastery, crit_rate, crit_damage, er,
                        skill_level_a, skill_level_e, skill_level_q,
                        hydro_dmg_bonus, geo_dmg_bonus, cryo_dmg_bonus, updated_at
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                    ON CONFLICT(uid, char_key) DO UPDATE SET
                        nickname=excluded.nickname, signature=excluded.signature,
                        player_avatar=excluded.player_avatar, player_level=excluded.player_level,
                        world_level=excluded.world_level, achievement_num=excluded.achievement_num,
                        tower_floor=excluded.tower_floor, tower_level=excluded.tower_level,
                        char_name_ru=excluded.char_name_ru, char_name_en=excluded.char_name_en,
                        char_icon=excluded.char_icon, char_level=excluded.char_level,
                        friendship=excluded.friendship, constellations=excluded.constellations,
                        constellations_data=excluded.constellations_data,
                        weapon_name_ru=excluded.weapon_name_ru, weapon_name_en=excluded.weapon_name_en,
                        weapon_level=excluded.weapon_level, weapon_ref=excluded.weapon_ref,
                        weapon_icon=excluded.weapon_icon, artifacts=excluded.artifacts,
                        hp=excluded.hp, attack=excluded.attack, defense=excluded.defense,
                        mastery=excluded.mastery, crit_rate=excluded.crit_rate,
                        crit_damage=excluded.crit_damage, er=excluded.er,
                        skill_level_a=excluded.skill_level_a, skill_level_e=excluded.skill_level_e, skill_level_q=excluded.skill_level_q,
                        hydro_dmg_bonus=excluded.hydro_dmg_bonus, geo_dmg_bonus=excluded.geo_dmg_bonus, cryo_dmg_bonus=excluded.cryo_dmg_bonus,
                        updated_at=excluded.updated_at`,
                    [
                        String(user.uid), user.nickname, user.signature || '', playerAvatar, user.level,
                        worldLevel, achievementNum, towerFloor, towerLevel,
                        charKey, charNameRu, charNameEn, charIcon, char.level,
                        friendship, constellations, JSON.stringify(constellationsData),
                        wNameRu, wNameEn, wLevel, wRef, wIcon,
                        JSON.stringify(artifactsData),
                        stats.hp, stats.attack, stats.defense, stats.mastery,
                        stats.crit_rate, stats.crit_damage, stats.er,
                        skillLevelA, skillLevelE, skillLevelQ,
                        hydroDmgBonus, geoDmgBonus, cryoDmgBonus, now
                    ]
                );
            }
            nextRefreshReadyAt = now + 120000;
            // Після Enka-запиту використовуємо user.uid (канонічний) для SELECT
            canonicalUid = String(user.uid).trim();
            console.log(`[API /user] uid url="${uid}" enka="${canonicalUid}"`);
        }

        const userBuilds = await db.all(`SELECT * FROM builds WHERE uid = ?`, [canonicalUid]);
        if (!userBuilds.length) throw new Error('Дані відсутні');

        const charactersWithEliteData = await Promise.all(userBuilds.map(async (c) => {
            const totalRes = await db.get(`SELECT COUNT(*) as count FROM builds WHERE char_key = ?`, [c.char_key]);
            
            // Динамічний вибір стата для звичайного рангу (Furina=HP, Navia=ATK)
            const isHpScaling = ['Furina', 'Yelan', 'Neuvillette', 'Nilou', 'Hu Tao', 'Zhongli'].includes(c.char_key);
            const isDefScaling = ['Albedo', 'Arataki Itto', 'Chiori', 'Noelle'].includes(c.char_key);
            const mainStat = isHpScaling ? 'hp' : (isDefScaling ? 'defense' : 'attack');
            const rankRes = await db.get(`SELECT COUNT(*) as count FROM builds WHERE char_key = ? AND ${mainStat} >= ?`, [c.char_key, c[mainStat]]);
            
            const total = totalRes.count;
            const topLimit = Math.max(1, Math.floor(total * 0.01));
            const eliteStats = await getEliteStats(c.char_key, topLimit);

            let parsedArtifacts = [], parsedConstellations = [];
            try { parsedArtifacts = JSON.parse(c.artifacts || '[]'); } catch {}
            try { parsedConstellations = JSON.parse(c.constellations_data || '[]'); } catch {}

            // ══ Спеціальні Топи: Furina та Navia ══
            let specialDmg = null, specialDmgRank = null;
            if (c.char_key === 'Furina') {
                specialDmg = calculateFurinaSkillDmg(c);
                const all = await db.all(`SELECT hp, crit_rate, crit_damage, constellations, skill_level_e, hydro_dmg_bonus, artifacts FROM builds WHERE char_key = 'Furina'`);
                const withScores = all.map(b => ({ ...b, _s: calculateFurinaSkillDmg(b) }));
                specialDmgRank = withScores.filter(b => b._s >= specialDmg).length;
            } else if (c.char_key === 'Navia') {
                specialDmg = calculateNaviaRotationDmg(c);
                const all = await db.all(`SELECT attack, crit_rate, crit_damage, constellations, skill_level_a, skill_level_e, skill_level_q, geo_dmg_bonus, artifacts FROM builds WHERE char_key = 'Navia'`);
                const withScores = all.map(b => ({ ...b, _s: calculateNaviaRotationDmg(b) }));
                specialDmgRank = withScores.filter(b => b._s >= specialDmg).length;
            } else if (c.char_key === 'Kaedehara Kazuha') {
                specialDmg = getKazuhaMastery(c);
                const all = await db.all(`SELECT mastery FROM builds WHERE char_key = 'Kaedehara Kazuha'`);
                const withScores = all.map(b => ({ ...b, _s: getKazuhaMastery(b) }));
                specialDmgRank = withScores.filter(b => b._s >= specialDmg).length;
                console.log(`[KAZUHA] UID:${c.uid} EM:${specialDmg} Rank:${specialDmgRank}/${total}`);
            }

            return {
                build_id: c.id, key: c.char_key, nameRu: c.char_name_ru, nameEn: c.char_name_en,
                icon: c.char_icon, level: c.char_level, rank: rankRes.count, total,
                friendship: c.friendship, constellations: c.constellations,
                constellationsData: parsedConstellations,
                weapon: { nameRu: c.weapon_name_ru, nameEn: c.weapon_name_en, level: c.weapon_level, refinement: c.weapon_ref, icon: c.weapon_icon },
                artifacts: parsedArtifacts,
                stats: { hp: c.hp, attack: c.attack, defense: c.defense, mastery: c.mastery, critRate: c.crit_rate, critDamage: c.crit_damage, er: c.er },
                eliteStats,
                specialDmg, specialDmgRank,
                skillLevelA: c.skill_level_a || 0, skillLevelE: c.skill_level_e || 0, skillLevelQ: c.skill_level_q || 0,
                hydroDmgBonus: c.hydro_dmg_bonus || 0,
                geoDmgBonus:   c.geo_dmg_bonus   || 0,
                cryoDmgBonus:  c.cryo_dmg_bonus  || 0
            };
        }));

        const first = userBuilds[0];
        res.json({
            nickname: first.nickname, level: first.player_level, signature: first.signature,
            avatar: first.player_avatar, worldLevel: first.world_level || 0,
            achievementNum: first.achievement_num || 0, towerFloor: first.tower_floor || 0, towerLevel: first.tower_level || 0,
            nextRefreshReadyAt, characters: charactersWithEliteData
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ══════════════════════════════════════════════════════════
//  GET /api/leaderboard
// ══════════════════════════════════════════════════════════
app.get('/api/leaderboard', async (req, res) => {
    const lang = req.query.lang || 'ru';
    try {
        const data = await db.all(`
            SELECT char_key as name, MAX(char_name_ru) as name_ru, MAX(char_name_en) as name_en,
                   COUNT(*) as total, MAX(char_icon) as icon, MAX(updated_at) as last_ms
            FROM builds GROUP BY char_key ORDER BY total DESC
        `);
        res.json(data.map(d => ({ ...d, last_date: formatDate(d.last_ms, lang) })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════
//  GET /api/leaderboard/:name
//  ?sort=date|skill_dmg|rotation_dmg   ?page=1   ?limit=30
//
//  Slug-маппінг (з URL /:view → sort param):
//    'skill'      → 'skill_dmg'
//    'rotation_1' → 'rotation_dmg'
//
//  Date-сортування: SQL LIMIT/OFFSET
//  DMG-сортування: calc all → sort in-memory → slice page
// ══════════════════════════════════════════════════════════
const SLUG_TO_SORT = {
    'skill':          'skill_dmg',
    'rotation_1':     'rotation_dmg',
    'rotation_skirk': 'skirk_rotation',
    'em_top':         'em_sort',         // Kazuha EM ranking
    // ← додавати нових персонажів сюди
};


// ══════════════════════════════════════════════════════════
//  SKIRK — Rotation DMG Calculator
//
//  Team: Furina C0 (FavSword R3, TOTM 4pc) +
//        Escoffier C0 (FavLance R3, NO 4pc) +
//        Mona C4 (TTDS R5, NO 4pc)
//
//  Топ рахується лише по урону СКІРК в даній ротації.
//  Командні бафи фіксовані (стандартна команда).
//
//  Підрахунок дій Скірк з ротації:
//  Пре-луп: 3× hE
//  Луп ×4: Q, tE, N2CD, 3[N5D], N2CD, N5D, N2
//  (детально — з коментарів в gcsim-ротації)
// ══════════════════════════════════════════════════════════
const SKIRK_FALLBACK_SCALINGS = {
    // Hold E (1 удар, % від ATK) — рівні 1-13
    holdE: [7.44, 7.99, 8.55, 9.30, 9.86, 10.42, 11.16, 11.90, 12.65, 13.39, 14.67, 15.65, 16.38],
    // Tap E (% від ATK)
    tapE:  [4.46, 4.79, 5.13, 5.58, 5.92, 6.25, 6.70, 7.15, 7.59, 8.04, 8.82, 9.40, 9.84],
    // Q (загальний урон, % від ATK) — рівні 1-13
    q:     [9.60, 10.32, 11.04, 12.00, 12.72, 13.44, 14.40, 15.36, 16.32, 17.28, 18.24, 19.20, 20.40],
    // NA combo: сума 5 ударів (N5) у % від ATK — рівні 1-11
    n5Combo: [2.50, 2.68, 2.87, 3.12, 3.30, 3.50, 3.75, 4.00, 4.26, 4.50, 4.76],
    // Charged attack (1 удар) — % від ATK
    ca:    [0.90, 0.97, 1.04, 1.13, 1.20, 1.26, 1.35, 1.44, 1.53, 1.62, 1.71],
};
let _skirkScalingCache = null;
function getSkirkScalings() {
    if (_skirkScalingCache) return _skirkScalingCache;
    if (genshindb) {
        try {
            const talents = genshindb.talents('Skirk', { resultLanguage: 'English' });
            if (talents) {
                console.log('[SKIRK][genshin-db] ✓ Таланти знайдено');
                // Якщо genshin-db має Скірк — парсимо (ключі залежать від оновлення db)
                const e2 = talents.combat2?.attributes?.data || {};
                const keys = Object.keys(e2);
                const parse = (str) => { const m = str?.match(/(\d+\.?\d*)/); return m ? parseFloat(m[1]) / 100 : 0; };
                if (keys.length > 0) {
                    console.log('[SKIRK][genshin-db] E ключі:', keys.slice(0,4).join(', '));
                }
            }
        } catch (e) {
            console.warn('[SKIRK][genshin-db] Не знайдено, використовую фолбек');
        }
    }
    _skirkScalingCache = SKIRK_FALLBACK_SCALINGS;
    return SKIRK_FALLBACK_SCALINGS;
}

function calculateSkirkRotationDmg(build) {
    const {
        attack, crit_rate, crit_damage, constellations,
        skill_level_a, skill_level_e, skill_level_q,
        cryo_dmg_bonus, hydro_dmg_bonus, artifacts, weapon_ref, weapon_name_en
    } = build;

    if (!attack || attack === 0) return 0;

    // ── 1. Ефективні рівні талантів ──
    // C3: +3 рівні E  |  C5: +3 рівні Q
    const effE = Math.max(0, Math.min((skill_level_e || 1) - 1 + (constellations >= 3 ? 3 : 0), 12));
    const effQ = Math.max(0, Math.min((skill_level_q || 1) - 1 + (constellations >= 5 ? 3 : 0), 12));
    const effA = Math.max(0, Math.min((skill_level_a || 1) - 1, 10));

    const sc = getSkirkScalings();
    const holdEMult  = sc.holdE[effE]   || 7.44;
    const tapEMult   = sc.tapE[effE]    || 4.46;
    const qMult      = sc.q[effQ]       || 9.60;
    const n5Combo    = sc.n5Combo[effA] || 2.50;
    const caMult     = sc.ca[effA]      || 0.90;

    // ── 2. Бонус від артефактів ──
    let artSetBonus = 0;
    try {
        const arts = typeof artifacts === 'string' ? JSON.parse(artifacts) : (artifacts || []);
        let deepGalleryCount = 0;
        let mhCount = 0;
        arts.forEach(a => {
            const name = a.setName?.en?.toLowerCase() || '';
            if (name.includes('deep') || name.includes('gallery') || name.includes('finale')) deepGalleryCount++;
            if (name.includes('marechaussee') || name.includes('hunter')) mhCount++;
        });
        // "Finale of the Deep Galleries" 4pc: +50% Cryo DMG від E (припущення)
        if (deepGalleryCount >= 4) artSetBonus += 0.50;
        else if (deepGalleryCount >= 2) artSetBonus += 0.15;
        // Marechaussee Hunter 2pc: +15% NА/CA DMG (2pc bonus)
        if (mhCount >= 2) artSetBonus += 0.15;
    } catch (e) {}

    // ── 3. Зброя "Azurelight" та інші ──
    let weaponBonus = 0;
    // Azurelight (нова зброя Скірк): по даних гри ~40% DMG бонус від хол-Е при stack
    // Фолбек — припускаємо базовий бонус
    const wName = (weapon_name_en || '').toLowerCase();
    if (wName.includes('azure') || wName.includes('azurelight')) {
        const ref = Math.max(1, Math.min(weapon_ref || 1, 5));
        weaponBonus = 0.28 + (ref - 1) * 0.07; // R1=0.28, R5=0.56 (припущення)
    }

    // ── 4. Бонус від констеляцій ──
    // C1: +20% E DMG (припущення)
    const c1EDmgBonus = constellations >= 1 ? 0.20 : 0;
    // C4: +20% до CRIT DMG у змійній формі (припущення)
    const c4CdBonus   = constellations >= 4 ? 0.20 : 0;
    // C6: +60% Q DMG (припущення)
    const c6QBonus    = constellations >= 6 ? 0.60 : 0;

    // ── 5. ФІКСОВАНІ БАФИ КОМАНДИ ──
    // (Furina C0 FavR3 TOTM4, Escoffier C0 FavLanceR3 NO4, Mona C4 TTDS-R5 NO4)
    //
    // ATK бафи (множаться на Скірк ATK):
    //   TTDS R5: +48% ATK
    //   Escoffier NO 4pc: +20% ATK після Q
    const teamAtkMult = 1.48 * 1.20; // = 1.776

    //   Furina Q Fanfare ~300 стаків → 72% DMG бонус (3 × 24%)
    const furinaFanfare = 0.72;

    //   Mona Q Omen при Е9 Мони: ~52% DMG до всього урону по меченому
    //   C4 Мони: +15% Hydro DMG (для союзників) — на Cryo Скірк не діє
    const monaOmen = 0.52;

    //   Ескоф'є: шанс пасивки Cryo RES -15% → фактор 1 / (1 - 0.10 + 0.15) = 1/1.05
    //   Але ми рахуємо через RES-мульт нижче, тут враховуємо як зменшення RES
    const escofierResMelt = 0.15; // Cryo RES shred (припущення)

    // ── 6. Всього DMG% бонус до E-хітів (де діє artSetBonus + weaponBonus + c1) ──
    const totalEDmgBonus = (cryo_dmg_bonus || 0)
        + furinaFanfare + monaOmen
        + artSetBonus + weaponBonus + c1EDmgBonus;

    // DMG% бонус до Q (c6 додається)
    const totalQDmgBonus = (cryo_dmg_bonus || 0)
        + furinaFanfare + monaOmen
        + artSetBonus + weaponBonus + c6QBonus;

    // DMG% бонус до NA/CA (artSetBonus тут не діє якщо тільки для E)
    const totalNaDmgBonus = (cryo_dmg_bonus || 0)
        + furinaFanfare + monaOmen + weaponBonus;

    // ── 7. Крит-множник ──
    const cr = Math.min((crit_rate || 0) / 100, 1);
    const cd = ((crit_damage || 0) / 100) + c4CdBonus;
    const critMult = 1 + cr * cd;

    // ── 8. DEF-множник (Скірк Lv90 vs Enemy Lv100) ──
    const defMult = 90 / (90 + 100); // ≈ 0.4737

    // ── 9. RES-множник: 10% Cryo RES - Escoffier shred ──
    const cryoRes = Math.max(-1, 0.10 - escofierResMelt); // = -0.05
    const resMult = cryoRes < 0 ? 1 - cryoRes / 2 : 1 - cryoRes; // = 1.025

    // ── 10. Ефективний ATK (з командними бафами) ──
    const effAtk = attack * teamAtkMult;

    // ── 11. Підрахунок дій в ротації ──
    // Пре-луп: 3 hE
    // 4 лупи: в кожному приблизно:
    //   1 hE або tE (чергуються), 1-2 Q за 4 лупи, NA-комбо

    // hE: 3 (пре-луп) + 4×0.75 = ~6 загалом
    const hECount  = 6;
    // tE: ~1 на луп в лупі де нема hE = ~2
    const tECount  = 2;
    // Q: 2 бурсти на 4 лупи
    const qCount   = 2;
    // N5 combos (3 рази на луп = 12 комб), + N2 і т.д. — ~10 n5 combos
    const n5Count  = 10;
    // CA (N2CD appears ~6 разів)
    const caCount  = 6;

    const hEDmg = effAtk * holdEMult * (1 + totalEDmgBonus) * critMult * defMult * resMult * hECount;
    const tEDmg = effAtk * tapEMult  * (1 + totalEDmgBonus) * critMult * defMult * resMult * tECount;
    const qDmg  = effAtk * qMult     * (1 + totalQDmgBonus) * critMult * defMult * resMult * qCount;
    const naDmg = effAtk * n5Combo   * (1 + totalNaDmgBonus) * critMult * defMult * resMult * n5Count;
    const caDmg = effAtk * caMult    * (1 + totalNaDmgBonus) * critMult * defMult * resMult * caCount;

    const total = hEDmg + tEDmg + qDmg + naDmg + caDmg;
    console.log(`[SKIRK] hE:${Math.round(hEDmg/1000)}k tE:${Math.round(tEDmg/1000)}k Q:${Math.round(qDmg/1000)}k NA:${Math.round(naDmg/1000)}k CA:${Math.round(caDmg/1000)}k = ${Math.round(total/1000)}k`);
    return Math.round(total);
}


// ══════════════════════════════════════════════════════════
//  KAZUHA — Elemental Mastery ranking
//  Простий топ по значенню мастерства стихій.
//  Чим більше EM — тим вищий ранг.
// ══════════════════════════════════════════════════════════
function getKazuhaMastery(build) {
    return Math.round(Number(build.mastery) || 0);
}

const CHAR_SORT_FUNCTIONS = {
    'Furina': { 'skill_dmg':        calculateFurinaSkillDmg      },
    'Navia':  { 'rotation_dmg':     calculateNaviaRotationDmg    },
    'Skirk':  { 'skirk_rotation':   calculateSkirkRotationDmg    },
    'Kaedehara Kazuha': { 'em_sort':           getKazuhaMastery             },
};

const LB_SELECT_FIELDS = `
    id as build_id, nickname, uid, player_level as level, player_avatar,
    char_icon, artifacts, crit_rate, crit_damage, updated_at as last_ms, hp, attack,
    mastery,
    constellations, skill_level_a, skill_level_e, skill_level_q,
    hydro_dmg_bonus, geo_dmg_bonus, cryo_dmg_bonus
`;

app.get('/api/leaderboard/:name', async (req, res) => {
    const lang     = req.query.lang || 'ru';
    const charName = req.params.name;
    const limit    = 30;
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const offset   = (page - 1) * limit;
    const rawSort  = req.query.sort || 'date';
    const sort     = SLUG_TO_SORT[rawSort] || rawSort;
    const calcFn   = (CHAR_SORT_FUNCTIONS[charName] || {})[sort];

    console.log(`[API /leaderboard/${charName}] sort:${sort} page:${page} lang:${lang}`);

    try {
        if (calcFn) {
            // ── DMG: рахуємо для всіх → сортуємо → пагінуємо ──
            const allData = await db.all(
                `SELECT ${LB_SELECT_FIELDS} FROM builds WHERE char_key = ? ORDER BY id ASC`,
                [charName]
            );
            const withScores = allData.map(r => ({
                ...r, skill_dmg: calcFn(r), added_date: formatDate(r.last_ms, lang)
            }));
            withScores.sort((a, b) => (b.skill_dmg || 0) - (a.skill_dmg || 0));

            const total     = withScores.length;
            const totalPages = Math.ceil(total / limit);
            const pageData  = withScores.slice(offset, offset + limit);

            console.log(`[API /leaderboard/${charName}] ← ${total} | топ:${withScores[0]?.skill_dmg?.toLocaleString()||0} | стор.${page}/${totalPages}`);
            res.json({ total, page, totalPages, data: pageData });

        } else {
            // ── Date: SQL LIMIT/OFFSET ──
            const totalRes = await db.get(`SELECT COUNT(*) as cnt FROM builds WHERE char_key = ?`, [charName]);
            const data = await db.all(
                `SELECT ${LB_SELECT_FIELDS} FROM builds WHERE char_key = ? ORDER BY id ASC LIMIT ? OFFSET ?`,
                [charName, limit, offset]
            );
            const total     = totalRes.cnt;
            const totalPages = Math.ceil(total / limit);

            console.log(`[API /leaderboard/${charName}] ← ${total} | стор.${page}/${totalPages}`);
            res.json({
                total, page, totalPages,
                data: data.map(d => ({ ...d, added_date: formatDate(d.last_ms, lang) }))
            });
        }
    } catch (e) {
        console.error(`[API /leaderboard/${charName}]`, e.message);
        res.status(500).json({ error: e.message });
    }
});

// ══════════════════════════════════════════════════════════
//  GET /api/profiles
//  ?page=1 &sort=achievements|abyss|updated &limit=30
//  Унікальні гравці (по uid) з агрегацією по MAX
// ══════════════════════════════════════════════════════════
app.get('/api/profiles', async (req, res) => {
    const lang   = req.query.lang  || 'ru';
    const sort   = req.query.sort  || 'achievements';
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = 30;
    const offset = (page - 1) * limit;

    const sortMap = {
        achievements: 'achievement_num DESC',
        abyss:        'tower_floor DESC, tower_level DESC',
        updated:      'last_updated DESC'
    };
    const orderBy = sortMap[sort] || sortMap.achievements;

    console.log(`[API /profiles] page:${page} sort:${sort} lang:${lang}`);

    try {
        const totalRes = await db.get(`SELECT COUNT(DISTINCT uid) as cnt FROM builds`);

        const profiles = await db.all(`
            SELECT
                uid,
                MAX(nickname)        AS nickname,
                MAX(player_avatar)   AS avatar,
                MAX(player_level)    AS ar_level,
                MAX(world_level)     AS world_level,
                MAX(achievement_num) AS achievement_num,
                MAX(tower_floor)     AS tower_floor,
                MAX(tower_level)     AS tower_level,
                MAX(updated_at)      AS last_updated
            FROM builds
            GROUP BY uid
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const total = totalRes.cnt;
        console.log(`[API /profiles] ← стор.${page}/${Math.ceil(total/limit)} | ${profiles.length} профілів`);

        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            profiles: profiles.map(p => ({
                ...p,
                last_updated_rel: formatRelativeTime(p.last_updated, lang),
                last_updated_abs: formatDate(p.last_updated, lang)
            }))
        });
    } catch (e) {
        console.error('[API /profiles]', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ── Відносний час ──
function formatRelativeTime(ms, lang) {
    if (!ms) return '—';
    const diff = Date.now() - ms;
    const min  = Math.floor(diff / 60000);
    const hrs  = Math.floor(min  / 60);
    const days = Math.floor(hrs  / 24);
    const isRu = lang !== 'en';
    if (days === 0) {
        if (hrs === 0) {
            if (min < 2) return isRu ? 'только что' : 'just now';
            return isRu ? `${min} мин. назад` : `${min}m ago`;
        }
        return isRu ? `${hrs} ч. назад` : `${hrs}h ago`;
    }
    if (days === 1) return isRu ? 'вчера' : 'yesterday';
    if (days < 7)  return isRu ? `${days} дн. назад` : `${days}d ago`;
    if (days < 30) return isRu ? `${Math.floor(days/7)} нед. назад` : `${Math.floor(days/7)}w ago`;
    return isRu ? `${Math.floor(days/30)} мес. назад` : `${Math.floor(days/30)}mo ago`;
}

app.listen(port, () => {
    console.log(`\n[WANGSHENG] ════════════════════════════`);
    console.log(`[WANGSHENG] http://localhost:${port}`);
    console.log(`[WANGSHENG] ════════════════════════════\n`);
});