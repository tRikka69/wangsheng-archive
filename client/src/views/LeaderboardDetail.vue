<template>
  <div class="detail-container">
    <div class="detail-header">
      <button @click="router.push('/leaderboard')" class="back-btn">{{ t.back }}</button>
      <div class="char-title-block">
        <div class="char-icon-ring" v-if="characterIcon">
          <img :src="characterIcon" class="char-icon-img" />
        </div>
        <div>
          <h1 class="detail-title">{{ route.params.name }}</h1>
          <p class="detail-sub">{{ currentViewLabel }} · {{ totalCount }} {{ t.players }}</p>
        </div>
      </div>
      <div class="spacer"></div>
    </div>

    <!-- Назва поточного топу (без перемикача — лише спеціальний) -->
    <div class="view-label" v-if="charConfig">
      <span class="vl-text">{{ charConfig.label[currentLang] || charConfig.label.en }}</span>
      <span class="vl-tag">{{ charConfig.hint[currentLang] || charConfig.hint.en }}</span>
    </div>

    <div v-if="isLoading" class="empty-state">
      <span class="spin">⟳</span> {{ t.loading }}
    </div>
    <div v-else-if="list.length === 0" class="empty-state">
      <span class="empty-icon">☽</span><p>{{ t.empty }}</p>
    </div>

    <div v-if="list.length > 0" class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-rank">{{ t.rank }}</th>
            <th class="th-player">{{ t.player }}</th>
            <th class="th-uid">{{ t.uid }}</th>
            <th class="th-level">{{ t.level }}</th>
            <!-- Нова колонка: Созвездія -->
            <th class="th-cons">{{ t.constellations }}</th>
            <!-- DMG або CV залежно від виду -->
            <th v-if="isSpecialView" class="th-skilldmg">
              {{ charConfig?.colLabel?.[currentLang] || charConfig?.label?.[currentLang] || 'DMG' }}
            </th>
            <th v-else class="th-cv">{{ t.cv }}</th>
            <th class="th-date">{{ t.date }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, index) in list" :key="player.uid + index"
            @click="goToPlayerBuild(player.uid, player.build_id)" class="row"
          >
            <!-- Rank -->
            <td class="td-rank">
              <div v-if="globalRank(index) === 1" class="medal-wrap medal-1">
                <svg viewBox="0 0 32 36" fill="none"><path d="M16,1 C18,6 22,8 22,8 C22,8 24,2 28,3 C30,6 28,10 26,12 C30,13 32,16 30,20 C28,23 24,24 22,25 L16,35 L10,25 C8,24 4,23 2,20 C0,16 2,13 6,12 C4,10 2,6 4,3 C8,2 10,8 10,8 C10,8 14,6 16,1Z" fill="#c8960a" opacity="0.9"/><path d="M16,5 C17,9 20,11 20,11 C20,11 21,7 24,7 C25,9 24,12 22,13 C25,14 26,17 25,19 C24,21 21,22 19,23 L16,31 L13,23 C11,22 8,21 7,19 C6,17 7,14 10,13 C8,12 7,9 8,7 C11,7 12,11 12,11 C12,11 15,9 16,5Z" fill="#e2b020"/><circle cx="16" cy="17" r="4" fill="#ffe580"/><circle cx="16" cy="17" r="2" fill="#fff4c0"/></svg>
              </div>
              <div v-else-if="globalRank(index) === 2" class="medal-wrap medal-2">
                <svg viewBox="0 0 30 36" fill="none"><path d="M15,2 C22,2 27,8 27,15 C27,22 22,28 15,28 C19,23 20,18 18,13 C16,8 11,5 6,6 C8,3 11,2 15,2Z" fill="#b8c8d0" opacity="0.85"/><path d="M15,5 C20,5 24,9 24,15 C24,20 20,24 15,24 C18,20 19,16 17.5,12 C16,8 12,6 8,7 C10,5 12,5 15,5Z" fill="#d0e0e8"/><circle cx="12" cy="16" r="2.5" fill="#e8f4f8" opacity="0.7"/><line x1="15" y1="28" x2="15" y2="35" stroke="#a0b0b8" stroke-width="1.5" stroke-dasharray="2,2"/></svg>
              </div>
              <div v-else-if="globalRank(index) === 3" class="medal-wrap medal-3">
                <svg viewBox="0 0 32 36" fill="none"><circle cx="16" cy="10" r="6" fill="#b07040" opacity="0.85"/><circle cx="24" cy="15" r="6" fill="#b07040" opacity="0.82"/><circle cx="22" cy="24" r="6" fill="#b07040" opacity="0.82"/><circle cx="10" cy="24" r="6" fill="#b07040" opacity="0.82"/><circle cx="8" cy="15" r="6" fill="#b07040" opacity="0.82"/><circle cx="16" cy="18" r="7.5" fill="#c08050"/><circle cx="16" cy="18" r="4" fill="#d09060"/><circle cx="16" cy="18" r="2" fill="#e8b880"/><line x1="16" y1="26" x2="16" y2="35" stroke="#a06838" stroke-width="1.5" stroke-dasharray="2,2"/></svg>
              </div>
              <span v-else class="rank-num">#{{ globalRank(index) }}</span>
            </td>

            <!-- Player -->
            <td>
              <div class="player-cell">
                <div class="avatar-ring">
                  <img v-if="player.player_avatar" :src="player.player_avatar" class="player-img" />
                  <div v-else class="img-mock">?</div>
                </div>
                <div class="player-info">
                  <span class="nickname">{{ player.nickname }}</span>
                  <span v-if="isSpecialView" class="player-detail">
                    E lv.{{ getEffectiveSkillLevel(player) }}
                  </span>
                </div>
              </div>
            </td>

            <td class="td-uid">{{ player.uid }}</td>
            <td class="td-level">AR {{ player.level }}</td>

            <!-- ══ Созвездія — кольорове кодування ══ -->
            <td class="td-cons">
              <span class="con-badge" :class="conClass(player.constellations)">
                C{{ player.constellations ?? '?' }}
              </span>
            </td>

            <!-- DMG або CV -->
            <td v-if="isSpecialView" class="td-skilldmg">
              <div class="dmg-display">
                <span class="dmg-val"
                  :class="{ 'dmg-gold': globalRank(index)===1, 'dmg-silver': globalRank(index)===2, 'dmg-bronze': globalRank(index)===3 }"
                >{{ formatDmg(player.skill_dmg) }}</span>
                <span class="dmg-unit">{{ charConfig?.sortKey === 'em_sort' ? 'EM' : 'DMG' }}</span>
              </div>
            </td>
            <td v-else>
              <div class="cv-cell">
                <div class="crit-ratio">
                  <span class="cr-val">{{ getCritRate(player).toFixed(1) }}</span>
                  <span class="cr-sep">/</span>
                  <span class="cd-val">{{ getCritDamage(player).toFixed(1) }}</span>
                </div>
                <div class="cv-display" :class="getCVColor(getArtifactCV(player))">
                  {{ getArtifactCV(player).toFixed(1) }}
                  <span class="cv-lbl">{{ currentLang === 'ru' ? 'КМ' : 'CV' }}</span>
                </div>
              </div>
            </td>

            <td class="td-date">{{ player.added_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn" :class="{ 'page-btn-disabled': currentPage === 1 }"
        @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
      >‹</button>
      <template v-for="pg in visiblePages" :key="pg">
        <span v-if="pg === '...'" class="page-dots">…</span>
        <button
          v-else class="page-btn" :class="{ 'page-btn-active': pg === currentPage }"
          @click="goToPage(Number(pg))"
        >{{ pg }}</button>
      </template>
      <button
        class="page-btn" :class="{ 'page-btn-disabled': currentPage === totalPages }"
        @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
      >›</button>
    </div>

    <div v-if="isSpecialView && charConfig?.note" class="dmg-note">
      <span class="note-icon">ℹ</span>
      {{ charConfig.note[currentLang] || charConfig.note.en }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { currentLang } from '../store/lang'

const route  = useRoute()
const router = useRouter()
const list   = ref<any[]>([])
const isLoading   = ref(false)
const totalCount  = ref(0)
const totalPages  = ref(1)
const currentPage = ref(Number(route.query.page) || 1)
const charName    = route.params.name as string
const currentView = ref<string | null>((route.params.view as string) || null)

// ══════════════════════════════════════════════════════════
//  КОНФІГ спеціальних видів
// ══════════════════════════════════════════════════════════
interface CharConfig {
  urlSlug:   string
  sortKey:   string
  label:     Record<string, string>
  hint:      Record<string, string>
  colLabel?: Record<string, string>
  note:      Record<string, string>
}

const CHAR_RANKING_CONFIG: Record<string, CharConfig> = {
  'Furina': {
    urlSlug: 'skill', sortKey: 'skill_dmg',
    label:   { ru: 'Elemental Skill DMG', en: 'Elemental Skill DMG' },
    hint:    { ru: 'Furina E',            en: 'Furina E'            },
    colLabel:{ ru: 'E DMG',               en: 'E DMG'               },
    note: {
      ru: 'Расчётный урон: сумма 1 удара Usher + Cheval + Crab. Учтено: HP, уровень E, бонус Гидро, пасс. А4, Golden Troupe, крит. множитель, C1 (+25%), C3.',
      en: 'Calculated damage: 1 hit from Usher + Cheval + Crab. Includes: HP, E talent level, Hydro DMG bonus, A4, Golden Troupe, crit multiplier, C1 (+25%), C3.'
    }
  },
  'Navia': {
    urlSlug: 'rotation_1', sortKey: 'rotation_dmg',
    label:   { ru: 'Урон ротации',  en: 'Rotation DMG'  },
    hint:    { ru: 'Navia Combo',   en: 'Navia Combo'   },
    colLabel:{ ru: 'Ротация DMG',   en: 'Rotation DMG'  },
    note: {
      ru: 'Урон в ротации: Q + 2×E (6 стаков) + 2×NA комбо. Учтено: ATK, Гео DMG, криты, Nighttime Whispers 4pc, Marechaussee Hunter, A1, C2/C4/C5/C6.',
      en: 'Rotation DMG: Q + 2×E (6 stacks) + 2×NA combo. Includes: ATK, Geo DMG, crits, Nighttime Whispers 4pc, Marechaussee Hunter, A1, C2/C4/C5/C6.'
    }
  },
  'Skirk': {
    urlSlug: 'rotation_skirk', sortKey: 'skirk_rotation',
    label:   { ru: 'Урон ротации',         en: 'Rotation DMG'          },
    hint:    { ru: 'Skirk Rotation',        en: 'Skirk Rotation'        },
    colLabel:{ ru: 'Ротация DMG',           en: 'Rotation DMG'          },
    note: {
      ru: 'Команда: Furina C0 (FavSword R3, TOTM 4pc) + Escoffier C0 (FavLance R3, NO 4pc) + Mona C4 (TTDS R5, NO 4pc). Считается только урон Скирк. Баффы фиксированные: TTDS +48% ATK, NO +20% ATK, Furina Fanfare +72% DMG, Mona Omen +52% DMG, Escoffier -15% Cryo RES. Множители: hE×6, tE×2, Q×2, N5-комбо×10, CA×6.',
      en: 'Team: Furina C0 (FavSword R3, TOTM 4pc) + Escoffier C0 (FavLance R3, NO 4pc) + Mona C4 (TTDS R5, NO 4pc). Only Skirk damage counted. Fixed team buffs: TTDS +48% ATK, NO +20% ATK, Furina Fanfare +72% DMG, Mona Omen +52% DMG, Escoffier -15% Cryo RES. Scalings: hE×6, tE×2, Q×2, N5 combo×10, CA×6.'
    }
  },
  'Kaedehara Kazuha': {
    urlSlug: 'em_top', sortKey: 'em_sort',
    label:   { ru: 'Мастерство стихий', en: 'Elemental Mastery' },
    hint:    { ru: 'EM',                en: 'EM'                },
    colLabel:{ ru: 'EM',                en: 'EM'                },
    note: {
      ru: 'Рейтинг по значению Мастерства стихий. Чем выше EM — тем выше ранг. EM увеличивает урон вихрей рассеивания и бонус урона союзников от A4.',
      en: 'Ranking by Elemental Mastery value. Higher EM = higher rank. EM increases Swirl damage and the DMG bonus granted to allies via A4 passive.'
    }
  },
}

const charConfig    = computed<CharConfig | null>(() => CHAR_RANKING_CONFIG[charName] || null)
const isSpecialView = computed(() => charConfig.value !== null)

// ── Локалізація ──────────────────────────────────────────
const translations: any = {
  ru: {
    back: '← К рейтингу', viewDate: 'По дате добавления', loading: 'Загрузка...',
    rank: 'Ранг', player: 'Игрок', uid: 'UID', level: 'Уровень',
    constellations: 'Созв.', cv: 'Крит. Масса', date: 'Дата',
    empty: '[ДАННЫЕ НЕ НАЙДЕНЫ]', players: 'записей'
  },
  en: {
    back: '← Back', viewDate: 'By Date Added', loading: 'Loading...',
    rank: 'Rank', player: 'Player', uid: 'UID', level: 'Level',
    constellations: 'Cons.', cv: 'Crit Value', date: 'Date',
    empty: '[DATA NOT FOUND]', players: 'entries'
  }
}
const t = computed(() => translations[currentLang.value])

const currentViewLabel = computed(() => {
  if (charConfig.value) return charConfig.value.label[currentLang.value] || charConfig.value.label.en
  return t.value.viewDate
})
const characterIcon = computed(() => list.value?.[0]?.char_icon || '')

// ── Constellation color class ──────────────────────────
function conClass(c: number | null | undefined): string {
  if (c === null || c === undefined) return 'con-unknown'
  if (c === 0) return 'con-0'
  if (c === 6) return 'con-6'
  return 'con-mid'  // 1-5
}

// ── Pagination ──────────────────────────────────────────
const globalRank = (index: number) => (currentPage.value - 1) * 30 + index + 1

const visiblePages = computed<(number | string)[]>(() => {
  const total = totalPages.value, cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

function switchView(slug: string | null) {
  if ((slug === null && !currentView.value) || slug === currentView.value) return
  currentView.value = slug
  currentPage.value = 1
  if (slug === null) router.push(`/leaderboard/${encodeURIComponent(charName)}`)
  else               router.push(`/leaderboard/${encodeURIComponent(charName)}/${slug}`)
  loadData()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  router.replace({ query: page > 1 ? { page: String(page) } : {} })
  loadData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function loadData() {
  isLoading.value = true
  const sortParam = charConfig.value ? charConfig.value.sortKey : 'date'
  const encoded   = encodeURIComponent(charName)
  console.log(`[ДЕТАЛІ] ${charName} | sort:${sortParam} page:${currentPage.value}`)
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/leaderboard/${encoded}?sort=${sortParam}&page=${currentPage.value}&lang=${currentLang.value}`
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json()
    list.value       = body.data.map((x: any) => safePlayer(x))
    totalCount.value  = body.total
    totalPages.value  = body.totalPages
    console.log(`[ДЕТАЛІ] ${list.value.length}/${body.total} стор.${body.page}/${body.totalPages}`)
  } catch (e: any) {
    console.error('[ДЕТАЛІ]', e.message)
  } finally {
    isLoading.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────
function parseNum(v: any): number { if(!v)return 0; return parseFloat(String(v).replace('%','').replace(',','.'))||0; }
function getCritRate(p: any)   { return parseNum(p?.crit_rate   ?? 0) }
function getCritDamage(p: any) { return parseNum(p?.crit_damage ?? 0) }
const safePlayer = (p: any) => ({
  ...p, crit_rate: p?.crit_rate ?? 0, crit_damage: p?.crit_damage ?? 0,
  artifacts: typeof p.artifacts === 'string' ? JSON.parse(p.artifacts || '[]') : (p.artifacts || [])
})
const CR = 'FIGHT_PROP_CRITICAL', CD = 'FIGHT_PROP_CRITICAL_HURT'
function isCirclet(art: any) { return art?.equipType === 'Корона разума' }
function getSubValue(art: any, id: string) { return parseNum(art?.substats?.find((x:any)=>x.id===id)?.value) }
function getMainValue(art: any, id: string) { return art?.mainstat?.id===id ? parseNum(art.mainstat.value) : 0 }
function getOneArtCV(art: any) {
  const cr=getSubValue(art,CR), cd=getSubValue(art,CD)
  if(isCirclet(art)){if(art.mainstat?.id===CR)return cd;if(art.mainstat?.id===CD)return cr*2;}
  return cr*2+cd;
}
function getArtifactCV(player: any) {
  if(!player?.artifacts)return 0;
  let total=0;
  for(const art of player.artifacts){
    total+=getOneArtCV(art);
    if(isCirclet(art)&&art.mainstat?.id===CR)total+=getMainValue(art,CR)*2;
    if(isCirclet(art)&&art.mainstat?.id===CD)total+=getMainValue(art,CD);
  }
  return total;
}
function getCVColor(cv: number) {
  if(cv<100)return 'cv-gray';if(cv<150)return 'cv-blue';if(cv<180)return 'cv-purple';
  if(cv<210)return 'cv-orange';if(cv<240)return 'cv-gold';if(cv<270)return 'cv-cyan';return 'cv-red';
}
function getEffectiveSkillLevel(p: any): number {
  const base = p.skill_level_e || 1;
  return p.constellations >= 3 ? Math.min(base + 3, 13) : base;
}
function formatDmg(val: number | null | undefined): string {
  if(!val||val===0)return '—';
  // EM values (Kazuha) — plain integer, no K/M suffix
  if(charConfig.value?.sortKey === 'em_sort') return Math.round(val).toLocaleString();
  if(val>=1000000)return(val/1000000).toFixed(2)+'M';
  if(val>=1000)return(val/1000).toFixed(1)+'K';
  return String(val);
}
const goToPlayerBuild = (uid: string, bid: string) => {
  console.log(`[ДЕТАЛІ] → UID:${uid} build:${bid}`)
  router.push({ path: `/${uid}`, query: { build: bid } })
}

watch(currentLang, () => loadData())
onMounted(() => {
  // Якщо є конфіг спеціального топу — одразу відкриваємо його
  // (вкладки "по даті" більше немає)
  const viewParam = route.params.view as string
  if (viewParam) {
    currentView.value = viewParam
  } else if (charConfig.value) {
    // Немає slug в URL — перенаправляємо на спеціальний топ
    currentView.value = charConfig.value.urlSlug
    router.replace(`/leaderboard/${encodeURIComponent(charName)}/${charConfig.value.urlSlug}`)
  } else {
    currentView.value = null
  }
  currentPage.value = Number(route.query.page) || 1
  loadData()
})
</script>

<style scoped>
.detail-container { max-width: 1400px; margin: 0 auto; width: 100%; }

.detail-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--ht-border-light); }
.back-btn { flex-shrink: 0; background: transparent; border: 1px solid var(--ht-border-light); color: var(--ht-text-muted); cursor: pointer; padding: 8px 16px; border-radius: 4px; font-family: var(--font-heading); font-size: 0.82rem; letter-spacing: 0.06em; transition: all 0.2s; }
.back-btn:hover { color: var(--ht-text); border-color: var(--ht-accent); }
.char-title-block { display: flex; align-items: center; gap: 16px; }
.char-icon-ring { width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--ht-accent); overflow: hidden; box-shadow: 0 0 14px rgba(176,50,24,0.4); flex-shrink: 0; }
.char-icon-img { width: 100%; height: 100%; object-fit: cover; }
.detail-title { font-family: var(--font-heading); font-size: 1.5rem; color: var(--ht-text); margin: 0 0 4px; }
.detail-sub { font-family: var(--font-mono); font-size: 0.8rem; color: var(--ht-text-muted); margin: 0; }
.spacer { flex: 1; }

/* View switcher */
.view-switcher { display: flex; gap: 0; margin-bottom: 20px; background: var(--ht-bg-3); border: 1px solid var(--ht-border); border-radius: 8px; overflow: hidden; width: fit-content; }
.view-btn { display: flex; align-items: center; gap: 8px; padding: 9px 20px; background: transparent; border: none; border-right: 1px solid var(--ht-border); cursor: pointer; font-family: var(--font-heading); font-size: 0.85rem; letter-spacing: 0.05em; color: var(--ht-text-muted); transition: all 0.2s; }
.view-btn:last-child { border-right: none; }
.view-btn:hover { color: var(--ht-text); background: rgba(74,46,32,0.3); }
.view-btn-active { background: rgba(176,50,24,0.12) !important; color: var(--ht-accent-light) !important; }
.vb-tag { font-size: 0.65rem; color: var(--ht-accent-light); background: rgba(176,50,24,0.15); border: 1px solid var(--ht-accent-dark); padding: 1px 6px; border-radius: 3px; font-family: var(--font-mono); }

/* Empty / Loading */
.empty-state { text-align: center; padding: 60px; color: var(--ht-text-muted); font-family: var(--font-heading); border: 1px dashed var(--ht-border); border-radius: 10px; margin-bottom: 16px; }
.empty-icon { display: block; font-size: 2rem; margin-bottom: 12px; color: var(--ht-accent-dark); }
.spin { display: inline-block; animation: spin 1.2s linear infinite; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.table-wrapper { background: var(--ht-bg-2); border: 1px solid var(--ht-border); border-radius: 10px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.th-rank { width: 70px; } .th-player { text-align: left; min-width: 180px; } .th-uid { width: 110px; } .th-level { width: 80px; } .th-cons { width: 70px; } .th-cv, .th-skilldmg { width: 150px; } .th-date { width: 130px; }
th { padding: 13px 14px; text-align: center; font-family: var(--font-heading); font-size: 0.72rem; letter-spacing: 0.10em; color: var(--ht-text-muted); text-transform: uppercase; background: var(--ht-bg-3); border-bottom: 2px solid var(--ht-border-light); white-space: nowrap; }
.th-player { text-align: left; }
td { padding: 10px 14px; text-align: center; vertical-align: middle; }
.row { cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--ht-border); }
.row:last-child { border-bottom: none; }
.row:hover { background: rgba(74,46,32,0.35); }

/* Rank */
.td-rank { width: 70px; }
.medal-wrap { display: inline-flex; align-items: center; justify-content: center; }
.medal-wrap svg { width: 24px; height: 28px; }
.medal-1 { filter: drop-shadow(0 0 8px rgba(226,176,32,0.6)); }
.medal-2 { filter: drop-shadow(0 0 6px rgba(192,220,230,0.4)); }
.medal-3 { filter: drop-shadow(0 0 6px rgba(192,120,64,0.4)); }
.rank-num { font-family: var(--font-mono); font-size: 0.9rem; color: var(--ht-text-muted); font-weight: 700; }

/* Player */
.player-cell { display: flex; align-items: center; gap: 12px; }
.player-info { display: flex; flex-direction: column; }
.avatar-ring { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--ht-border-light); overflow: hidden; flex-shrink: 0; transition: border-color 0.2s; }
.row:hover .avatar-ring { border-color: var(--ht-accent); }
.player-img { width: 100%; height: 100%; object-fit: cover; }
.img-mock { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ht-surface); color: var(--ht-text-dim); }
.nickname { font-family: var(--font-heading); font-weight: 600; color: var(--ht-text); font-size: 0.92rem; }
.row:hover .nickname { color: var(--ht-accent-light); }
.player-detail { font-family: var(--font-mono); font-size: 0.7rem; color: var(--ht-text-muted); }

.td-uid   { font-family: var(--font-mono); font-size: 0.78rem; color: var(--ht-text-muted); }
.td-level { font-family: var(--font-mono); font-size: 0.85rem; color: var(--ht-gold-light); }
.td-date  { font-family: var(--font-mono); font-size: 0.78rem; color: var(--ht-text-muted); }

/* ══ Constellation badge ══ */
.td-cons { width: 70px; }
.con-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  letter-spacing: 0.04em;
}
/* C0 — приглушений, майже непомітний */
.con-0 {
  color: var(--ht-text-dim);
  background: rgba(40, 28, 20, 0.5);
  border-color: var(--ht-border);
}
/* C1–C5 — акцентний колір (помаранчево-лавандовий) */
.con-mid {
  color: var(--ht-ghost);
  background: rgba(189, 168, 210, 0.10);
  border-color: rgba(189, 168, 210, 0.30);
}
/* C6 — золото */
.con-6 {
  color: var(--ht-gold-light);
  background: rgba(196, 152, 30, 0.15);
  border-color: rgba(196, 152, 30, 0.50);
  text-shadow: 0 0 8px rgba(226, 184, 64, 0.4);
}
.con-unknown {
  color: var(--ht-text-dim);
  border-color: var(--ht-border);
}

/* DMG */
.dmg-display { display: flex; align-items: baseline; gap: 4px; justify-content: center; }
.dmg-val { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 900; color: var(--ht-ghost); }
.dmg-gold   { color: #e2b840 !important; }
.dmg-silver { color: #b8d0d8 !important; }
.dmg-bronze { color: #c89060 !important; }
.dmg-unit { font-family: var(--font-heading); font-size: 0.65rem; color: var(--ht-text-dim); text-transform: uppercase; letter-spacing: 0.08em; }

/* CV */
.cv-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.crit-ratio { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 0.75rem; }
.cr-val { color: var(--ht-accent-light); } .cr-sep { color: var(--ht-text-dim); } .cd-val { color: var(--ht-gold-light); }
.cv-display { font-family: var(--font-mono); font-size: 1rem; font-weight: 900; display: flex; align-items: baseline; gap: 4px; }
.cv-lbl { font-size: 0.62rem; font-weight: 400; opacity: 0.7; }
.cv-gray{color:#6a6a6a}.cv-blue{color:#4a9fd4}.cv-purple{color:#a070c8}.cv-orange{color:#d47830}.cv-gold{color:var(--ht-gold-light)}.cv-cyan{color:#40d8f0}.cv-red{color:var(--ht-accent-light)}

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; }
.page-btn { min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--ht-bg-3); border: 1px solid var(--ht-border); color: var(--ht-text-muted); cursor: pointer; padding: 0 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.9rem; transition: all 0.18s; }
.page-btn:hover:not(.page-btn-disabled):not(.page-btn-active) { border-color: var(--ht-border-light); color: var(--ht-text); }
.page-btn-active { background: var(--ht-surface-2) !important; border-color: var(--ht-accent) !important; color: var(--ht-accent-light) !important; font-weight: 700; }
.page-btn-disabled { opacity: 0.35; cursor: not-allowed; }
.page-dots { min-width: 28px; text-align: center; font-family: var(--font-mono); color: var(--ht-text-dim); }

/* Note */
.dmg-note { margin-top: 16px; padding: 12px 16px; background: rgba(189,168,210,0.05); border: 1px solid rgba(189,168,210,0.2); border-radius: 6px; font-size: 0.82rem; color: var(--ht-text-muted); font-family: var(--font-body); font-style: italic; line-height: 1.5; }
.note-icon { margin-right: 8px; color: var(--ht-ghost); font-style: normal; }

@media (max-width: 900px) { .table-wrapper { overflow-x: auto; } .data-table { min-width: 800px; } }


@media (max-width: 768px) {
  /* Header */
  .detail-header { flex-direction: column; text-align: center; gap: 12px; align-items: center; }
  .char-title-block { flex-direction: column; align-items: center; }
  .detail-title { font-size: 1.1rem; }
  .spacer { display: none; }

  /* View switcher */
  .view-switcher { width: 100%; margin-bottom: 14px; }
  .view-btn { flex: 1; justify-content: center; font-size: .78rem; padding: 8px 8px; }

  /* Таблиця без горизонтального скролу */
  .table-wrapper { overflow: visible; border-radius: 6px; }
  .data-table { min-width: unset; width: 100%; }

  /* Ховаємо UID, AR level, дату */
  .th-uid, .td-uid,
  .th-level, .td-level,
  .th-date, .td-date { display: none; }

  /* Комірки */
  th, td { padding: 9px 6px; font-size: 0.72rem; }

  /* Ранг */
  .td-rank { width: 36px; }
  .rank-num { font-size: 0.78rem; }
  .medal-wrap svg { width: 20px; height: 24px; }

  /* Гравець — аватар і нік ВЕРТИКАЛЬНО, строго під заголовком "Игрок" */
  .th-player { text-align: center; }
  .player-cell {
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }
  .avatar-ring { width: 34px; height: 34px; }
  .nickname { font-size: 0.75rem; }
  .player-detail { font-size: 0.65rem; }

  /* Созвездія */
  .th-cons { width: 44px; }
  .con-badge { font-size: 0.7rem; padding: 1px 5px; }

  /* CV / DMG */
  .th-cv, .th-skilldmg { width: 90px; }
  .cv-display { font-size: 0.85rem; }
  .crit-ratio { font-size: 0.65rem; }
  .dmg-val { font-size: 0.95rem; }
  .dmg-unit { font-size: 0.55rem; }
}

@media(max-width:480px){
  th, td { padding: 7px 4px; font-size: 0.65rem; }
  .nickname { font-size: 0.68rem; }
  .avatar-ring { width: 28px; height: 28px; }
}

/* ══ MOBILE: LeaderboardDetail ══ */
@media(max-width:768px){
  /* Header */
  .detail-header { flex-direction: column; align-items: center; gap: 10px; text-align: center; }
  .char-title-block { flex-direction: column; align-items: center; }
  .detail-title { font-size: 1rem; }
  .spacer { display: none; }

  /* View switcher — VERTICAL */
  .view-switcher {
    flex-direction: column;
    width: 100%;
    border-radius: 8px;
    margin-bottom: 14px;
  }
  .view-btn {
    width: 100%;
    justify-content: center;
    border-right: none !important;
    border-bottom: 1px solid var(--ht-border);
    font-size: .85rem;
    padding: 11px 16px;
  }
  .view-btn:last-child { border-bottom: none; }

  /* Table - scrollable */
  .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 6px; }
  .data-table { min-width: 420px; width: 100%; }

  /* Hide UID, date; keep level */
  .th-uid, .td-uid, .th-date, .td-date { display: none; }
  .th-level, .td-level { display: table-cell; }

  th, td { padding: 8px 5px; font-size: .7rem; }

  /* Rank */
  .td-rank { width: 34px; }
  .rank-num { font-size: .75rem; }
  .medal-wrap svg { width: 18px; height: 22px; }

  /* Player — VERTICAL, narrow column */
  .th-player { text-align: center; width: 80px; max-width: 80px; }
  .player-cell {
    flex-direction: column;
    align-items: center;
    gap: 3px;
    text-align: center;
    width: 80px;
    max-width: 80px;
  }
  .avatar-ring { width: 30px; height: 30px; }
  .nickname    { font-size: .68rem; white-space: normal; word-break: break-word; max-width: 76px; line-height: 1.2; }
  .player-detail { font-size: .6rem; }

  /* Level */
  .th-level { width: 38px; }
  .td-level { font-size: .72rem; }

  /* Constellations */
  .th-cons { width: 38px; }
  .con-badge { font-size: .66rem; padding: 1px 4px; }

  /* CV / DMG */
  .th-cv, .th-skilldmg { width: 80px; }
  .cv-cell { gap: 2px; }
  .cv-display { font-size: .82rem; }
  .crit-ratio { font-size: .62rem; }
  .dmg-val { font-size: .9rem; }
  .dmg-unit { font-size: .52rem; }
}

@media(max-width:480px){
  .data-table { min-width: 380px; }
  th, td { padding: 7px 4px; font-size: .65rem; }
  .nickname { font-size: .63rem; max-width: 68px; }
}

/* View label (replaces switcher) */
.view-label {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
  padding: 10px 16px;
  background: var(--ht-bg-3);
  border: 1px solid var(--ht-border);
  border-left: 3px solid var(--ht-accent);
  border-radius: 8px;
  width: fit-content;
}
.vl-text {
  font-family: var(--font-heading);
  font-size: .88rem;
  letter-spacing: .06em;
  color: var(--ht-accent-light);
}
.vl-tag {
  font-size: .65rem; color: var(--ht-accent-light);
  background: rgba(176,50,24,.15); border: 1px solid var(--ht-accent-dark);
  padding: 1px 7px; border-radius: 3px; font-family: var(--font-mono);
}
</style>
