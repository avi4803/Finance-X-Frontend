import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://finance-x-assessment.onrender.com/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor: Automatically inject JWT token
api.interceptors.request.use(
  (config) => {
    // Read from localStorage on every request to ensure we have the fresh token
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login")
    
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
