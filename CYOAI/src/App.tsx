import { useState, useEffect } from 'react'
import { FrappeProvider } from 'frappe-react-sdk'
import { frappeApi } from './lib/frappeApi'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

// Global variables from Vite config
declare global {
  const __APP_VERSION__: string
  const __BUILD_TIME__: string
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      frappeApi.isAuthenticated()
        .then(authenticated => {
          setIsAuthenticated(authenticated)
        })
        .catch(() => {
          setIsAuthenticated(false)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-300">Loading Voice AI Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <FrappeProvider>
        <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
          {isAuthenticated ? (
            <Dashboard />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )}
        </div>
      </FrappeProvider>
    </div>
  )
}

export default App
