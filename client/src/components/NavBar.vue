<template>
  <nav class="navbar">
    <div class="nav-top">
      <div class="nav-brand" @click="nav('/')">
        <svg class="brand-icon" viewBox="0 0 72 52" fill="none">
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
        <span class="logo-text">Wangsheng</span>
      </div>

      <!-- Desktop links + blossom -->
      <div class="nav-center">
        <button @click="nav('/')" class="nav-link-btn" :class="{'nav-active': route.path === '/'}">{{ t.home }}</button>
        <button @click="nav('/profiles')" class="nav-link-btn" :class="{'nav-active': route.path === '/profiles'}">{{ t.profiles }}</button>
        <button @click="nav('/leaderboard')" class="nav-link-btn" :class="{'nav-active': route.path.startsWith('/leaderboard')}">{{ t.leaderboard }}</button>
        <svg class="blossom-branch" viewBox="0 0 280 52" fill="none" preserveAspectRatio="xMinYMid meet">
          <path d="M0,32 C40,30 80,34 120,28 C160,22 200,20 250,18" stroke="#3d1a08" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M80,28 C90,20 105,14 118,10" stroke="#3d1a08" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <path d="M160,22 C172,14 185,9 198,6" stroke="#3d1a08" stroke-width="1.1" fill="none" stroke-linecap="round"/>
          <g transform="translate(118,10)">
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c06080" opacity="0.75" transform="rotate(0)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c06080" opacity="0.72" transform="rotate(72)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#b05070" opacity="0.70" transform="rotate(144)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c06080" opacity="0.72" transform="rotate(216)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#b85078" opacity="0.70" transform="rotate(288)"/>
            <circle cx="0" cy="0" r="1.8" fill="#f0d0a0" opacity="0.9"/>
          </g>
          <g transform="translate(198,6)">
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c86888" opacity="0.78" transform="rotate(15)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c86888" opacity="0.76" transform="rotate(87)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#b86080" opacity="0.74" transform="rotate(159)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#c06080" opacity="0.76" transform="rotate(231)"/>
            <ellipse cx="0" cy="-5" rx="3" ry="5" fill="#b86080" opacity="0.74" transform="rotate(303)"/>
            <circle cx="0" cy="0" r="1.8" fill="#f0e0b0" opacity="0.9"/>
          </g>
        </svg>
      </div>

      <div class="nav-right">
        <!-- Lang -->
        <div class="lang-dropdown" ref="dropdownRef">
          <button class="lang-btn" @click.stop="dropdownOpen = !dropdownOpen">
            <span>{{ currentLang === 'ru' ? '🇷🇺' : '🇬🇧' }}</span>
            <span class="lang-code">{{ currentLang === 'ru' ? 'RUS' : 'ENG' }}</span>
            <span class="lang-arrow" :class="{open: dropdownOpen}">▾</span>
          </button>
          <Transition name="dd">
            <ul v-if="dropdownOpen" class="lang-menu">
              <li @click.stop="setLang('ru')" :class="{active: currentLang==='ru'}"><span>🇷🇺</span> Русский</li>
              <li @click.stop="setLang('en')" :class="{active: currentLang==='en'}"><span>🇬🇧</span> English</li>
            </ul>
          </Transition>
        </div>
        <!-- Hamburger (mobile) -->
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{open: menuOpen}">
          <span/><span/><span/>
        </button>
      </div>
    </div>

    <!-- Mobile dropdown menu -->
    <Transition name="mob">
      <div v-if="menuOpen" class="mob-menu">
        <button @click="nav('/')" class="mob-link" :class="{'mob-active': route.path === '/'}">{{ t.home }}</button>
        <button @click="nav('/profiles')" class="mob-link" :class="{'mob-active': route.path === '/profiles'}">{{ t.profiles }}</button>
        <button @click="nav('/leaderboard')" class="mob-link" :class="{'mob-active': route.path.startsWith('/leaderboard')}">{{ t.leaderboard }}</button>
      </div>
    </Transition>

    <!-- Profile tabs -->
    <div class="profile-tabs" v-if="tabs.length">
      <div v-for="tab in tabs" :key="tab.uid" class="vtab" :class="{'vtab-active': isActiveTab(tab.uid)}" @click="router.push(`/${tab.uid}`)">
        <span class="vtab-dot" :class="{'vtab-dot-active': isActiveTab(tab.uid)}"/>
        <span class="vtab-name">{{ tab.name }}</span>
        <button class="vtab-x" @click.stop="removeProfileTab(tab.uid)">×</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { currentLang } from '../store/lang'
