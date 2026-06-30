import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("otli_token") || "")
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("otli_user") || "null")
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(token))

  const saveSession = ({ token: nextToken, user: nextUser }) => {
    if (nextToken) {
      localStorage.setItem("otli_token", nextToken)
      setToken(nextToken)
    }

    if (nextUser) {
      localStorage.setItem("otli_user", JSON.stringify(nextUser))
      setUser(nextUser)
    }
  }

  const logout = () => {
    localStorage.removeItem("otli_token")
    localStorage.removeItem("otli_user")
    setToken("")
    setUser(null)
  }

  const login = async ({ email, password, loginType }) => {
    const { data } = await api.post("/auth/login", { email, password, loginType })
    saveSession({ token: data.token, user: data.user })
    return data
  }

  const refreshMe = async () => {
    if (!localStorage.getItem("otli_token")) {
      setLoading(false)
      return
    }

    try {
      const { data } = await api.get("/auth/me")
      saveSession({ token: localStorage.getItem("otli_token"), user: data.user })
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshMe()
  }, [])

  const value = useMemo(
    () => ({ token, user, loading, login, logout, refreshMe, saveSession }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
