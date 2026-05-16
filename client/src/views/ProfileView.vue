<template>
  <div class="profile-dashboard">
    <div class="top-controls">
      <button @click="router.push('/')" class="back-btn">{{ t.back }}</button>
      <button class="refresh-btn" @click="refreshData" :disabled="cooldownTime > 0 || isLoading">
        <span v-if="isLoading">⟳ {{ t.loading }}</span>
        <span v-else-if="cooldownTime > 0">⏳ {{ t.cooldown }} {{ formatTime(cooldownTime) }}</span>
        <span v-else>↻ {{ t.refresh }}</span>
      </button>
    </div>

    <div v-if="errorMessage" class="status-error"><span>☽</span> {{ errorMessage }}</div>

    <div v-else-if="isLoading && !playerData" class="loading-screen">
      <div class="loading-butterfly"><div class="wing-l"></div><div class="wing-r"></div></div>
      <p>{{ t.loading }}</p>
    </div>

    <div v-else-if="playerData" class="data-grid">

      <header class="player-header">
        <div class="avatar-ring">
          <img v-if="playerData.avatar" :src="playerData.avatar" class="avatar-img" />
          <div v-else class="avatar-placeholder">{{ playerData.nickname?.[0] || '?' }}</div>
        </div>
        <div class="player-info">
          <div class="player-name-row">
            <h2 class="player-name">{{ playerData.nickname }}</h2>
            <span class="ar-badge">AR {{ playerData.level }}</span>
            <span v-if="playerData.worldLevel" class="wl-badge">WL {{ playerData.worldLevel }}</span>
          </div>
          <p class="signature" v-if="playerData.signature">"{{ playerData.signature }}"</p>
          <div class="player-stats-row">
            <div class="pstat" v-if="playerData.achievementNum">
              <span>🏆</span><span class="pstat-val">{{ playerData.achievementNum }}</span><span class="pstat-label">{{ t.achievements }}</span>
            </div>
            <div class="pstat" v-if="playerData.towerFloor">
              <span>🌀</span><span class="pstat-val">{{ playerData.towerFloor }}-{{ playerData.towerLevel }}</span><span class="pstat-label">{{ t.abyss }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="character-list">
        <div
          v-for="char in playerData.characters" :key="char.build_id"
          class="char-card" :class="{ active: activeCharacter?.build_id === char.build_id }"
          @click="selectCharacter(char)"
        >
          <div class="char-img-wrap">
            <img v-if="char.icon" :src="char.icon" class="char-img" />
            <div v-else class="char-img-mock">?</div>
            <span class="char-level-badge">Lv.{{ char.level }}</span>
          </div>
          <div class="char-meta">
            <span class="char-name">{{ currentLang === 'ru' ? char.nameRu : char.nameEn }}</span>
            <div class="char-badges">
              <span class="badge-con">C{{ char.constellations }}</span>
              <span class="badge-fship">🤍 {{ char.friendship }}</span>
            </div>
            <div class="rank-box">
              <div v-if="(char.key === 'Furina' || char.key === 'Navia') && char.specialDmgRank !== null">
                <template v-if="getBestRankType(char) === 'special'">
                  <span class="top-text">{{ t.top }} {{ ((Number(char.specialDmgRank) / Number(char.total)) * 100).toFixed(2) }}%</span>
                  <span class="rank-text">{{ char.specialDmgRank }}/{{ char.total }}</span>
                  <span class="rank-tag skill-tag">{{ char.key === 'Navia' ? 'ROTATION' : 'E DMG' }}</span>
                </template>
                <template v-else>
                  <span class="top-text">{{ t.top }} {{ ((Number(char.rank) / Number(char.total)) * 100).toFixed(2) }}%</span>
                  <span class="rank-text">{{ char.rank }}/{{ char.total }}</span>
                  <span class="rank-tag hp-tag">{{ char.key === 'Furina' ? 'HP' : 'ATK' }}</span>
                </template>
              </div>
              <div v-else>
                <span class="top-text">{{ t.top }} {{ ((Number(char.rank) / Number(char.total)) * 100).toFixed(2) }}%</span>
                <span class="rank-text">{{ char.rank }}/{{ char.total }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Transition name="expand">
        <div v-if="activeCharacter" class="build-panel-wrapper">
          <div class="panel-header">
            <div class="panel-char-title">
              <img v-if="activeCharacter.icon" :src="activeCharacter.icon" class="panel-char-icon" />
              <div>
                <h3 class="panel-name">{{ currentLang === 'ru' ? activeCharacter.nameRu : activeCharacter.nameEn }}</h3>
                <div class="panel-badges">
                  <span class="badge-lv">Lv.{{ activeCharacter.level }}</span>
                  <span class="badge-fship">🤍 {{ activeCharacter.friendship }}</span>
                </div>
              </div>
            </div>

            <div class="panel-header-right">
              <button
                v-if="activeCharacter.key === 'Furina' || activeCharacter.key === 'Navia'"
                @click="openSpecialLeaderboard"
                class="leaderboard-link-btn"
              >
                ⚔️ {{ currentLang === 'ru' ? (activeCharacter.key === 'Navia' ? 'Топ ротации' : 'Топ по E DMG') : (activeCharacter.key === 'Navia' ? 'Rotation Leaderboard' : 'E DMG Leaderboard') }}
              </button>
              <button @click="closeBuild" class="close-btn">✕ {{ t.close }}</button>
            </div>
          </div>

          <div class="build-columns">
            <div class="build-col col-left">
              <section class="section-block">
                <h4 class="section-label">{{ t.constellations }}</h4>
                <div class="constellation-grid">
                  <div
                    v-for="(con, idx) in getConstellations(activeCharacter)" :key="idx"
                    class="con-node" :class="{ unlocked: idx < activeCharacter.constellations }"
                    :title="con.name?.[currentLang] || con.name?.en || `C${idx+1}`"
                  >
                    <img v-if="con.icon" :src="con.icon" class="con-icon" />
                    <span v-else class="con-num">C{{ idx + 1 }}</span>
                    <div class="con-glow" v-if="idx < activeCharacter.constellations"></div>
                  </div>
                </div>
              </section>

              <section class="section-block">
                <h4 class="section-label">{{ t.stats.header }}</h4>
                <div class="stats-list">
                  <div class="stat-row"><span class="sname">{{ t.stats.MAX_HP }}</span><span class="sval">{{ Math.round(activeCharacter.stats.hp).toLocaleString() }}</span></div>
                  <div class="stat-row"><span class="sname">{{ t.stats.ATK }}</span><span class="sval">{{ Math.round(activeCharacter.stats.attack).toLocaleString() }}</span></div>
                  <div class="stat-row"><span class="sname">{{ t.stats.DEF }}</span><span class="sval">{{ Math.round(activeCharacter.stats.defense).toLocaleString() }}</span></div>
                  <div class="stat-row"><span class="sname">{{ t.stats.EM }}</span><span class="sval">{{ Math.round(activeCharacter.stats.mastery) }}</span></div>
                  <div class="stat-row"><span class="sname">{{ t.stats.CR }}</span><span class="sval crit">{{ activeCharacter.stats.critRate.toFixed(1) }}%</span></div>
                  <div class="stat-row"><span class="sname">{{ t.stats.CD }}</span><span class="sval crit">{{ activeCharacter.stats.critDamage.toFixed(1) }}%</span></div>
                  <div class="stat-row"><span class="sname">{{ t.stats.ER }}</span><span class="sval">{{ activeCharacter.stats.er.toFixed(1) }}%</span></div>
                </div>
                <div class="total-cv" :class="getTotalCVClass(activeCharacter)">
                  <span class="cv-label">{{ currentLang === 'ru' ? 'Общая КМ' : 'Total CV' }}</span>
                  <span class="cv-val">{{ getTotalCV(activeCharacter).toFixed(1) }}</span>
                </div>
              </section>

              <section class="section-block" v-if="activeCharacter.weapon && activeCharacter.weapon.nameEn !== 'None'">
                <h4 class="section-label">{{ t.weapon }}</h4>
                <div class="weapon-card">
                  <img v-if="activeCharacter.weapon.icon" :src="activeCharacter.weapon.icon" class="weapon-img" />
                  <div class="weapon-details">
                    <span class="w-name">{{ currentLang === 'ru' ? activeCharacter.weapon.nameRu : activeCharacter.weapon.nameEn }}</span>
                    <span class="w-sub">Lv.{{ activeCharacter.weapon.level }} <span class="w-ref">R{{ activeCharacter.weapon.refinement }}</span></span>
                  </div>
                </div>
              </section>
            </div>

            <div class="build-col col-center">
              <div class="char-art-frame">
                <img v-if="activeCharacter.icon" :src="activeCharacter.icon" class="char-art-big" />
                <div v-else class="char-art-placeholder">{{ currentLang === 'ru' ? activeCharacter.nameRu : activeCharacter.nameEn }}</div>
                <div class="char-art-overlay"></div>
              </div>
              <div class="radar-wrap">
                <StatRadar :stats="activeCharacter.stats" :eliteStats="activeCharacter.eliteStats" :lang="currentLang" />
              </div>
            </div>

            <div class="build-col col-right">
              <section class="section-block" v-if="activeCharacter.artifacts?.length">
                <h4 class="section-label">{{ t.artifacts }}</h4>
                <div class="artifacts-col">
                  <div
                    class="art-card" :class="getCVClass(art)"
                    v-for="(art, idx) in activeCharacter.artifacts" :key="idx"
                  >
                    <div class="art-top-row">
                      <div class="art-img-wrap">
                        <img v-if="art.icon" :src="art.icon" class="art-img" />
                        <div v-else class="art-img-mock">✦</div>
                      </div>
                      <div class="art-header-info">
                        <span class="art-slot">{{ getEquipTypeName(art.equipType) }}</span>
                        <span class="art-set">{{ art.setName?.[currentLang] || art.setName?.en }}</span>
                        <span class="art-lv">+{{ Number(art.level) - 1 }}</span>
                      </div>
                      <div class="cv-badge" :class="getCVClass(art)">
                        {{ getArtifactCV(art).toFixed(1) }} {{ currentLang === 'ru' ? 'КМ' : 'CV' }}
                      </div>
                    </div>
                    <div class="art-mainstat">
                      <span class="ms-name">{{ getStatName(art.mainstat?.id) }}</span>
                      <span class="ms-val">{{ art.mainstat?.value }}</span>
                    </div>
                    <div class="art-substats">
                      <div class="sub-row" v-for="(sub, si) in art.substats" :key="si">
                        <span class="sub-name">{{ getStatName(sub.id) }}</span>
                        <span class="sub-val" :class="{ 'sub-crit': sub.id === CR || sub.id === CD }">{{ sub.value }}</span>
                      </div>
                      <div v-if="!art.substats?.length" class="sub-empty">{{ t.hiddenStats }}</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StatRadar from '../components/StatRadar.vue';
import { currentLang } from '../store/lang';
import { addProfileTab } from '../store/profileTabs';

const route  = useRoute();
const router = useRouter();

const playerData = ref<any>(null);
const isLoading = ref(true);
const errorMessage = ref<string|null>(null);
const activeCharacter = ref<any>(null);

const translations: any = {
  ru: {
    back: '← Назад', refresh: 'Обновить данные', loading: 'Загрузка...', cooldown: 'Обновление через',
    top: 'Топ', weapon: 'ОРУЖИЕ', artifacts: 'АРТЕФАКТЫ', constellations: 'СОЗВЕЗДИЯ',
    close: 'Закрыть', hiddenStats: 'Данные скрыты', achievements: 'Достижений', abyss: 'Бездна',
    stats: { header: 'ХАРАКТЕРИСТИКИ', MAX_HP: 'Макс. HP', ATK: 'Сила Атаки', DEF: 'Защита', EM: 'Мастерство', CR: 'Крит. Шанс', CD: 'Крит. Урон', ER: 'Восст. Энергии' }
  },
  en: {
    back: '← Back', refresh: 'Refresh Data', loading: 'Loading...', cooldown: 'Refresh in',
    top: 'Top', weapon: 'WEAPON', artifacts: 'ARTIFACTS', constellations: 'CONSTELLATIONS',
    close: 'Close', hiddenStats: 'Data hidden', achievements: 'Achievements', abyss: 'Abyss',
    stats: { header: 'STATS', MAX_HP: 'Max HP', ATK: 'ATK', DEF: 'DEF', EM: 'Elemental Mastery', CR: 'CRIT Rate', CD: 'CRIT DMG', ER: 'Energy Recharge' }
  }
};
const t = computed(() => translations[currentLang.value]);

// ── Special Top helpers ─────────────────────────────
function getBestRankType(char: any): string {
  if (char.specialDmgRank === null || char.specialDmgRank === undefined) return 'default';
  const defaultRatio = char.rank / char.total;
  const specialRatio = char.specialDmgRank / char.total;
  return specialRatio <= defaultRatio ? 'special' : 'default';
}
function openSpecialLeaderboard() {
  if (activeCharacter.value.key === 'Furina') router.push('/leaderboard/Furina?view=skill_dmg');
  if (activeCharacter.value.key === 'Navia') router.push('/leaderboard/Navia?view=rotation_dmg');
}

// ── Stat/equip helpers ─────────────────────────────
const equipTypeMap: any = {
  'Цветок жизни':{ ru:'Цветок жизни', en:'Flower of Life' },
  'Перо смерти': { ru:'Перо смерти',  en:'Plume of Death' },
  'Пески времени':{ ru:'Пески времени', en:'Sands of Eon' },
  'Кубок пространства':{ ru:'Кубок пространства', en:'Goblet of Eonothem' },
  'Корона разума':{ ru:'Корона разума', en:'Circlet of Logos' }
};
const getEquipTypeName = (id: string) => equipTypeMap[id]?.[currentLang.value] || id;

const propMap: any = {
  'FIGHT_PROP_BASE_ATTACK':{ru:'Баз.Атака',en:'Base ATK'},'FIGHT_PROP_HP':{ru:'HP',en:'HP'},
  'FIGHT_PROP_ATTACK':{ru:'Сила атаки',en:'ATK'},'FIGHT_PROP_DEFENSE':{ru:'Защита',en:'DEF'},
  'FIGHT_PROP_HP_PERCENT':{ru:'HP%',en:'HP%'},'FIGHT_PROP_ATTACK_PERCENT':{ru:'Атака%',en:'ATK%'},
  'FIGHT_PROP_DEFENSE_PERCENT':{ru:'Защита%',en:'DEF%'},'FIGHT_PROP_CRITICAL':{ru:'Крит. Шанс',en:'CRIT Rate'},
  'FIGHT_PROP_CRITICAL_HURT':{ru:'Крит. Урон',en:'CRIT DMG'},'FIGHT_PROP_CHARGE_EFFICIENCY':{ru:'Восст. энергии',en:'Energy Recharge'},
  'FIGHT_PROP_HEAL_ADD':{ru:'Бонус лечения',en:'Healing Bonus'},'FIGHT_PROP_ELEMENT_MASTERY':{ru:'Мастерство',en:'Elemental Mastery'},
  'FIGHT_PROP_PHYSICAL_ADD_HURT':{ru:'Физ. урон%',en:'Phys DMG%'},'FIGHT_PROP_FIRE_ADD_HURT':{ru:'Пиро%',en:'Pyro DMG%'},
  'FIGHT_PROP_ELEC_ADD_HURT':{ru:'Электро%',en:'Electro DMG%'},'FIGHT_PROP_WATER_ADD_HURT':{ru:'Гидро%',en:'Hydro DMG%'},
  'FIGHT_PROP_WIND_ADD_HURT':{ru:'Анемо%',en:'Anemo DMG%'},'FIGHT_PROP_ICE_ADD_HURT':{ru:'Крио%',en:'Cryo DMG%'},
  'FIGHT_PROP_ROCK_ADD_HURT':{ru:'Гео%',en:'Geo DMG%'},'FIGHT_PROP_GRASS_ADD_HURT':{ru:'Дендро%',en:'Dendro DMG%'}
};
const getStatName = (id: string) => propMap[id]?.[currentLang.value] || id;
const CR = 'FIGHT_PROP_CRITICAL', CD = 'FIGHT_PROP_CRITICAL_HURT';

function parseNum(v: any): number { if(!v)return 0; return parseFloat(String(v).replace('%','').replace(',','.'))||0; }
function getSubValue(art:any,id:string){return parseNum(art.substats?.find((s:any)=>s.id===id)?.value);}
function getMainValue(art:any,id:string){return art.mainstat?.id===id?parseNum(art.mainstat.value):0;}
function isCirclet(art:any){return art.equipType==='Корона разума';}
function getArtifactCV(art:any):number{
  const cr=getSubValue(art,CR),cd=getSubValue(art,CD);
  if(isCirclet(art)){if(art.mainstat?.id===CR)return cd;if(art.mainstat?.id===CD)return cr*2;}
  return cr*2+cd;
}
function getTotalCV(char:any):number{
  if(!char?.artifacts)return 0;let t=0;
  for(const art of char.artifacts){t+=getArtifactCV(art);if(isCirclet(art)&&art.mainstat?.id===CR)t+=getMainValue(art,CR)*2;if(isCirclet(art)&&art.mainstat?.id===CD)t+=getMainValue(art,CD);}
  return t;
}
function getTotalCVClass(char:any):string{
  const cv=getTotalCV(char);
  if(cv<100)return 'tcv-gray';if(cv<150)return 'tcv-blue';if(cv<180)return 'tcv-purple';
  if(cv<210)return 'tcv-orange';if(cv<240)return 'tcv-gold';if(cv<270)return 'tcv-cyan';return 'tcv-red';
}
function getCVClass(art:any):string{
  const cv=getArtifactCV(art),circ=isCirclet(art)&&(art.mainstat?.id===CR||art.mainstat?.id===CD);
  const r=circ?[10,15,25,30,35,45]:[15,30,35,45,50,53];
  if(cv<r[0]!)return 'cv-gray';if(cv<r[1]!)return 'cv-blue';if(cv<r[2]!)return 'cv-purple';
  if(cv<r[3]!)return 'cv-orange';if(cv<r[4]!)return 'cv-gold';if(cv<r[5]!)return 'cv-cyan';return 'cv-red';
}
function getConstellations(char:any){
  if(char.constellationsData?.length)return char.constellationsData;
  return Array.from({length:6},(_,i)=>({name:{ru:`C${i+1}`,en:`C${i+1}`},icon:null}));
}

// ── Timer ──────────────────────────────────────────
const cooldownTime = ref(0); let timerInterval:any=null;
const formatTime=(ms:number)=>{const s=Math.ceil(ms/1000);return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
const updateTimer=(nextAt:number)=>{if(timerInterval)clearInterval(timerInterval);timerInterval=setInterval(()=>{const r=nextAt-Date.now();if(r<=0){cooldownTime.value=0;clearInterval(timerInterval);}else{cooldownTime.value=r;}},1000);};

// ── Fetch ──────────────────────────────────────────
const fetchData = async (forceRefresh=false) => {
  const currentUid = route.params.uid as string;
  if (!currentUid) return;

  isLoading.value=true; errorMessage.value=null;
  console.log(`[ПРОФІЛЬ] UID:${currentUid} force:${forceRefresh}`);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${currentUid}?refresh=${forceRefresh}`);
    if(res.status===429){const d=await res.json();updateTimer(d.nextRefreshReadyAt);return;}
    if(!res.ok){const d=await res.json().catch(()=>({error:'Error'}));throw new Error(d.error||'Profile not found');}
    playerData.value=await res.json();
    console.log(`[ПРОФІЛЬ] ${playerData.value.nickname} AR${playerData.value.level}`);
    
    addProfileTab({uid: currentUid, name: playerData.value.nickname});
    
    if(playerData.value.nextRefreshReadyAt>Date.now())updateTimer(playerData.value.nextRefreshReadyAt);
    const bid=route.query.build;
    if(bid&&playerData.value.characters){const t=playerData.value.characters.find((c:any)=>String(c.build_id)===String(bid));if(t)activeCharacter.value=t;}
    else if(activeCharacter.value){const u=playerData.value.characters.find((c:any)=>c.build_id===activeCharacter.value.build_id);if(u)activeCharacter.value=u;}
  } catch(e:any){errorMessage.value=e.message;console.error(`[ПРОФІЛЬ] ✗ ${e.message}`);}
  finally{isLoading.value=false;}
};

const refreshData=()=>fetchData(true);
const selectCharacter=(char:any)=>{
  if(activeCharacter.value?.build_id===char.build_id){activeCharacter.value=null;router.replace({path:route.path});}
  else{activeCharacter.value=char;router.replace({query:{build:char.build_id}});console.log(`[ПРОФІЛЬ] → ${char.nameEn}`);}
};
const closeBuild=()=>{activeCharacter.value=null;router.replace({path:route.path});};

watch(() => route.params.uid, (newUid, oldUid) => {
  if (newUid && newUid !== oldUid) {
    activeCharacter.value = null;
    fetchData(false);
  }
});

onMounted(()=>fetchData(false));
onUnmounted(()=>{if(timerInterval)clearInterval(timerInterval);});
</script>

<style scoped>
/* Base layout */
.profile-dashboard{width:100%;max-width:1920px;margin:0 auto;}
.top-controls{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;}
.back-btn{background:transparent;border:1px solid var(--ht-border-light);color:var(--ht-text-muted);cursor:pointer;padding:7px 16px;border-radius:4px;font-family:var(--font-heading);font-size:0.85rem;letter-spacing:0.06em;transition:all 0.2s;}
.back-btn:hover{color:var(--ht-text);border-color:var(--ht-accent);}
.refresh-btn{background:linear-gradient(135deg,var(--ht-accent-dark),var(--ht-accent));color:#f0e4d0;border:1px solid var(--ht-accent-light);cursor:pointer;padding:8px 22px;border-radius:4px;font-family:var(--font-heading);font-size:0.88rem;letter-spacing:0.08em;transition:all 0.25s;box-shadow:0 2px 12px rgba(176,50,24,0.3);}
.refresh-btn:hover:not(:disabled){box-shadow:0 4px 20px rgba(176,50,24,0.55);transform:translateY(-1px);}
.refresh-btn:disabled{background:var(--ht-surface);border-color:var(--ht-border);color:var(--ht-text-dim);cursor:not-allowed;box-shadow:none;}
.status-error{text-align:center;padding:40px;color:var(--ht-accent-light);border:1px solid var(--ht-accent-dark);border-radius:8px;background:rgba(176,50,24,0.08);font-family:var(--font-heading);}
.loading-screen{text-align:center;padding:80px 0;color:var(--ht-text-muted);font-family:var(--font-heading);}
.loading-butterfly{display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;}
.wing-l,.wing-r{width:24px;height:32px;background:var(--ht-ghost-dim);border:1px solid var(--ht-ghost);border-radius:50% 0 50% 50%;animation:flutter 0.8s ease-in-out infinite alternate;}
.wing-r{border-radius:0 50% 50% 50%;animation-direction:alternate-reverse;}
@keyframes flutter{from{transform:rotateY(0)}to{transform:rotateY(60deg)}}

/* Player header */
.player-header{display:flex;align-items:center;gap:24px;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--ht-border-light);}
.avatar-ring{flex-shrink:0;width:90px;height:90px;border-radius:50%;border:2px solid var(--ht-accent);padding:3px;background:var(--ht-bg-3);box-shadow:0 0 20px rgba(176,50,24,0.4);}
.avatar-img{width:100%;height:100%;border-radius:50%;object-fit:cover;}
.avatar-placeholder{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:2rem;color:var(--ht-accent-light);}
.player-name-row{display:flex;align-items:baseline;gap:12px;margin-bottom:6px;}
.player-name{font-family:var(--font-heading);font-size:1.6rem;font-weight:700;color:var(--ht-text);margin:0;}
.ar-badge{font-family:var(--font-mono);font-size:0.85rem;color:var(--ht-gold-light);background:rgba(196,152,30,0.15);border:1px solid var(--ht-gold);padding:2px 10px;border-radius:4px;}
.wl-badge{font-family:var(--font-mono);font-size:0.8rem;color:var(--ht-ghost);background:var(--ht-ghost-dim);border:1px solid rgba(189,168,210,0.4);padding:2px 8px;border-radius:4px;}
.signature{color:var(--ht-text-muted);font-style:italic;margin:0 0 10px;}
.player-stats-row{display:flex;gap:20px;}
.pstat{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:0.85rem;}
.pstat-val{color:var(--ht-gold-light);font-weight:700;}
.pstat-label{color:var(--ht-text-muted);}

/* Character list */
.character-list{display:grid;grid-template-columns:repeat(auto-fill,220px);justify-content:center;gap:14px;margin-bottom:28px;}
.char-card{background:var(--ht-bg-3);border:1px solid var(--ht-border);border-radius:8px;padding:12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all 0.22s;}
.char-card:hover{border-color:var(--ht-border-light);transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.4);}
.char-card.active{border-color:var(--ht-accent);background:rgba(176,50,24,0.10);box-shadow:0 0 16px rgba(176,50,24,0.25);}
.char-img-wrap{position:relative;flex-shrink:0;}
.char-img{width:52px;height:52px;object-fit:contain;}
.char-img-mock{width:52px;height:52px;border:1px dashed var(--ht-border-light);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--ht-text-dim);}
.char-level-badge{position:absolute;bottom:-4px;right:-4px;background:var(--ht-accent-dark);color:#f0d8c0;font-size:0.6rem;font-family:var(--font-mono);padding:1px 5px;border-radius:3px;border:1px solid var(--ht-accent);}
.char-meta{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;}
.char-name{font-family:var(--font-heading);font-size:0.9rem;color:var(--ht-text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.char-badges{display:flex;gap:6px;}
.badge-con{font-family:var(--font-mono);font-size:0.72rem;background:rgba(176,50,24,0.2);color:var(--ht-accent-light);border:1px solid var(--ht-accent-dark);padding:1px 6px;border-radius:3px;}
.badge-fship{font-family:var(--font-mono);font-size:0.72rem;color:var(--ht-gold-light);background:rgba(196,152,30,0.1);border:1px solid rgba(196,152,30,0.3);padding:1px 6px;border-radius:3px;}
.rank-box{display:flex;flex-direction:column;background:var(--ht-bg);border:1px solid var(--ht-border);border-radius:4px;padding:4px 6px;font-family:var(--font-mono);}
.top-text{font-size:0.68rem;color:var(--ht-text-muted);}
.rank-text{font-size:0.8rem;color:var(--ht-gold-light);font-weight:700;}
.rank-tag{font-size:0.6rem;padding:1px 5px;border-radius:3px;align-self:flex-start;margin-top:2px;}
.skill-tag{background:rgba(189,168,210,0.15);color:var(--ht-ghost);border:1px solid rgba(189,168,210,0.3);}
.hp-tag{background:rgba(176,50,24,0.15);color:var(--ht-accent-light);border:1px solid var(--ht-accent-dark);}

/* Build panel */
.build-panel-wrapper{background:var(--ht-bg-2);border:1px solid var(--ht-border-light);border-left:3px solid var(--ht-accent);border-radius:10px;padding:24px;margin-top:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
.panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--ht-border);}
.panel-char-title{display:flex;align-items:center;gap:14px;}
.panel-char-icon{width:48px;height:48px;object-fit:contain;border-radius:6px;border:1px solid var(--ht-border-light);}
.panel-name{font-family:var(--font-heading);font-size:1.4rem;color:var(--ht-text);margin:0 0 6px;}
.panel-badges{display:flex;gap:8px;}
.badge-lv{font-family:var(--font-mono);font-size:0.78rem;background:var(--ht-surface);border:1px solid var(--ht-border-light);color:var(--ht-text-muted);padding:1px 8px;border-radius:3px;}
.panel-header-right{display:flex;align-items:center;gap:10px;}
.leaderboard-link-btn{
  background:rgba(189,168,210,0.12);border:1px solid rgba(189,168,210,0.4);
  color:var(--ht-ghost);cursor:pointer;padding:7px 16px;border-radius:6px;
  font-family:var(--font-heading);font-size:0.82rem;letter-spacing:0.05em;
  transition:all 0.2s;display:flex;align-items:center;gap:6px;
}
.leaderboard-link-btn:hover{background:rgba(189,168,210,0.2);border-color:var(--ht-ghost);color:#d4bce8;box-shadow:0 0 12px rgba(189,168,210,0.2);}
.close-btn{background:transparent;border:1px solid var(--ht-accent-dark);color:var(--ht-accent-light);cursor:pointer;padding:6px 16px;border-radius:4px;font-family:var(--font-heading);font-size:0.82rem;transition:all 0.2s;}
.close-btn:hover{background:rgba(176,50,24,0.15);}

/* Build columns */
.build-columns{display:grid;grid-template-columns:280px 1fr 320px;gap:20px;}
.build-col{display:flex;flex-direction:column;gap:16px;}
.section-block{background:var(--ht-bg-3);border:1px solid var(--ht-border);border-radius:8px;padding:16px;}
.section-label{font-family:var(--font-heading);font-size:0.72rem;letter-spacing:0.14em;color:var(--ht-accent-light);margin:0 0 14px;text-transform:uppercase;border-bottom:1px solid var(--ht-border);padding-bottom:8px;}
.constellation-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.con-node{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:1px solid var(--ht-border);border-radius:50%;background:var(--ht-bg);opacity:0.35;transition:all 0.2s;overflow:hidden;}
.con-node.unlocked{opacity:1;border-color:var(--ht-accent);box-shadow:0 0 10px rgba(176,50,24,0.4);background:rgba(176,50,24,0.12);}
.con-icon{width:100%;height:100%;object-fit:contain;padding:4px;}
.con-num{font-family:var(--font-mono);font-size:0.8rem;color:var(--ht-text-muted);}
.con-glow{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(207,69,37,0.25) 0%,transparent 70%);pointer-events:none;}
.stats-list{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
.stat-row{display:flex;justify-content:space-between;align-items:center;font-family:var(--font-mono);font-size:0.92rem;border-bottom:1px solid var(--ht-border);padding-bottom:5px;}
.sname{color:var(--ht-text-muted);}
.sval{color:var(--ht-ghost);font-weight:700;}
.sval.crit{color:var(--ht-accent-light);}
.total-cv{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:6px;margin-top:4px;border:1px solid currentColor;background:rgba(0,0,0,0.2);}
.cv-label{font-family:var(--font-heading);font-size:0.8rem;color:inherit;opacity:0.8;letter-spacing:0.06em;}
.cv-val{font-family:var(--font-mono);font-size:1.5rem;font-weight:800;color:inherit;}
.tcv-gray{color:#8a8a8a}.tcv-blue{color:#4a9fd4}.tcv-purple{color:#a070c8}.tcv-orange{color:#d47830}.tcv-gold{color:var(--ht-gold-light)}.tcv-cyan{color:#40d8f0}.tcv-red{color:var(--ht-accent-light)}
.weapon-card{display:flex;align-items:center;gap:14px;background:var(--ht-bg);border:1px solid var(--ht-border);border-radius:6px;padding:10px;}
.weapon-img{width:52px;height:52px;object-fit:contain;}
.weapon-details{display:flex;flex-direction:column;}
.w-name{font-family:var(--font-heading);font-weight:600;color:var(--ht-gold-light);font-size:0.9rem;}
.w-sub{font-family:var(--font-mono);font-size:0.8rem;color:var(--ht-text-muted);}
.w-ref{color:var(--ht-ghost);font-weight:700;margin-left:6px;}
.col-center{gap:20px;}
.char-art-frame{position:relative;border:1px solid var(--ht-border);border-radius:8px;overflow:hidden;background:var(--ht-bg-3);min-height:280px;display:flex;align-items:center;justify-content:center;}
.char-art-big{width:100%;height:280px;object-fit:contain;object-position:top;filter:drop-shadow(0 0 20px rgba(176,50,24,0.4));transition:transform 0.4s;}
.char-art-frame:hover .char-art-big{transform:scale(1.04);}
.char-art-overlay{position:absolute;inset:0;background:linear-gradient(to top,var(--ht-bg-3) 0%,transparent 50%);pointer-events:none;}
.char-art-placeholder{color:var(--ht-text-dim);font-family:var(--font-heading);font-size:1.2rem;text-align:center;padding:20px;}
.radar-wrap{background:var(--ht-bg-3);border:1px solid var(--ht-border);border-radius:8px;padding:12px;flex:1;}
.col-right{overflow-y:auto;max-height:800px;}
.artifacts-col{display:flex;flex-direction:column;gap:10px;}
.art-card{position:relative;background:var(--ht-bg);border:1px solid var(--ht-border);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:8px;overflow:visible;transition:border-color 0.2s;isolation:isolate;}
.art-card::after{content:'';position:absolute;inset:0;border-radius:8px;pointer-events:none;z-index:-1;outline:1px solid var(--ht-accent);box-shadow:0 0 0 1px var(--ht-accent),0 0 10px rgba(176,50,24,0.45),inset 0 0 8px rgba(176,50,24,0.08);clip-path:inset(50% 0px 50% 0px round 8px);opacity:0;}
.art-card:hover::after{animation:artBorderReveal 0.4s cubic-bezier(0.22,1,0.36,1) forwards;}
@keyframes artBorderReveal{0%{clip-path:inset(50% 0px 50% 0px round 8px);opacity:1;}100%{clip-path:inset(0% 0px 0% 0px round 8px);opacity:1;}}
.art-top-row{display:flex;gap:10px;align-items:flex-start;}
.art-img-wrap{flex-shrink:0;}
.art-img{width:44px;height:44px;object-fit:contain;}
.art-img-mock{width:44px;height:44px;border-radius:6px;border:1px dashed var(--ht-border-light);display:flex;align-items:center;justify-content:center;color:var(--ht-text-dim);font-size:0.9rem;}
.art-header-info{flex:1;display:flex;flex-direction:column;gap:2px;}
.art-slot{font-size:0.65rem;color:var(--ht-gold-light);text-transform:uppercase;letter-spacing:0.12em;font-family:var(--font-heading);}
.art-set{font-size:0.78rem;color:var(--ht-text-muted);font-weight:600;}
.art-lv{display:inline-block;font-size:0.68rem;background:rgba(176,50,24,0.2);color:var(--ht-accent-light);border:1px solid var(--ht-accent-dark);padding:1px 6px;border-radius:3px;font-family:var(--font-mono);align-self:flex-start;}
.cv-badge{flex-shrink:0;font-family:var(--font-mono);font-size:0.7rem;font-weight:700;border:1px solid currentColor;padding:2px 6px;border-radius:3px;white-space:nowrap;}
.art-mainstat{display:flex;justify-content:space-between;background:var(--ht-surface);padding:6px 10px;border-radius:4px;border:1px solid var(--ht-border);}
.ms-name{font-size:0.82rem;color:var(--ht-text-muted);}
.ms-val{font-family:var(--font-mono);font-size:0.9rem;font-weight:700;color:var(--ht-gold-light);}
.art-substats{display:flex;flex-direction:column;gap:3px;}
.sub-row{display:flex;justify-content:space-between;font-size:0.8rem;}
.sub-name{color:var(--ht-text-muted);}
.sub-val{font-family:var(--font-mono);font-weight:700;color:var(--ht-text);}
.sub-val.sub-crit{color:var(--ht-accent-light);}
.sub-empty{color:var(--ht-text-dim);font-style:italic;font-size:0.75rem;}
.cv-gray{color:#6a6a6a;border-color:#6a6a6a}.cv-blue{color:#4a9fd4;border-color:#4a9fd4}.cv-purple{color:#a070c8;border-color:#a070c8}.cv-orange{color:#d47830;border-color:#d47830}.cv-gold{color:var(--ht-gold-light);border-color:var(--ht-gold-light)}.cv-cyan{color:#40d8f0;border-color:#40d8f0}.cv-red{color:var(--ht-accent-light);border-color:var(--ht-accent-light)}
.expand-enter-active,.expand-leave-active{transition:all 0.32s ease;max-height:2000px;opacity:1;}
.expand-enter-from,.expand-leave-to{max-height:0;opacity:0;overflow:hidden;}

/* ══ МОБІЛЬНА АДАПТАЦІЯ: ПРОФІЛЬ ══ */
@media (max-width: 768px) {
  .top-controls { flex-direction: column; gap: 12px; align-items: stretch; }
  .refresh-btn { width: 100%; justify-content: center; }
  .player-header { flex-direction: column; text-align: center; gap: 16px; padding-bottom: 16px; }
  .player-name-row { justify-content: center; flex-wrap: wrap; }
  .player-stats-row { justify-content: center; flex-wrap: wrap; }
  .character-list { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .char-card { padding: 8px; flex-direction: column; text-align: center; }
  .char-meta { align-items: center; }
  .char-name { white-space: normal; }
  .build-columns { grid-template-columns: 1fr; gap: 20px; }
  .panel-header { flex-direction: column; gap: 16px; text-align: center; }
  .panel-char-title { flex-direction: column; }
  .panel-header-right { flex-direction: column; width: 100%; }
  .leaderboard-link-btn, .close-btn { width: 100%; justify-content: center; }
  .char-art-big { height: 200px; }
  .col-right { max-height: none; overflow-y: visible; }
}

/* ═══════ MOBILE ADAPTIVE ═══════ */
@media(max-width:768px){
  /* Top controls - 2 buttons full width */
  .top-controls{flex-direction:row;gap:8px;}
  .back-btn, .refresh-btn{flex:1;text-align:center;justify-content:center;padding:10px 8px;font-size:.8rem;}

  /* Character grid - 2 per row */
  .character-list{grid-template-columns:repeat(2,1fr) !important;gap:10px;}
  .char-card{padding:10px;gap:8px;}
  .char-img{width:44px;height:44px;}

  /* Build panel */
  .build-panel-wrapper{padding:14px 12px;}
  .panel-header{flex-wrap:wrap;gap:8px;}
  .panel-header-right{width:100%;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;}
  .leaderboard-link-btn{font-size:.75rem;padding:6px 10px;}
  .close-btn{font-size:.75rem;padding:6px 12px;}

  /* Special DMG panel */
  .sdmg-blocks{flex-wrap:wrap;}
  .sdmg-block{flex:1 1 40%;min-width:80px;padding:10px 12px;}
  .sdmg-divider{display:none;}
  .sdmg-value{font-size:1.1rem;}

  /* Build columns - single column, ordered bottom-to-top */
  .build-columns{
    display:flex !important;
    flex-direction:column;
    gap:14px;
  }
  /* Order: name/photo -> stats -> weapon -> constellations -> radar -> artifacts */
  .col-center{order:1;}
  .col-left{order:2;}
  .col-right{order:3;}

  /* Char art */
  .char-art-frame{min-height:200px;}
  .char-art-big{height:200px;}

  /* Stats */
  .section-block{padding:12px;}
  .stat-row{font-size:.85rem;}

  /* Radar */
  .radar-wrap{min-height:260px;}

  /* Artifacts - horizontal scroll */
  .artifacts-col{
    display:flex;
    flex-direction:row;
    gap:10px;
    overflow-x:auto;
    padding-bottom:8px;
    scrollbar-width:thin;
    scrollbar-color: var(--ht-accent-dark) var(--ht-bg);
    -webkit-overflow-scrolling:touch;
  }
  .art-card{
    min-width:240px;
    flex-shrink:0;
  }

  /* Constellation grid */
  .constellation-grid{grid-template-columns:repeat(6,1fr);gap:6px;}
  .con-node{font-size:.7rem;}

  /* Player header */
  .player-header{flex-direction:column;align-items:flex-start;gap:12px;}
  .avatar-ring{width:72px;height:72px;}
  .player-name{font-size:1.2rem;}

  /* Special DMG panel rank box */
  .rank-box{padding:3px 5px;}
}

@media(max-width:480px){
  .character-list{grid-template-columns:repeat(2,1fr) !important;}
  .char-name{font-size:.78rem;}
  .build-panel-wrapper{padding:10px 8px;}
  .panel-name{font-size:1.1rem;}
  .art-card{min-width:210px;}
}
</style>