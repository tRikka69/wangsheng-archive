<template>
  <div class="system-core">
    <NavBar />
    <main class="view-portal">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

:root {
  /* Hu Tao Core Palette */
  --ht-bg:           #110d0b;
  --ht-bg-2:         #1a1210;
  --ht-bg-3:         #231815;
  --ht-surface:      #2d1e18;
  --ht-surface-2:    #3a2820;
  --ht-border:       #4a2e20;
  --ht-border-light: #6a4030;

  /* Accent — faded orange-red */
  --ht-accent:       #b03218;
  --ht-accent-light: #cf4525;
  --ht-accent-dark:  #7a2010;
  --ht-accent-glow:  rgba(176, 50, 24, 0.40);

  /* Gold */
  --ht-gold:         #c4981e;
  --ht-gold-light:   #e2b840;

  /* Ghost / butterfly lavender */
  --ht-ghost:        #bda8d2;
  --ht-ghost-dim:    rgba(189, 168, 210, 0.25);

  /* Pyro element */
  --ht-pyro:         #f06030;

  /* Text */
  --ht-text:         #ecdac4;
  --ht-text-muted:   #9a8060;
  --ht-text-dim:     #5c4030;

  /* Fonts */
  --font-display:    'Cinzel Decorative', serif;
  --font-heading:    'Cinzel', serif;
  --font-body:       'Crimson Pro', serif;
  --font-mono:       'Courier Prime', monospace;
}

html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100%;
  width: 100%;
}

body {
  background-color: var(--ht-bg);
  background-image:
    radial-gradient(ellipse 60% 40% at 10% 50%, rgba(176,50,24,.05) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 90% 20%, rgba(189,168,210,.04) 0%, transparent 60%);
  color: var(--ht-text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
}

* { box-sizing: border-box; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--ht-bg); }
::-webkit-scrollbar-thumb { background: var(--ht-accent-dark); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--ht-accent); }

.system-core {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.view-portal {
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  padding: 32px 44px;
  flex: 1;
}

/* Global headings */
h1, h2, h3 { font-family: var(--font-heading); font-weight: 600; }
h1 { font-family: var(--font-display); }

/* Subtle flame divider utility */
.ht-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ht-border-light), transparent);
  margin: 20px 0;
}

@media(max-width:1200px){.view-portal{padding:24px 28px;}}
@media(max-width:768px){.view-portal{padding:16px 14px;}}
@media(max-width:480px){.view-portal{padding:12px 10px;}}
</style>
