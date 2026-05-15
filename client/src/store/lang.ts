import { ref, watch } from 'vue';

// Зчитуємо мову з кешу браузера, за замовчуванням - російська
export const currentLang = ref(localStorage.getItem('global_lang') || 'ru');

// Слідкуємо за змінами і миттєво зберігаємо в кеш
watch(currentLang, (newLang) => {
  localStorage.setItem('global_lang', newLang);
});