import { useProfileTabs, removeProfileTab } from '../store/profileTabs'

const router = useRouter(), route = useRoute()
const dropdownOpen = ref(false), menuOpen = ref(false)
const dropdownRef = ref<HTMLElement|null>(null)
const { tabs } = useProfileTabs()
const isActiveTab = (uid: string) => route.params.uid === uid
const nav = (p: string) => { router.push(p); menuOpen.value = false }
const setLang = (l: string) => { currentLang.value = l; dropdownOpen.value = false }
const outside = (e: MouseEvent) => { if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) dropdownOpen.value = false }
onMounted(() => document.addEventListener('click', outside))
onUnmounted(() => document.removeEventListener('click', outside))
const translations: any = {
  ru: { home: 'Главная', profiles: 'Профили', leaderboard: 'Рейтинг' },
  en: { home: 'Home', profiles: 'Profiles', leaderboard: 'Leaderboard' }
}
const t = computed(() => translations[currentLang.value])
</script>

<style scoped>
.navbar { display: flex; flex-direction: column; background: #1a1210; position: sticky; top: 0; z-index: 100; }
.nav-top { display: flex; align-items: center; gap: 10px; padding: 10px 28px; border-bottom: 4px solid var(--ht-accent); box-shadow: 0 6px 20px rgba(176,50,24,.40); position: relative; z-index: 10; }

/* Brand */
.nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; flex-shrink: 0; user-select: none; }
.brand-icon { width: 42px; height: 30px; flex-shrink: 0; filter: drop-shadow(0 0 6px rgba(176,50,24,.6)); transition: filter .3s; }
.nav-brand:hover .brand-icon { filter: drop-shadow(0 0 14px rgba(176,50,24,.9)); }
.logo-text { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--ht-accent-light); letter-spacing: .05em; white-space: nowrap; text-shadow: 0 0 16px rgba(207,69,37,.5); }

/* Desktop nav */
.nav-center { flex: 1; display: flex; align-items: center; gap: 4px; }
.nav-link-btn { background: transparent; border: 1px solid transparent; color: var(--ht-text-muted); cursor: pointer; font-family: var(--font-heading); font-size: .86rem; letter-spacing: .08em; padding: 7px 14px; border-radius: 4px; transition: all .2s; white-space: nowrap; }
.nav-link-btn:hover { color: var(--ht-text); border-color: var(--ht-border-light); background: rgba(74,46,32,.4); }
.nav-active { color: var(--ht-accent-light) !important; border-color: var(--ht-accent-dark) !important; background: rgba(176,50,24,.1) !important; }
.blossom-branch { width: 220px; height: 42px; flex-shrink: 0; opacity: .6; pointer-events: none; }

/* Right */
.nav-right { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }

