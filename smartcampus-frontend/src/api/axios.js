import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sc_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// Handle 401 / 403 globally
let isRedirecting = false
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login') {
        isRedirecting = true
        localStorage.removeItem('sc_token')
        localStorage.removeItem('sc_user')
        window.location.href = '/login'
        setTimeout(() => { isRedirecting = false }, 3000)
      }
    }
    return Promise.reject(error)
  },
)

export default api
