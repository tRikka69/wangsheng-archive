<template>
  <div class="leaderboard-panel">
    <div class="lb-header">
      <div class="lb-deco">
        <span class="deco-line"></span>
        <span class="deco-emblem">✦</span>
        <span class="deco-line deco-line-r"></span>
      </div>
      <h1 class="lb-title">{{ t.title }}</h1>
      <p class="lb-subtitle">{{ t.subtitle }}</p>
    </div>

    <div v-if="isLoading" class="empty-state"><span class="spin">⟳</span> {{ t.loading }}</div>
    <div v-else-if="chars.length === 0" class="empty-state">
      <span class="empty-icon">☽</span><p>{{ t.empty }}</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t.rank }}</th>
            <th></th>
            <th class="th-left">{{ t.character }}</th>
            <th>{{ t.builds }}</th>
            <th>{{ t.updated }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(char, index) in chars" :key="char.name"
            @click="goToDetail(char.name)" class="row"
            :class="{ 'row-top': index < 3 }"
          >
            <!-- Rank medals -->
            <td class="td-rank">
              <div v-if="index === 0" class="medal-wrap medal-1">
                <svg viewBox="0 0 32 36" fill="none"><path d="M16,1 C18,6 22,8 22,8 C22,8 24,2 28,3 C30,6 28,10 26,12 C30,13 32,16 30,20 C28,23 24,24 22,25 L16,35 L10,25 C8,24 4,23 2,20 C0,16 2,13 6,12 C4,10 2,6 4,3 C8,2 10,8 10,8 C10,8 14,6 16,1Z" fill="#c8960a" opacity="0.9"/><path d="M16,5 C17,9 20,11 20,11 C20,11 21,7 24,7 C25,9 24,12 22,13 C25,14 26,17 25,19 C24,21 21,22 19,23 L16,31 L13,23 C11,22 8,21 7,19 C6,17 7,14 10,13 C8,12 7,9 8,7 C11,7 12,11 12,11 C12,11 15,9 16,5Z" fill="#e2b020"/><circle cx="16" cy="17" r="4" fill="#ffe580"/><circle cx="16" cy="17" r="2" fill="#fff4c0"/></svg>
              </div>
              <div v-else-if="index === 1" class="medal-wrap medal-2">
                <svg viewBox="0 0 30 36" fill="none"><path d="M15,2 C22,2 27,8 27,15 C27,22 22,28 15,28 C19,23 20,18 18,13 C16,8 11,5 6,6 C8,3 11,2 15,2Z" fill="#b8c8d0" opacity="0.85"/><path d="M15,5 C20,5 24,9 24,15 C24,20 20,24 15,24 C18,20 19,16 17.5,12 C16,8 12,6 8,7 C10,5 12,5 15,5Z" fill="#d0e0e8"/><circle cx="12" cy="16" r="2.5" fill="#e8f4f8" opacity="0.7"/><line x1="15" y1="28" x2="15" y2="35" stroke="#a0b0b8" stroke-width="1.5" stroke-dasharray="2,2"/></svg>
              </div>
              <div v-else-if="index === 2" class="medal-wrap medal-3">
                <svg viewBox="0 0 32 36" fill="none"><circle cx="16" cy="10" r="6" fill="#b07040" opacity="0.85"/><circle cx="24" cy="15" r="6" fill="#b07040" opacity="0.82"/><circle cx="22" cy="24" r="6" fill="#b07040" opacity="0.82"/><circle cx="10" cy="24" r="6" fill="#b07040" opacity="0.82"/><circle cx="8" cy="15" r="6" fill="#b07040" opacity="0.82"/><circle cx="16" cy="18" r="7.5" fill="#c08050"/><circle cx="16" cy="18" r="4" fill="#d09060"/><circle cx="16" cy="18" r="2" fill="#e8b880"/><line x1="16" y1="26" x2="16" y2="35" stroke="#a06838" stroke-width="1.5" stroke-dasharray="2,2"/></svg>
              </div>
              <span v-else class="rank-num">#{{ index + 1 }}</span>
            </td>

            <!-- Avatar -->
            <td class="td-avatar">
              <div class="char-img-ring"
                :class="{ 'ring-top1': index===0, 'ring-top2': index===1, 'ring-top3': index===2 }">
                <img v-if="char.icon" :src="char.icon" class="char-img" />
                <div v-else class="img-mock">?</div>
              </div>
            </td>

            <!-- Name -->
            <td class="td-name">{{ currentLang === 'ru' ? char.name_ru : char.name_en }}</td>

            <!-- Build count — колір залежно від рангу -->
            <td class="td-builds">
              <div class="build-count"
                :class="{
                  'bc-gold':   index === 0,
                  'bc-silver': index === 1,
                  'bc-bronze': index === 2,
                  'bc-normal': index >= 3
                }"
              >
                <span class="bc-num">{{ char.total }}</span>
                <span class="bc-lbl">{{ currentLang === 'ru' ? 'сб.' : 'bld.' }}</span>
              </div>
            </td>

            <!-- Date -->
            <td class="td-date">{{ char.last_date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { currentLang } from '../store/lang'

const chars    = ref<any[]>([])
const router   = useRouter()
const isLoading = ref(true)

const translations: any = {
  ru: { title: 'Архив Персонажей', subtitle: 'Глобальный рейтинг по зафиксированным сборкам', rank: 'Ранг', character: 'Персонаж', builds: 'Сборок', updated: 'Обновлено', empty: 'Архив пуст — загрузите первый профиль', loading: 'Загрузка...' },
  en: { title: 'Character Archive', subtitle: 'Global ranking by recorded builds', rank: 'Rank', character: 'Character', builds: 'Builds', updated: 'Updated', empty: 'Archive is empty — load the first profile', loading: 'Loading...' }
}
const t = computed(() => translations[currentLang.value])

onMounted(async () => {
  console.log(`[ЛІДЕРБОРД] Завантаження | lang: ${currentLang.value}`)
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard?lang=${currentLang.value}`)
    if (res.ok) { chars.value = await res.json(); console.log(`[ЛІДЕРБОРД] ${chars.value.length} персонажів`) }
    else { console.error(`[ЛІДЕРБОРД] ${res.status}`) }
  } catch (e) { console.error('[ЛІДЕРБОРД]', e) }
  finally { isLoading.value = false }
})

const goToDetail = (name: string) => {
  console.log(`[ЛІДЕРБОРД] → ${name}`)
  router.push(`/leaderboard/${encodeURIComponent(name)}`)
}
</script>

<style scoped>
.leaderboard-panel { max-width: 1400px; margin: 0 auto; width: 100%; }

.lb-header { text-align: center; margin-bottom: 32px; }
.lb-deco { display: flex; align-items: center; gap: 16px; justify-content: center; margin-bottom: 12px; }
.deco-line { display: block; width: 80px; height: 1px; background: linear-gradient(90deg, transparent, var(--ht-border-light)); }
.deco-line-r { background: linear-gradient(270deg, transparent, var(--ht-border-light)); }
.deco-emblem { color: var(--ht-accent); font-size: 1rem; }
.lb-title { font-family: var(--font-display); font-size: 1.8rem; color: var(--ht-accent-light); margin: 0 0 8px; text-shadow: 0 0 20px rgba(207,69,37,0.4); }
.lb-subtitle { font-family: var(--font-heading); font-size: 0.82rem; color: var(--ht-text-muted); letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }

.empty-state { text-align: center; padding: 80px 20px; color: var(--ht-text-muted); font-family: var(--font-heading); border: 1px dashed var(--ht-border); border-radius: 10px; }
.empty-icon { display: block; font-size: 2rem; margin-bottom: 12px; color: var(--ht-accent-dark); }
.spin { display: inline-block; animation: spinAnim 1.2s linear infinite; margin-right: 8px; }
@keyframes spinAnim { to { transform: rotate(360deg); } }

.table-wrapper { background: var(--ht-bg-2); border: 1px solid var(--ht-border); border-radius: 10px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
th { padding: 14px 20px; text-align: center; font-family: var(--font-heading); font-size: 0.74rem; letter-spacing: 0.12em; color: var(--ht-text-muted); text-transform: uppercase; background: var(--ht-bg-3); border-bottom: 2px solid var(--ht-border-light); }
.th-left { text-align: left; }
td { padding: 10px 20px; text-align: center; vertical-align: middle; }
.row { cursor: pointer; transition: all 0.18s; border-bottom: 1px solid var(--ht-border); }
.row:last-child { border-bottom: none; }
.row:hover { background: rgba(74,46,32,0.35); }
.row-top { background: rgba(60,32,20,0.25); }
.row-top:hover { background: rgba(90,46,28,0.4); }

/* Medals */
.td-rank { width: 70px; text-align: center; }
.medal-wrap { display: inline-flex; align-items: center; justify-content: center; }
.medal-wrap svg { width: 28px; height: 32px; }
.medal-1 { filter: drop-shadow(0 0 8px rgba(226,176,32,0.6)); }
.medal-2 { filter: drop-shadow(0 0 6px rgba(192,220,230,0.4)); }
.medal-3 { filter: drop-shadow(0 0 6px rgba(192,120,64,0.4)); }
.rank-num { font-family: var(--font-mono); font-size: 0.95rem; color: var(--ht-text-muted); font-weight: 700; }

/* Avatar */
.td-avatar { width: 70px; }
.char-img-ring { display: inline-flex; width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--ht-border-light); overflow: hidden; transition: all 0.2s; }
.ring-top1 { border: 2px solid #d4a820; box-shadow: 0 0 12px rgba(212,168,32,0.5); }
.ring-top2 { border: 2px solid #a8c0cc; box-shadow: 0 0 10px rgba(168,192,204,0.4); }
.ring-top3 { border: 2px solid #b07848; box-shadow: 0 0 10px rgba(176,120,72,0.4); }
.char-img { width: 100%; height: 100%; object-fit: cover; }
.img-mock { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ht-surface); color: var(--ht-text-dim); }

/* Name */
.td-name { font-family: var(--font-heading); font-weight: 600; font-size: 1rem; color: var(--ht-text); text-align: left; }
.row:hover .td-name { color: var(--ht-accent-light); }

/* ══ Build count — колір за рангом ══ */
.td-builds { width: 110px; }
.build-count {
  display: inline-flex; align-items: baseline; gap: 4px;
  background: rgba(28, 18, 12, 0.7);
  border: 1px solid var(--ht-border);
  border-radius: 6px; padding: 4px 12px;
  transition: all 0.2s;
}
.row:hover .build-count { border-color: var(--ht-border-light); }
.bc-num { font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800; }
.bc-lbl { font-family: var(--font-heading); font-size: 0.65rem; color: var(--ht-text-dim); text-transform: uppercase; }

/* Золото для #1 */
.bc-gold   { border-color: rgba(212,168,32,0.5); background: rgba(212,168,32,0.08); }
.bc-gold   .bc-num { color: #e2b840; }
/* Срібло для #2 */
.bc-silver { border-color: rgba(168,192,204,0.5); background: rgba(168,192,204,0.08); }
.bc-silver .bc-num { color: #b8d0d8; }
/* Бронза для #3 */
.bc-bronze { border-color: rgba(176,120,72,0.5); background: rgba(176,120,72,0.08); }
.bc-bronze .bc-num { color: #c89060; }
/* Решта — нейтральні */
.bc-normal .bc-num { color: var(--ht-text); }

/* Date */
.td-date { color: var(--ht-text-muted); font-family: var(--font-mono); font-size: 0.82rem; }


@media (max-width: 768px) {
  /* Таблиця без горизонтального скролу — все влізає */
  .table-wrapper { overflow: visible; border-radius: 6px; }
  .data-table { min-width: unset; width: 100%; }

  /* Ховаємо дату — не потрібна на мобілі */
  .td-date, .th-date { display: none; }

  /* Компактні комірки */
  th, td { padding: 9px 6px; font-size: 0.72rem; }

  /* Ранг */
  .td-rank { width: 36px; }
  .rank-num { font-size: 0.78rem; }
  .medal-wrap svg { width: 20px; height: 24px; }

  /* Аватар */
  .td-avatar { width: 44px; }
  .char-img-ring { width: 36px; height: 36px; }

  /* Ім'я — перенос якщо довге */
  .td-name {
    font-size: 0.82rem;
    white-space: normal;
    word-break: break-word;
    max-width: 120px;
  }

  /* Кількість збірок — справа, компактно */
  .td-builds { width: 56px; }
  .bc-num { font-size: 0.9rem; }
  .bc-lbl { font-size: 0.52rem; }
}

@media(max-width:480px){
  th, td { padding: 8px 5px; font-size: 0.68rem; }
  .td-name { font-size: 0.78rem; max-width: 95px; }
  .td-rank { width: 30px; }
  .td-avatar { width: 36px; }
  .char-img-ring { width: 30px; height: 30px; }
  .td-builds { width: 50px; }
  h1, .page-title{font-size:1.2rem !important;}
}

/* ══ MOBILE: Leaderboard ══ */
@media(max-width:900px){
  /* Show date but scroll if needed */
  .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .data-table { min-width: 500px; }
}
@media(max-width:768px){
  .table-wrapper { overflow-x: auto; }
  .data-table { min-width: 480px; }
  th, td { padding: 9px 6px; font-size: .72rem; }
  .td-date, .th-date { display: table-cell; } /* SHOW date on mobile */
  .td-rank { width: 36px; }
  .rank-num { font-size: .78rem; }
  .medal-wrap svg { width: 20px; height: 24px; }
  .td-avatar { width: 40px; }
  .char-img-ring { width: 34px; height: 34px; }
  .td-name { font-size: .82rem; white-space: normal; word-break: break-word; max-width: 110px; }
  .td-builds { width: 56px; }
  .bc-num { font-size: .88rem; }
  .bc-lbl { font-size: .5rem; }
  .td-date { font-size: .68rem; color: var(--ht-text-muted); }
}
@media(max-width:480px){
  .data-table { min-width: 440px; }
  th, td { padding: 7px 5px; font-size: .66rem; }
  .td-name { max-width: 90px; font-size: .75rem; }
}
</style>