/* Lang */
.lang-dropdown { position: relative; }
.lang-btn { display: flex; align-items: center; gap: 6px; background: var(--ht-surface); border: 1px solid var(--ht-border-light); color: var(--ht-text); cursor: pointer; padding: 6px 10px; border-radius: 6px; font-family: var(--font-heading); font-size: .8rem; transition: all .2s; }
.lang-btn:hover { border-color: var(--ht-accent); }
.lang-code { color: var(--ht-text-muted); }
.lang-arrow { font-size: .7rem; color: var(--ht-accent); transition: transform .2s; }
.lang-arrow.open { transform: rotate(180deg); }
.lang-menu { position: absolute; top: calc(100% + 6px); right: 0; background: var(--ht-bg-3); border: 1px solid var(--ht-border-light); border-radius: 6px; list-style: none; margin: 0; padding: 4px; min-width: 130px; box-shadow: 0 8px 24px rgba(0,0,0,.5); z-index: 200; }
.lang-menu li { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; font-family: var(--font-heading); font-size: .83rem; color: var(--ht-text-muted); border-radius: 4px; transition: all .15s; }
.lang-menu li:hover { background: var(--ht-surface-2); color: var(--ht-text); }
.lang-menu li.active { color: var(--ht-accent-light); background: rgba(176,50,24,.15); }
.dd-enter-active,.dd-leave-active { transition: all .18s ease; }
.dd-enter-from,.dd-leave-to { opacity: 0; transform: translateY(-6px); }

/* Hamburger - hidden on desktop */
.hamburger { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 5px; width: 36px; height: 36px; background: var(--ht-surface); border: 1px solid var(--ht-border-light); border-radius: 6px; cursor: pointer; padding: 0; flex-shrink: 0; }
.hamburger span { display: block; width: 18px; height: 2px; background: var(--ht-text-muted); border-radius: 1px; transition: all .25s; }
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.mob-menu { display: flex; flex-direction: column; gap: 2px; background: var(--ht-bg-2); border-bottom: 2px solid var(--ht-accent); padding: 8px 14px 12px; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
.mob-link { background: transparent; border: none; color: var(--ht-text-muted); cursor: pointer; font-family: var(--font-heading); font-size: 1rem; letter-spacing: .06em; padding: 13px 16px; border-radius: 6px; text-align: left; width: 100%; transition: all .15s; }
.mob-link:hover { background: rgba(74,46,32,.4); color: var(--ht-text); }
.mob-active { color: var(--ht-accent-light) !important; background: rgba(176,50,24,.1) !important; }
.mob-enter-active,.mob-leave-active { transition: all .22s ease; }
.mob-enter-from,.mob-leave-to { opacity: 0; transform: translateY(-8px); }

/* Tabs */
.profile-tabs { display: flex; align-items: flex-start; gap: 3px; padding: 0 16px; background: transparent; overflow-x: auto; scrollbar-width: none; position: relative; z-index: 1; }
.profile-tabs::-webkit-scrollbar { display: none; }
.vtab { position: relative; display: flex; align-items: center; gap: 7px; padding: 5px 10px 8px 8px; cursor: pointer; background: var(--ht-bg-2); border: 1px solid var(--ht-border); border-top: none; border-radius: 0 0 10px 10px; min-width: 70px; max-width: 150px; white-space: nowrap; overflow: hidden; flex-shrink: 0; transition: all .2s; }
.vtab-active { background: var(--ht-bg-3) !important; border-color: var(--ht-border-light); border-bottom: 2px solid var(--ht-accent) !important; }
.vtab:not(.vtab-active):hover { background: rgba(58,40,32,.85); }
.vtab-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--ht-text-dim); flex-shrink: 0; }
.vtab-dot-active { background: var(--ht-accent); }
.vtab-name { font-family: var(--font-heading); font-size: .75rem; color: var(--ht-text-muted); overflow: hidden; text-overflow: ellipsis; flex: 1; }
.vtab-active .vtab-name { color: var(--ht-text); }
.vtab-x { display: flex; align-items: center; justify-content: center; width: 14px; height: 14px; background: none; border: none; color: transparent; cursor: pointer; font-size: 12px; border-radius: 3px; flex-shrink: 0; padding: 0; transition: all .15s; }
.vtab:hover .vtab-x { color: var(--ht-text-dim); }
.vtab-x:hover { color: var(--ht-accent-light) !important; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-top { padding: 10px 14px; }
  .nav-center { display: none; }
  .hamburger { display: flex; }
  .lang-code { display: none; }
}
</style>
