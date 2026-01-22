'use client'

import { createContext, useContext, useState, useEffect, useCallback, Suspense, type ReactNode } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { setToken, getToken, removeToken } from '@/lib/api/client'
import { useUserInfo, useUserMenu, useUserApi } from '@/lib/api/hooks'
import { ApiError } from '@/lib/api/client'
import { baseApi } from '@/lib/api'

interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
  roles: Array<{ id: number; name: string }>
  is_superuser: boolean
  is_active: boolean
}

interface MenuItem {
  id: number
  title: string
  path?: string
  icon?: string
  children?: MenuItem[]
}

interface AuthContextType {
  user: UserInfo | null
  menus: MenuItem[]
  // apis: string[]
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthConsumer({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useUserInfo()

  const { data: menuData, refetch: refetchMenu } = useUserMenu()
  // const { data: apiData } = useUserApi()

  useEffect(() => {
    const token = getToken()
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (userError) {
      if (userError instanceof ApiError && (userError.code === 401 || userError.code === 403)) {
        handleLogout()
      }
    }
  }, [userError])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await baseApi.login({ username, password })
      setToken(res.access_token)
      setIsAuthenticated(true)
      await refetchUser()
      await refetchMenu()
      router.push(redirect || '/dashboard')
    } catch (error) {
      throw error instanceof Error ? error : new Error('登录失败')
    }
  }, [router, redirect, refetchUser])

  const handleLogout = useCallback(() => {
    removeToken()
    setIsAuthenticated(false)
    router.push('/login')
  }, [router])

  const value: AuthContextType = {
    user: userData as UserInfo | null,
    menus: (menuData as MenuItem[]) || [],
    // apis: (apiData as string[]) || [],
    isLoading: userLoading,
    isAuthenticated,
    login,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthConsumer>{children}</AuthConsumer>
    </Suspense>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
