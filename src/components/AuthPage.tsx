'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/providers/AuthProvider'
import LoadingSpinner from './LoadingSpinner'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const { login, register, loginWithGoogle, loginWithApple, loading } = useAuth()

  const loginForm = useForm<LoginForm>()
  const registerForm = useForm<RegisterForm>()

  const handleLogin = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
    } catch (error) {
      console.error('Errore durante il login:', error)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', {
        type: 'manual',
        message: 'Le password non coincidono'
      })
      return
    }

    try {
      await register(data.name, data.email, data.password)
    } catch (error) {
      console.error('Errore durante la registrazione:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Sbobine</h1>
          <p className="text-gray-600">Trasforma le tue lezioni in conoscenza</p>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Non hai un account? ' : 'Hai già un account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {isLogin ? 'Registrati ora' : 'Accedi qui'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLogin ? (
            <form className="space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    {...loginForm.register('email', {
                      required: 'Email richiesta',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email non valida'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className="input-field"
                    placeholder="mario.rossi@email.com"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...loginForm.register('password', {
                      required: 'Password richiesta',
                      minLength: {
                        value: 6,
                        message: 'Password deve essere di almeno 6 caratteri'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input-field pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center"
                >
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={registerForm.handleSubmit(handleRegister)}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <div className="mt-1">
                  <input
                    {...registerForm.register('name', {
                      required: 'Nome richiesto',
                      minLength: {
                        value: 2,
                        message: 'Nome deve essere di almeno 2 caratteri'
                      }
                    })}
                    type="text"
                    autoComplete="name"
                    className="input-field"
                    placeholder="Mario Rossi"
                  />
                  {registerForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    {...registerForm.register('email', {
                      required: 'Email richiesta',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email non valida'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className="input-field"
                    placeholder="mario.rossi@email.com"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerForm.register('password', {
                      required: 'Password richiesta',
                      minLength: {
                        value: 6,
                        message: 'Password deve essere di almeno 6 caratteri'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input-field pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Conferma password
                </label>
                <div className="mt-1">
                  <input
                    {...registerForm.register('confirmPassword', {
                      required: 'Conferma password richiesta'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input-field"
                    placeholder="••••••••"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center"
                >
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {loading ? 'Registrazione in corso...' : 'Registrati'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Oppure continua con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                onClick={loginWithApple}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="ml-2">Apple</span>
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="mt-6">
              <div className="text-xs text-gray-500 text-center">
                Registrandoti accetti i nostri{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Termini di Servizio
                </a>{' '}
                e{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
