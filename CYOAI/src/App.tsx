import React from 'react'
import { useState, useEffect } from 'react'
import { FrappeProvider } from 'frappe-react-sdk'
import { frappeApi } from './lib/frappeApi'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
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
        <LoadingSpinner size="lg" text="Loading Voice AI Platform..." />
      </div>
    )
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
