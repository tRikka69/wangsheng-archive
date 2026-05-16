<template>
  <div class="profiles-page">

    <!-- ══ HEADER ══ -->
    <div class="page-header">
      <div class="header-deco">
        <span class="deco-line"></span>
        <span class="deco-emblem">✦</span>
        <span class="deco-line deco-line-r"></span>
      </div>
      <h1 class="page-title">{{ t.title }}</h1>
      <p class="page-subtitle">{{ t.subtitle }}</p>
    </div>

    <!-- ══ STATS ROW ══ -->
    <div class="stats-bar" v-if="!isLoading && totalCount > 0">
      <span class="stat-item">{{ t.total }}: <strong>{{ totalCount }}</strong></span>
      <span class="stat-sep">·</span>
      <span class="stat-item">{{ t.page }} {{ currentPage }}/{{ totalPages }}</span>
      <span class="stat-sep">·</span>
      <span class="stat-item sort-hint">{{ t.sortHint }}</span>
    </div>

    <!-- ══ LOADING ══ -->
    <div v-if="isLoading" class="empty-state">
      <span class="spin">⟳</span> {{ t.loading }}
    </div>

    <!-- ══ EMPTY ══ -->
    <div v-else-if="profiles.length === 0" class="empty-state">
      <span class="empty-icon">☽</span>
      <p>{{ t.empty }}</p>
    </div>

    <!-- ══ TABLE ══ -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-rank">#</th>
            <th class="th-avatar"></th>
            <th class="th-nick th-sortable" @click="changeSort('achievements')">
              {{ t.colNick }}
            </th>
            <th class="th-ar">AR</th>

            <!-- Achievements: кастомна іконка -->
            <th
              class="th-achieve th-sortable"
              :class="{ 'th-active': currentSort === 'achievements' }"
              @click="changeSort('achievements')"
              :title="t.sortByAchieve"
            >
              <div class="th-inner">
                <!-- Trophy SVG (Genshin Achievement icon style) -->
                <svg class="th-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Laurel left -->
                  <path d="M7,22 C5,19 4,16 5,13 C5.5,11 7,10 8,11 C7,14 7,18 9,21Z" fill="#c8a84a" opacity="0.85"/>
                  <path d="M5,17 C4,15 3.5,12 5,10 C5.5,9 6.5,9 7,10 C5.5,13 5.5,15.5 7,18Z" fill="#b8943a" opacity="0.7"/>
                  <!-- Laurel right -->
                  <path d="M25,22 C27,19 28,16 27,13 C26.5,11 25,10 24,11 C25,14 25,18 23,21Z" fill="#c8a84a" opacity="0.85"/>
                  <path d="M27,17 C28,15 28.5,12 27,10 C26.5,9 25.5,9 25,10 C26.5,13 26.5,15.5 25,18Z" fill="#b8943a" opacity="0.7"/>
                  <!-- Cup body -->
                  <path d="M11,8 L21,8 L20,18 C20,20.5 18,22 16,22 C14,22 12,20.5 12,18Z" fill="#d4a840"/>
                  <path d="M11.5,8.5 L20.5,8.5 L19.5,17.5 C19.5,19.8 17.8,21.5 16,21.5 C14.2,21.5 12.5,19.8 12.5,17.5Z" fill="#e8c060"/>
                  <!-- Handles -->
                  <path d="M11,10 C9,10 8,12 8,14 C8,16 9,17 11,17" stroke="#c8a840" stroke-width="1.2" fill="none"/>
                  <path d="M21,10 C23,10 24,12 24,14 C24,16 23,17 21,17" stroke="#c8a840" stroke-width="1.2" fill="none"/>
                  <!-- Star inside -->
                  <path d="M16,12 L16.6,13.8 L18.5,13.8 L17,14.9 L17.6,16.8 L16,15.6 L14.4,16.8 L15,14.9 L13.5,13.8 L15.4,13.8Z" fill="#c8a840"/>
                  <!-- Base -->
                  <rect x="13" y="22" width="6" height="1.5" rx="0.5" fill="#c8a840"/>
                  <rect x="11" y="23.5" width="10" height="1.5" rx="0.5" fill="#c8a840"/>
                  <!-- Top spike -->
                  <path d="M16,6 L14.5,8 L16,7.5 L17.5,8Z" fill="#c8a840"/>
                </svg>
                {{ t.colAchieve }}
                <span class="th-arrow" v-if="currentSort === 'achievements'">▼</span>
              </div>
            </th>

            <!-- Abyss: кастомна іконка -->
            <th
              class="th-abyss th-sortable"
              :class="{ 'th-active': currentSort === 'abyss' }"
              @click="changeSort('abyss')"
              :title="t.sortByAbyss"
            >
              <div class="th-inner">
                <!-- Diamond/Abyss emblem SVG (Genshin Abyss icon style) -->
                <svg class="th-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Outer diamond -->
                  <path d="M16,3 L29,16 L16,29 L3,16Z" fill="none" stroke="#c8a840" stroke-width="1.2"/>
                  <!-- Inner decorative diamond -->
                  <path d="M16,7 L25,16 L16,25 L7,16Z" fill="#1a1408" stroke="#c8a840" stroke-width="0.8"/>
                  <!-- Center ornament: stylized crown/lotus -->
                  <!-- Top petals -->
                  <path d="M16,9 C15,11 14,12 13,12 C14,12.5 15,14 16,14 C17,14 18,12.5 19,12 C18,12 17,11 16,9Z" fill="#c8a840"/>
                  <!-- Side petals -->
                  <path d="M10,16 C12,15 12.5,14 12,13 C12.5,14 14,15 14,16 C14,17 12.5,18 12,19 C12.5,18 12,17 10,16Z" fill="#c8a840"/>
                  <path d="M22,16 C20,15 19.5,14 20,13 C19.5,14 18,15 18,16 C18,17 19.5,18 20,19 C19.5,18 20,17 22,16Z" fill="#c8a840"/>
                  <!-- Center oval -->
                  <ellipse cx="16" cy="16" rx="3" ry="4" fill="#c8a840" opacity="0.6"/>
                  <ellipse cx="16" cy="16" rx="1.5" ry="2" fill="#e8c860"/>
                  <!-- Bottom accent -->
                  <path d="M14,19 C15,20.5 16,21 16,21 C16,21 17,20.5 18,19Z" fill="#c8a840" opacity="0.5"/>
                </svg>
                {{ t.colAbyss }}
                <span class="th-arrow" v-if="currentSort === 'abyss'">▼</span>
              </div>
            </th>

            <!-- Updated -->
            <th
              class="th-updated th-sortable"
              :class="{ 'th-active': currentSort === 'updated' }"
              @click="changeSort('updated')"
              :title="t.sortByUpdated"
            >
              <div class="th-inner">
                🕐 {{ t.colUpdated }}
                <span class="th-arrow" v-if="currentSort === 'updated'">▼</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(p, index) in profiles" :key="p.uid"
            class="row"
            @click="goToProfile(p.uid)"
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
                <svg viewBox="0 0 32 36" fill="none"><circle cx="16" cy="10" r="6" fill="#b07040" opacity="0.85"/><circle cx="24" cy="15" r="6" fill="#b07040" opacity="0.82"/><circle cx="22" cy="24" r="6" fill="#b07040" opacity="0.82"/><circle cx="10" cy="24" r="6" fill="#b07040" opacity="0.82"/><circle cx="8" cy="15" r="6" fill="#b07040" opacity="0.82"/><circle cx="16" cy="18" r="7.5" fill="#c08050"/><circle cx="16" cy="18" r="4" fill="#d09060"/><circle cx="16" cy="18" r="2" fill="#e8b880"/></svg>
              </div>
              <span v-else class="rank-num">#{{ globalRank(index) }}</span>
            </td>

            <!-- Avatar -->
            <td class="td-avatar">
              <div class="avatar-ring" :class="{ 'ring-top1': globalRank(index)===1, 'ring-top2': globalRank(index)===2, 'ring-top3': globalRank(index)===3 }">
                <img v-if="p.avatar" :src="p.avatar" class="av-img" />
                <div v-else class="av-mock">{{ p.nickname?.[0] || '?' }}</div>
              </div>
            </td>

            <!-- Nickname + UID -->
            <td class="td-nick">
              <div class="nick-block">
                <span class="nick-name">{{ p.nickname }}</span>
                <span class="nick-uid">{{ p.uid }}</span>
              </div>
            </td>

            <!-- AR -->
            <td class="td-ar">
              <span class="ar-val">{{ p.ar_level }}</span>
            </td>

            <!-- Achievements -->
            <td class="td-achieve">
              <div class="achieve-block" v-if="p.achievement_num">
                <span class="achieve-num">{{ p.achievement_num?.toLocaleString() }}</span>
              </div>
              <span v-else class="no-data">—</span>
            </td>

            <!-- Abyss: показуємо поверх і чамбер (зірки недоступні через API) -->
            <td class="td-abyss">
              <div class="abyss-block" v-if="p.tower_floor">
                <span class="abyss-floor">{{ p.tower_floor }}</span>
                <span class="abyss-dash">-</span>
                <span class="abyss-chamber">{{ p.tower_level }}</span>
              </div>
              <span v-else class="no-data">—</span>
            </td>

            <!-- Updated -->
            <td class="td-updated">
              <div class="updated-block">
                <span class="updated-rel">{{ p.last_updated_rel }}</span>
                <span class="updated-abs">{{ p.last_updated_abs }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══ PAGINATION ══ -->
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

    <!-- ══ API NOTE ══ -->
    <div class="api-note" v-if="!isLoading && profiles.length > 0">
      <span class="note-icon">ℹ</span>
      {{ t.apiNote }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { currentLang } from '../store/lang'

const router = useRouter()
const route  = useRoute()

const profiles    = ref<any[]>([])
const isLoading   = ref(true)
const totalCount  = ref(0)
const totalPages  = ref(1)
const currentPage = ref(Number(route.query.page) || 1)
const currentSort = ref((route.query.sort as string) || 'achievements')

const translations: any = {
  ru: {
    title: 'Профили путников',
    subtitle: 'Архив зарегистрированных профилей',
    loading: 'Загрузка...', empty: 'Ни одного профиля ещё нет',
    total: 'Всего', page: 'Стр.',
    sortHint: 'Нажмите на заголовок столбца для сортировки',
    colNick: 'Игрок', colAchieve: 'Достижений', colAbyss: 'Бездна', colUpdated: 'Обновлено',
    sortByAchieve: 'Сортировать по достижениям',
    sortByAbyss:   'Сортировать по прогрессу Бездны',
    sortByUpdated: 'Сортировать по дате обновления',
    apiNote: 'Отображение достижений и этажа в бездны ещё в разработке.'
  },
  en: {
    title: 'Traveler Profiles',
    subtitle: 'Archive of registered profiles',
    loading: 'Loading...', empty: 'No profiles yet',
    total: 'Total', page: 'Page',
    sortHint: 'Click a column header to sort',
    colNick: 'Player', colAchieve: 'Achievements', colAbyss: 'Abyss', colUpdated: 'Updated',
    sortByAchieve: 'Sort by achievements',
    sortByAbyss:   'Sort by Abyss progress',
    sortByUpdated: 'Sort by last updated',
    apiNote: 'Display of achievements and abyss floor is still in development.'
  }
}
const t = computed(() => translations[currentLang.value])

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

async function load() {
  isLoading.value = true
  console.log(`[ПРОФІЛІ] Завантаження | page:${currentPage.value} sort:${currentSort.value}`)
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/profiles?page=${currentPage.value}&sort=${currentSort.value}&lang=${currentLang.value}`
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    profiles.value  = data.profiles
    totalCount.value = data.total
    totalPages.value = data.totalPages
    console.log(`[ПРОФІЛІ] Отримано ${data.profiles.length} / ${data.total}`)
  } catch (e: any) {
    console.error('[ПРОФІЛІ] Помилка:', e.message)
  } finally {
    isLoading.value = false
  }
}

function changeSort(sort: string) {
  if (currentSort.value === sort) return
  currentSort.value = sort
  currentPage.value = 1
  updateUrl(); load()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  updateUrl(); load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function updateUrl() {
  router.replace({
    query: {
      ...(currentSort.value !== 'achievements' ? { sort: currentSort.value } : {}),
      ...(currentPage.value > 1 ? { page: String(currentPage.value) } : {})
    }
  })
}

function goToProfile(uid: string) {
  console.log(`[ПРОФІЛІ] Перехід: ${uid}`)
  router.push(`/${uid}`)
}

watch(currentLang, () => load())

onMounted(() => {
  currentPage.value = Number(route.query.page) || 1
  currentSort.value = (route.query.sort as string) || 'achievements'
  load()
})
</script>

<style scoped>
.profiles-page { max-width: 1400px; margin: 0 auto; width: 100%; }

/* ── Header ── */
.page-header { text-align: center; margin-bottom: 24px; }
.header-deco { display: flex; align-items: center; gap: 16px; justify-content: center; margin-bottom: 12px; }
.deco-line { display: block; width: 80px; height: 1px; background: linear-gradient(90deg, transparent, var(--ht-border-light)); }
.deco-line-r { background: linear-gradient(270deg, transparent, var(--ht-border-light)); }
.deco-emblem { color: var(--ht-accent); font-size: 1rem; }
.page-title { font-family: var(--font-display); font-size: 1.8rem; color: var(--ht-accent-light); margin: 0 0 8px; text-shadow: 0 0 20px rgba(207,69,37,0.4); }
.page-subtitle { font-family: var(--font-heading); font-size: 0.82rem; color: var(--ht-text-muted); letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }

/* ── Stats bar ── */
.stats-bar {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
  font-family: var(--font-mono); font-size: 0.82rem; color: var(--ht-text-muted);
}
.stat-sep { color: var(--ht-text-dim); }
.stats-bar strong { color: var(--ht-text); }
.sort-hint { font-style: italic; color: var(--ht-text-dim); }

/* ── Empty / Loading ── */
.empty-state { text-align: center; padding: 80px 20px; color: var(--ht-text-muted); font-family: var(--font-heading); border: 1px dashed var(--ht-border); border-radius: 10px; }
.empty-icon { display: block; font-size: 2rem; margin-bottom: 12px; color: var(--ht-accent-dark); }
.spin { display: inline-block; animation: spinAnim 1.2s linear infinite; margin-right: 8px; }
@keyframes spinAnim { to { transform: rotate(360deg); } }

/* ── Table ── */
.table-wrapper { background: var(--ht-bg-2); border: 1px solid var(--ht-border); border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
.data-table { width: 100%; border-collapse: collapse; }

th {
  padding: 13px 16px; text-align: center;
  font-family: var(--font-heading); font-size: 0.72rem; letter-spacing: 0.08em;
  color: var(--ht-text-muted); text-transform: uppercase;
  background: var(--ht-bg-3); border-bottom: 2px solid var(--ht-border-light);
  white-space: nowrap;
}
.th-nick { text-align: left; min-width: 180px; }
.th-rank { width: 70px; }
.th-avatar { width: 60px; }
.th-ar { width: 60px; }
.th-achieve { min-width: 130px; }
.th-abyss   { min-width: 110px; }
.th-updated { min-width: 130px; }

/* Sortable header */
.th-sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.15s, background 0.15s;
}
.th-sortable:hover { color: var(--ht-text); background: rgba(74,46,32,0.3); }
.th-active { color: var(--ht-accent-light) !important; }

.th-inner {
  display: flex; align-items: center; justify-content: center;
  gap: 6px;
}
.th-nick .th-inner { justify-content: flex-start; }
.th-icon { width: 18px; height: 18px; flex-shrink: 0; }
.th-arrow { font-size: 0.6rem; color: var(--ht-accent); margin-left: 2px; }

td { padding: 11px 16px; text-align: center; vertical-align: middle; }

.row { cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--ht-border); }
.row:last-child { border-bottom: none; }
.row:hover { background: rgba(74,46,32,0.35); }

/* ── Rank ── */
.td-rank { width: 70px; }
.medal-wrap { display: inline-flex; align-items: center; justify-content: center; }
.medal-wrap svg { width: 24px; height: 28px; }
.medal-1 { filter: drop-shadow(0 0 8px rgba(226,176,32,0.6)); }
.medal-2 { filter: drop-shadow(0 0 6px rgba(192,220,230,0.4)); }
.medal-3 { filter: drop-shadow(0 0 6px rgba(192,120,64,0.4)); }
.rank-num { font-family: var(--font-mono); font-size: 0.9rem; color: var(--ht-text-muted); font-weight: 700; }

/* ── Avatar ── */
.td-avatar { width: 60px; }
.avatar-ring { display: inline-flex; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--ht-border-light); overflow: hidden; transition: border-color 0.2s; }
.ring-top1 { border: 2px solid #d4a820; box-shadow: 0 0 10px rgba(212,168,32,0.4); }
.ring-top2 { border: 2px solid #a8c0cc; box-shadow: 0 0 8px rgba(168,192,204,0.3); }
.ring-top3 { border: 2px solid #b07848; box-shadow: 0 0 8px rgba(176,120,72,0.3); }
.row:hover .avatar-ring:not(.ring-top1):not(.ring-top2):not(.ring-top3) { border-color: var(--ht-accent); }
.av-img { width: 100%; height: 100%; object-fit: cover; }
.av-mock { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ht-surface); color: var(--ht-accent-light); font-family: var(--font-display); font-size: 1rem; }

/* ── Nickname ── */
.td-nick { text-align: left !important; }
.nick-block { display: flex; flex-direction: column; }
.nick-name { font-family: var(--font-heading); font-weight: 600; color: var(--ht-text); font-size: 0.95rem; transition: color 0.15s; }
.row:hover .nick-name { color: var(--ht-accent-light); }
.nick-uid { font-family: var(--font-mono); font-size: 0.72rem; color: var(--ht-text-dim); }

/* ── AR ── */
.ar-val { font-family: var(--font-mono); font-weight: 700; color: var(--ht-gold-light); font-size: 0.95rem; }

/* ── Achievements ── */
.achieve-block { display: flex; align-items: center; justify-content: center; }
.achieve-num { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--ht-text); }

/* ── Abyss ── */
.abyss-block {
  display: inline-flex; align-items: baseline; gap: 2px;
}
.abyss-floor {
  font-family: var(--font-mono); font-size: 1.1rem;
  font-weight: 800; color: var(--ht-gold-light);
}
.abyss-dash { font-family: var(--font-mono); color: var(--ht-text-dim); font-size: 0.9rem; }
.abyss-chamber {
  font-family: var(--font-mono); font-size: 0.9rem;
  font-weight: 700; color: var(--ht-ghost);
}

.no-data { color: var(--ht-text-dim); font-size: 0.9rem; }

/* ── Updated ── */
.updated-block { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.updated-rel { font-family: var(--font-mono); font-size: 0.88rem; font-weight: 600; color: var(--ht-text-muted); }
.updated-abs { font-family: var(--font-mono); font-size: 0.68rem; color: var(--ht-text-dim); }

/* ══ PAGINATION ══ */
.pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; }
.page-btn { min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--ht-bg-3); border: 1px solid var(--ht-border); color: var(--ht-text-muted); cursor: pointer; padding: 0 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.9rem; transition: all 0.18s; }
.page-btn:hover:not(.page-btn-disabled):not(.page-btn-active) { border-color: var(--ht-border-light); color: var(--ht-text); background: var(--ht-surface); }
.page-btn-active { background: var(--ht-surface-2) !important; border-color: var(--ht-accent) !important; color: var(--ht-accent-light) !important; font-weight: 700; }
.page-btn-disabled { opacity: 0.35; cursor: not-allowed; }
.page-dots { min-width: 28px; text-align: center; font-family: var(--font-mono); color: var(--ht-text-dim); }

/* ── API Note ── */
.api-note {
  margin-top: 16px; padding: 10px 16px;
  background: rgba(189,168,210,0.05); border: 1px solid rgba(189,168,210,0.15);
  border-radius: 6px; font-size: 0.8rem; color: var(--ht-text-dim);
  font-family: var(--font-body); font-style: italic; line-height: 1.5;
}
.note-icon { margin-right: 6px; color: var(--ht-ghost); font-style: normal; }

@media (max-width: 900px) {
  .table-wrapper { overflow-x: auto; }
  .data-table { min-width: 700px; }
}

/* ══ МОБІЛЬНА АДАПТАЦІЯ: АРХІВ ПРОФІЛІВ ══ */
@media (max-width: 768px) {
  .page-header { margin-bottom: 16px; }
  .header-deco { display: none; }
  .page-title { font-size: 1.5rem; }
  .stats-bar { flex-direction: column; gap: 4px; }
  .stat-sep { display: none; }
  .table-wrapper { border-radius: 6px; margin-bottom: 14px; }
  th, td { padding: 10px 6px; font-size: 0.75rem; }
  
  /* Жорстке приховування другорядних колонок */
  .th-ar, .td-ar,
  .th-updated, .td-updated,
  .th-abyss, .td-abyss { display: none; }
  
  .th-achieve, .td-achieve { min-width: auto; }
  .th-inner { font-size: 0.7rem; flex-direction: column; gap: 2px; }
  .avatar-ring { width: 36px; height: 36px; }
  .nick-name { font-size: 0.85rem; }
  .nick-uid { font-size: 0.65rem; }
  .achieve-num { font-size: 0.9rem; }
  .td-rank { width: 50px; }
  .medal-wrap svg { width: 22px; height: 26px; }
  
  /* Оптимізація кнопок пагінації */
  .pagination { flex-wrap: wrap; gap: 4px; }
  .page-btn { min-width: 32px; height: 32px; font-size: 0.8rem; padding: 0 6px; }
}

@media(max-width:768px){
  .table-wrapper{overflow-x:auto;}
  .data-table{min-width:580px;}
  .controls-row{flex-direction:column;align-items:flex-start;}
  .page-title{font-size:1.2rem;}
}
@media(max-width:480px){
  .sort-btn{font-size:.75rem;padding:5px 10px;}
}
</style>
