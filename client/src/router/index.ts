import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import ProfilesView from '../views/ProfilesView.vue'
import Leaderboard from '../views/Leaderboard.vue'
import LeaderboardDetail from '../views/LeaderboardDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',                       name: 'home',               component: HomeView        },
    { path: '/profiles',               name: 'profiles',            component: ProfilesView    },
    { path: '/leaderboard',            name: 'leaderboard',         component: Leaderboard     },
    // /leaderboard/Furina          → date view
    // /leaderboard/Furina/skill    → Furina E DMG view
    // /leaderboard/Navia/rotation_1 → Navia rotation view
    { path: '/leaderboard/:name/:view?', name: 'leaderboard-detail', component: LeaderboardDetail },
    { path: '/:uid',                   name: 'profile',             component: ProfileView     },
  ]
})

export default router
