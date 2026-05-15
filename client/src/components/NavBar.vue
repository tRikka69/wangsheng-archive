<template>
  <nav class="navbar">
    <div class="nav-top">
      <div class="nav-brand" @click="router.push('/')">
        <svg class="brand-icon" viewBox="0 0 72 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6,26 C2,17 4,7 11,10 C16,12 17,20 15,25 Q12,26.5 6,26Z" fill="#bda8d2" opacity="0.78"/>
          <path d="M6,26 C2,35 4,45 11,42 C16,40 17,32 15,27 Q12,25.5 6,26Z" fill="#bda8d2" opacity="0.48"/>
          <ellipse cx="14.5" cy="26" rx="1.2" ry="5" fill="#d4b8e8" opacity="0.9"/>
          <path d="M66,26 C70,17 68,7 61,10 C56,12 55,20 57,25 Q60,26.5 66,26Z" fill="#bda8d2" opacity="0.78"/>
          <path d="M66,26 C70,35 68,45 61,42 C56,40 55,32 57,27 Q60,25.5 66,26Z" fill="#bda8d2" opacity="0.48"/>
          <ellipse cx="57.5" cy="26" rx="1.2" ry="5" fill="#d4b8e8" opacity="0.9"/>
          <circle cx="36" cy="14" r="5.5" fill="#9e2c14" opacity="0.85"/>
          <circle cx="29" cy="19" r="5.5" fill="#9e2c14" opacity="0.85"/>
          <circle cx="43" cy="19" r="5.5" fill="#9e2c14" opacity="0.85"/>
          <circle cx="31" cy="28" r="5.5" fill="#9e2c14" opacity="0.85"/>
          <circle cx="41" cy="28" r="5.5" fill="#9e2c14" opacity="0.85"/>
          <circle cx="36" cy="22" r="7" fill="#b5341e"/>
          <circle cx="36" cy="22" r="3.5" fill="#e2b840"/>
          <circle cx="36" cy="22" r="1.5" fill="#fff5d0"/>
        </svg>
        <span class="logo-text">Wangsheng Archive</span>
      </div>

      <div class="nav-center">
        <div class="nav-links-wrap">
          <button @click="router.push('/')" class="nav-link-btn" :class="{ 'nav-active': route.path === '/' }">{{ t.home }}</button>
          <button @click="router.push('/profiles')" class="nav-link-btn" :class="{ 'nav-active': route.path === '/profiles' }">{{ t.profiles }}</button>
          <button @click="router.push('/leaderboard')" class="nav-link-btn" :class="{ 'nav-active': route.path.startsWith('/leaderboard') }">{{ t.leaderboard }}</button>

          <!-- Cherry Blossom Branch -->
          <svg class="blossom-branch" viewBox="0 0 420 54" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet">
            <path d="M0,32 C40,30 80,34 120,28 C160,22 200,20 250,24 C290,27 330,22 390,18" stroke="#3d1a08" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            <path d="M80,28 C90,20 105,14 118,10" stroke="#3d1a08" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <path d="M170,22 C180,14 194,9 210,6" stroke="#3d1a08" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <path d="M270,23 C280,15 296,10 312,7" stroke="#3d1a08" stroke-width="1.1" fill="none" stroke-linecap="round"/>
            <path d="M340,19 C348,12 358,8 370,6" stroke="#3d1a08" stroke-width="0.9" fill="none" stroke-linecap="round"/>
            <path d="M130,28 C138,35 148,40 158,44" stroke="#3d1a08" stroke-width="1" fill="none" stroke-linecap="round"/>
            <g transform="translate(118,10)">
              <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c06080" opacity="0.75" transform="rotate(0)"/>
              <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c06080" opacity="0.72" transform="rotate(72)"/>
              <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#b05070" opacity="0.70" transform="rotate(144)"/>
              <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c06080" opacity="0.72" transform="rotate(216)"/>
              <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#b85078" opacity="0.70" transform="rotate(288)"/>
              <circle cx="0" cy="0" r="1.8" fill="#f0d0a0" opacity="0.9"/>
            </g>
            <g transform="translate(210,6)">
              <ellipse cx="0" cy="-5.5" rx="3.2" ry="5.5" fill="#c86888" opacity="0.80" transform="rotate(20)"/>
              <ellipse cx="0" cy="-5.5" rx="3.2" ry="5.5" fill="#c86888" opacity="0.78" transform="rotate(92)"/>
              <ellipse cx="0" cy="-5.5" rx="3.2" ry="5.5" fill="#b86080" opacity="0.75" transform="rotate(164)"/>
              <ellipse cx="0" cy="-5.5" rx="3.2" ry="5.5" fill="#c06080" opacity="0.78" transform="rotate(236)"/>
              <ellipse cx="0" cy="-5.5" rx="3.2" ry="5.5" fill="#b86080" opacity="0.75" transform="rotate(308)"/>
              <circle cx="0" cy="0" r="2" fill="#f0e0b0" opacity="0.9"/>
            </g>
            <g transform="translate(312,7)">
              <ellipse cx="0" cy="-4.5" rx="2.8" ry="4.5" fill="#b85878" opacity="0.72" transform="rotate(-10)"/>
              <ellipse cx="0" cy="-4.5" rx="2.8" ry="4.5" fill="#c06280" opacity="0.70" transform="rotate(62)"/>
              <ellipse cx="0" cy="-4.5" rx="2.8" ry="4.5" fill="#b85878" opacity="0.68" transform="rotate(134)"/>
              <ellipse cx="0" cy="-4.5" rx="2.8" ry="4.5" fill="#c06080" opacity="0.70" transform="rotate(206)"/>
              <ellipse cx="0" cy="-4.5" rx="2.8" ry="4.5" fill="#b85878" opacity="0.68" transform="rotate(278)"/>
              <circle cx="0" cy="0" r="1.6" fill="#f5d8a8" opacity="0.85"/>
            </g>
            <g transform="translate(370,6)">
              <ellipse cx="0" cy="-3.5" rx="2.2" ry="3.5" fill="#a04868" opacity="0.65" transform="rotate(5)"/>
              <ellipse cx="0" cy="-3.5" rx="2.2" ry="3.5" fill="#b05070" opacity="0.62" transform="rotate(77)"/>
              <ellipse cx="0" cy="-3.5" rx="2.2" ry="3.5" fill="#a04868" opacity="0.60" transform="rotate(149)"/>
              <ellipse cx="0" cy="-3.5" rx="2.2" ry="3.5" fill="#b05070" opacity="0.62" transform="rotate(221)"/>
              <ellipse cx="0" cy="-3.5" rx="2.2" ry="3.5" fill="#a04868" opacity="0.60" transform="rotate(293)"/>
              <circle cx="0" cy="0" r="1.4" fill="#f0d090" opacity="0.8"/>
            </g>
            <ellipse cx="320" cy="38" rx="2.5" ry="1.2" fill="#c06080" opacity="0.4" transform="rotate(35, 320, 38)"/>
            <ellipse cx="400" cy="28" rx="2" ry="1" fill="#b05878" opacity="0.3" transform="rotate(-20, 400, 28)"/>
          </svg>
        </div>
      </div>

      <div class="nav-controls" ref="dropdownRef">
        <div class="lang-dropdown">
          <button class="lang-selected" @click.stop="dropdownOpen = !dropdownOpen">
            <span class="lang-flag">{{ currentLang === 'ru' ? '🇷🇺' : '🇬🇧' }}</span>
            <span class="lang-code">{{ currentLang === 'ru' ? 'RUS' : 'ENG' }}</span>
            <span class="lang-arrow" :class="{ open: dropdownOpen }">▾</span>
          </button>
          <Transition name="dropdown">
            <ul v-if="dropdownOpen" class="lang-menu">
              <li @click.stop="setLang('ru')" :class="{ active: currentLang === 'ru' }"><span>🇷🇺</span> Русский</li>
              <li @click.stop="setLang('en')" :class="{ active: currentLang === 'en' }"><span>🇬🇧</span> English</li>
            </ul>
          </Transition>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div class="profile-tabs" v-if="tabs.length">
      <div
        v-for="tab in tabs" :key="tab.uid"
        class="vtab" :class="{ 'vtab-active': isActiveTab(tab.uid) }"
        @click="router.push(`/${tab.uid}`)"
      >
        <span class="vtab-dot" :class="{ 'vtab-dot-active': isActiveTab(tab.uid) }"></span>
        <span class="vtab-name">{{ tab.name }}</span>
        <button class="vtab-close" @click.stop="removeProfileTab(tab.uid)">×</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { currentLang } from '../store/lang'
