<template>
  <div class="radar-wrapper">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface BuildStats {
  critRate: number; critDamage: number; hp: number;
  attack: number; defense: number; mastery: number; er: number;
}

const props = defineProps<{ stats: BuildStats; eliteStats: BuildStats; lang?: string }>();

const statKeys: (keyof BuildStats)[] = ['critRate','critDamage','hp','attack','defense','mastery','er'];

// ── Human-readable format per stat ──
// hp, attack, defense, mastery — show as integer
// critRate, critDamage, er — show as X.X% (already stored as percentage values)
function fmtStat(key: keyof BuildStats, value: number): string {
  if (['critRate','critDamage','er'].includes(key)) {
    return value.toFixed(1) + '%';
  }
  return Math.round(value).toLocaleString();
}

const chartData = computed(() => {
  const isRu = props.lang !== 'en';
  const labels = isRu
    ? ['Крит. Шанс','Крит. Урон','HP','Сила атаки','Защита','Мастерство','Восст. энергии']
    : ['CRIT Rate','CRIT DMG','HP','ATK','DEF','EM','Energy Recharge'];

  // Normalize each stat against its own top-1% reference
  // Cap at 120 to allow "exceeding" to show visually
  const norm = statKeys.map(k => {
    const u = props.stats[k]      ?? 0;
    const e = props.eliteStats[k] ?? 0;
    if (e <= 0) return u > 0 ? 100 : 0;
    return Math.min((u / e) * 100, 120);
  });

  return {
    labels,
    datasets: [
      {
        label: isRu ? 'Ваш показатель' : 'Your Stats',
        data: norm,
        backgroundColor: 'rgba(176, 50, 24, 0.18)',
        borderColor: '#cf4525',
        borderWidth: 2,
        pointBackgroundColor: '#cf4525',
        pointBorderColor: '#f0d8c0',
        pointHoverBackgroundColor: '#e2b840',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: isRu ? 'Топ 1%' : 'Top 1%',
        data: statKeys.map(() => 100),
        borderColor: 'rgba(189, 168, 210, 0.45)',
        borderDash: [6, 4],
        borderWidth: 1.5,
        fill: false,
        pointRadius: 0,
      }
    ]
  };
});

const chartOptions = computed(() => {
  const isRu = props.lang !== 'en';
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        suggestedMax: 110,
        angleLines: { color: 'rgba(74, 46, 32, 0.7)' },
        grid:        { color: 'rgba(74, 46, 32, 0.6)' },
        pointLabels: {
          color: '#9a8060',
          font: { size: 11, family: "'Courier Prime', monospace" }
        },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#ecdac4',
          font: { family: "'Courier Prime', monospace", size: 11 },
          boxWidth: 14, padding: 14
        }
      },
      tooltip: {
        backgroundColor: '#1a1210',
        titleColor: '#cf4525',
        bodyColor: '#ecdac4',
        borderColor: '#4a2e20',
        borderWidth: 1,
        callbacks: {
          label: function(ctx: any) {
            const key   = statKeys[ctx.dataIndex];
            const uVal  = props.stats[key]      ?? 0;
            const eVal  = props.eliteStats[key] ?? 0;
            const label = ctx.dataset.label || '';

            if (ctx.datasetIndex === 0) {
              // Show precise user value, and precise elite reference — no Math.round that causes 299.x → 300
              const uStr = fmtStat(key, uVal);
              const eStr = fmtStat(key, eVal);
              const pct  = eVal > 0 ? ((uVal / eVal) * 100).toFixed(0) : '—';
              return `${label}: ${uStr} (${pct}%) | ${isRu ? 'Топ 1% Ср.' : 'Top 1% Avg'}: ${eStr}`;
            }
            return `${label}: ${fmtStat(key, eVal)}`;
          }
        }
      }
    }
  };
});
</script>

<style scoped>
.radar-wrapper { height: 340px; width: 100%; position: relative; }
</style>
