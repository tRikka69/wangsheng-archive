import { ref } from 'vue'

export type ProfileTab = {
  uid: string
  name: string
}

const saved = localStorage.getItem('profile_tabs')

const tabs = ref<ProfileTab[]>(
  saved ? JSON.parse(saved) : []
)

function save() {
  localStorage.setItem('profile_tabs', JSON.stringify(tabs.value))
}

export function addProfileTab(tab: ProfileTab) {
  tabs.value = tabs.value.filter(t => t.uid !== tab.uid)
  tabs.value.push(tab)
  if (tabs.value.length > 10) tabs.value.shift()
  save()
}

export function removeProfileTab(uid: string) {
  tabs.value = tabs.value.filter(t => t.uid !== uid)
  save()
}

export function useProfileTabs() {
  return { tabs }
}
