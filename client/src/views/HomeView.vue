<template>
  <div class="capture-screen">
    <div class="emblem-area">
      <!-- Decorative plum blossom ring -->
      <svg class="emblem-ring" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Petal ring (8 blossoms) -->
        <g opacity="0.35">
          <circle cx="100" cy="24"  r="8" fill="#b5341e"/>
          <circle cx="144" cy="36"  r="6" fill="#b5341e"/>
          <circle cx="176" cy="70"  r="6" fill="#b5341e"/>
          <circle cx="176" cy="130" r="6" fill="#b5341e"/>
          <circle cx="144" cy="164" r="6" fill="#b5341e"/>
          <circle cx="100" cy="176" r="8" fill="#b5341e"/>
          <circle cx="56"  cy="164" r="6" fill="#b5341e"/>
          <circle cx="24"  cy="130" r="6" fill="#b5341e"/>
          <circle cx="24"  cy="70"  r="6" fill="#b5341e"/>
          <circle cx="56"  cy="36"  r="6" fill="#b5341e"/>
        </g>
        <!-- Outer ring -->
        <circle cx="100" cy="100" r="90" stroke="#4a2e20" stroke-width="1" fill="none"/>
        <circle cx="100" cy="100" r="80" stroke="#6a4030" stroke-width="0.5" stroke-dasharray="4 8" fill="none"/>
        <!-- Inner glow circle -->
        <circle cx="100" cy="100" r="65" stroke="#b5341e" stroke-width="0.8" opacity="0.4" fill="none"/>
        <!-- Ghost butterflies rotating decoration -->
        <path d="M30,100 C22,88 25,72 33,76 C39,79 39,89 36,94 Q34,100 30,100Z" fill="#bda8d2" opacity="0.3"/>
        <path d="M170,100 C178,88 175,72 167,76 C161,79 161,89 164,94 Q166,100 170,100Z" fill="#bda8d2" opacity="0.3"/>
      </svg>

      <div class="central-content">
        <h1 class="main-title">{{ t.title }}</h1>
        <p class="subtitle">{{ t.subtitle }}</p>

        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">✦</span>
            <input
              v-model="targetUid"
              type="text"
              :placeholder="t.placeholder"
              @keyup.enter="initiateTracking"
            />
          </div>
          <button @click="initiateTracking" class="analyze-btn">
            <span>{{ t.button }}</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>

        <p class="hint">{{ t.hint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { currentLang } from '../store/lang'

const targetUid = ref('')
const router = useRouter()

const initiateTracking = () => {
  if (targetUid.value.trim() !== '') {
    console.log(`[ПОШУК] Запит профілю: UID ${targetUid.value.trim()}`)
    router.push({ name: 'profile', params: { uid: targetUid.value.trim() } })
  }
}

const translations: any = {
  ru: {
    title: 'Wangsheng Archive',
    subtitle: 'Хранилище данных путников Тейвата',
    placeholder: 'Введите UID игрока...',
    button: 'Анализировать',
    hint: 'Откройте витрину персонажей в игре для получения данных'
  },
  en: {
    title: 'Wangsheng Archive',
    subtitle: 'Teyvat Traveler Data Repository',
    placeholder: 'Enter player UID...',
    button: 'Analyze',
    hint: 'Open your character showcase in-game to enable data retrieval'
  }
}

const t = computed(() => translations[currentLang.value])
</script>

<style scoped>
.capture-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
}

.emblem-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 560px;
  height: 560px;
}

.emblem-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: slowRotate 60s linear infinite;
}

@keyframes slowRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.central-content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 440px;
}

.main-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--ht-accent-light);
  letter-spacing: 0.05em;
  margin: 0 0 10px;
  text-shadow: 0 0 30px rgba(207, 69, 37, 0.5);
}

.subtitle {
  font-family: var(--font-heading);
  font-size: 0.88rem;
  color: var(--ht-text-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 40px;
}

/* ── Input Group ── */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--ht-accent);
  font-size: 0.85rem;
  pointer-events: none;
}

input {
  width: 100%;
  padding: 14px 20px 14px 40px;
  font-size: 1.1rem;
  font-family: var(--font-mono);
  background: var(--ht-surface);
  color: var(--ht-text);
  border: 1px solid var(--ht-border-light);
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}

input::placeholder { color: var(--ht-text-dim); }

input:focus {
  border-color: var(--ht-accent);
  background: var(--ht-surface-2);
  box-shadow: 0 0 0 3px var(--ht-accent-glow);
}

.analyze-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 32px;
  background: linear-gradient(135deg, var(--ht-accent-dark), var(--ht-accent));
  color: #f5e8d8;
  border: 1px solid var(--ht-accent-light);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: 1rem;
  letter-spacing: 0.1em;
  transition: all 0.25s;
  box-shadow: 0 4px 16px rgba(176,50,24,0.3);
}

.analyze-btn:hover {
  background: linear-gradient(135deg, var(--ht-accent), var(--ht-accent-light));
  box-shadow: 0 6px 24px rgba(176,50,24,0.55);
  transform: translateY(-2px);
}

.analyze-btn:active { transform: translateY(0); }

.btn-arrow { font-size: 1.1rem; transition: transform 0.2s; }
.analyze-btn:hover .btn-arrow { transform: translateX(4px); }

.hint {
  font-size: 0.8rem;
  color: var(--ht-text-dim);
  font-style: italic;
  margin: 16px 0 0;
  font-family: var(--font-body);
}

/* ══ МОБІЛЬНА АДАПТАЦІЯ: ГОЛОВНА СТОРІНКА ══ */
@media (max-width: 768px) {
  .capture-screen { min-height: calc(100vh - 100px); padding: 20px; }
  .emblem-area { width: 100%; height: auto; padding: 40px 0; }
  .emblem-ring { display: none; } /* Вимикаємо важку анімацію на телефонах */
  .central-content { width: 100%; max-width: 400px; }
  .main-title { font-size: 1.8rem; }
  .subtitle { font-size: 0.75rem; margin-bottom: 30px; letter-spacing: 0.08em; }
  .input-group { gap: 10px; }
  input { font-size: 1rem; padding: 12px 16px 12px 36px; }
  .input-icon { left: 12px; }
  .analyze-btn { padding: 12px 20px; font-size: 0.9rem; }
}

@media(max-width:600px){
  .emblem-area{width:280px;height:280px;}
  .central-content{width:260px;}
  .main-title{font-size:1.4rem;}
  .subtitle{font-size:.72rem;letter-spacing:.06em;}
  .uid-input{font-size:.95rem;padding:10px 14px;}
  .analyze-btn{padding:10px 18px;font-size:.85rem;}
}
@media(max-width:380px){
  .emblem-area{width:220px;height:220px;}
  .central-content{width:210px;}
}
</style>
