export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const userApi = useUserApi()
  const router = useRouter()

  await authStore.initAuth(userApi)

//   ㅅㅂ 작동 안함
//   const isTauri = typeof window !== 'undefined' && !!window.__TAURI__

//   if (isTauri) {
//     router.replace(authStore.isLoggedIn ? '/notes' : '/login')
//   } else {
//     router.replace(authStore.isLoggedIn ? '/notes' : '/')
//   }
})