import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'

import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from '../services/apiClient'

type User = {
  email: string
  roles: string[]
  permissions: string[]
}

type SignInCredentials = {
  email: string
  password: string
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>
  signOut(): void
  user?: User
  isAuthenticated: boolean
}

type AuthProviderProps = {
  children: ReactNode
}

let authChannel: BroadcastChannel

export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  authChannel.postMessage('signOut')

  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')
    authChannel.onmessage = (event) => {
      switch (event.data) {
        case 'signOut':
          signOut()
          break
        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api
        .get('/me')
        .then((response) => {
          const { email, permissions, roles } = response.data

          setUser({ email, permissions, roles })
        })
        //só vai cair no catch se o interceptor do axios não conseguir tratar (não for erro de refresh token)
        .catch(() => {
          signOut()
        })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const { roles, permissions, token, refreshToken } = response.data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      setUser({
        email,
        roles,
        permissions,
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}
