import { useState } from 'react'
import { frappeApi } from '../lib/frappeApi'
import AuthPageLayout from './AuthPageLayout'

interface LoginProps {
  onLoginSuccess: () => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const credentials = {
      usr: formData.email,
      pwd: formData.password
    }
    frappeApi.login(credentials)
      .then(() => {
        onLoginSuccess()
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <AuthPageLayout>
      <div className="flex-1 flex flex-col justify-center p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 mb-2">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400">Enter your email and password to sign in</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"></label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/80 dark:bg-gray-700/80 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white transition"
              placeholder="Email"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"></label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/80 dark:bg-gray-700/80 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white transition"
              placeholder="Password"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <input type="checkbox" className="form-checkbox rounded text-cyan-500 mr-2" />
              Remember me
            </label>
            <a href="#" className="text-sm text-cyan-500 hover:underline">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-600 hover:to-blue-600 transition flex items-center justify-center text-lg tracking-wide"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'SIGN IN'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account? <a href="#" className="text-cyan-500 font-semibold hover:underline">Sign up</a>
        </div>
        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex gap-4 mb-2">
            {/* Social icons or links can go here */}
          </div>
          <div>
            &copy; {new Date().getFullYear()} Customize Your Own AI. All rights reserved.
          </div>
        </div>
      </div>
    </AuthPageLayout>
  )
}