import { useProfileTabs, removeProfileTab } from '../store/profileTabs'

const router       = useRouter()
const route        = useRoute()
const dropdownOpen = ref(false)
const dropdownRef  = ref<HTMLElement | null>(null)
const { tabs }     = useProfileTabs()

const isActiveTab = (uid: string) => route.params.uid === uid

const setLang = (lang: string) => {
  currentLang.value = lang
  dropdownOpen.value = false
  console.log(`[МОВА] ${lang.toUpperCase()}`)
}

const handleOutsideClick = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}
onMounted(()  => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

const translations: any = {
  ru: { home: 'Главная', profiles: 'Профили', leaderboard: 'Рейтинг' },
  en: { home: 'Home',    profiles: 'Profiles', leaderboard: 'Leaderboard' }
}
const t = computed(() => translations[currentLang.value])
</script>

<style scoped>
.navbar { display: flex; flex-direction: column; background: #1a1210; position: sticky; top: 0; z-index: 100; }

.nav-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 28px; gap: 16px;
  border-bottom: 4px solid var(--ht-accent);
  box-shadow: 0 6px 20px rgba(176,50,24,0.40);
  position: relative; z-index: 10;
}

.nav-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; flex-shrink: 0; }
.brand-icon { width: 52px; height: 36px; flex-shrink: 0; filter: drop-shadow(0 0 6px rgba(176,50,24,0.6)); transition: filter 0.3s; }
.nav-brand:hover .brand-icon { filter: drop-shadow(0 0 14px rgba(176,50,24,0.9)); }
.logo-text { font-family: var(--font-display); font-size: 1.08rem; font-weight: 700; color: var(--ht-accent-light); letter-spacing: 0.05em; text-shadow: 0 0 16px rgba(207,69,37,0.5); white-space: nowrap; }
.nav-brand:hover .logo-text { color: #e05030; }

.nav-center { flex: 1; display: flex; align-items: center; min-width: 0; }
.nav-links-wrap { position: relative; display: flex; align-items: center; gap: 4px; width: 100%; }

.nav-link-btn {
  background: transparent; border: 1px solid transparent;
  color: var(--ht-text-muted); cursor: pointer;
  font-family: var(--font-heading); font-size: 0.86rem;
  letter-spacing: 0.08em; padding: 7px 16px; border-radius: 4px;
  transition: all 0.2s; white-space: nowrap; position: relative; z-index: 1;
}
.nav-link-btn:hover { color: var(--ht-text); border-color: var(--ht-border-light); background: rgba(74,46,32,0.4); }
/* Активна кнопка — поточна сторінка */
.nav-active {
  color: var(--ht-accent-light) !important;
  border-color: var(--ht-accent-dark) !important;
  background: rgba(176,50,24,0.1) !important;
}

.blossom-branch { width: 340px; height: 50px; flex-shrink: 0; margin-left: -4px; opacity: 0.65; pointer-events: none; overflow: visible; }

.nav-controls { flex-shrink: 0; }
.lang-dropdown { position: relative; }
.lang-selected { display: flex; align-items: center; gap: 7px; background: var(--ht-surface); border: 1px solid var(--ht-border-light); color: var(--ht-text); cursor: pointer; padding: 6px 12px; border-radius: 6px; font-family: var(--font-heading); font-size: 0.8rem; letter-spacing: 0.06em; transition: all 0.2s; }
.lang-selected:hover { border-color: var(--ht-accent); }
.lang-flag { font-size: 1.15rem; line-height: 1; }
.lang-code { color: var(--ht-text-muted); }
.lang-arrow { font-size: 0.7rem; color: var(--ht-accent); transition: transform 0.2s; }
.lang-arrow.open { transform: rotate(180deg); }
.lang-menu { position: absolute; top: calc(100% + 6px); right: 0; background: var(--ht-bg-3); border: 1px solid var(--ht-border-light); border-radius: 6px; list-style: none; margin: 0; padding: 4px; min-width: 130px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 200; }
.lang-menu li { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; font-family: var(--font-heading); font-size: 0.83rem; color: var(--ht-text-muted); border-radius: 4px; transition: all 0.15s; }
.lang-menu li:hover { background: var(--ht-surface-2); color: var(--ht-text); }
.lang-menu li.active { color: var(--ht-accent-light); background: rgba(176,50,24,0.15); }
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.18s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

/* TABS */
.profile-tabs { display: flex; align-items: flex-start; gap: 3px; padding: 0 24px; background: transparent; overflow-x: auto; scrollbar-width: none; position: relative; z-index: 1; }
.profile-tabs::-webkit-scrollbar { display: none; }
.vtab { position: relative; display: flex; align-items: center; gap: 8px; padding: 5px 12px 8px 10px; cursor: pointer; background: var(--ht-bg-2); border: 1px solid var(--ht-border); border-top: none; border-radius: 0 0 10px 10px; box-shadow: -2px 3px 6px rgba(0,0,0,0.3), 2px 3px 6px rgba(0,0,0,0.3); min-width: 80px; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.2s; flex-shrink: 0; }
.vtab-active { background: var(--ht-bg-3) !important; border-color: var(--ht-border-light); border-bottom: 2px solid var(--ht-accent) !important; }
.vtab:not(.vtab-active):hover { background: rgba(58,40,32,0.85); border-color: var(--ht-border-light); }
.vtab-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ht-text-dim); flex-shrink: 0; transition: background 0.2s; }
.vtab-dot-active { background: var(--ht-accent); }
.vtab-name { font-family: var(--font-heading); font-size: 0.78rem; color: var(--ht-text-muted); letter-spacing: 0.04em; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.vtab-active .vtab-name { color: var(--ht-text); }
.vtab-close { display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; background: none; border: none; color: transparent; cursor: pointer; font-size: 13px; border-radius: 3px; flex-shrink: 0; transition: all 0.15s; padding: 0; }
.vtab:hover .vtab-close { color: var(--ht-text-dim); }
.vtab-close:hover { color: var(--ht-accent-light) !important; background: rgba(176,50,24,0.2); }
</style>
