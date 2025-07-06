import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import AuthPage from './components/Auth/AuthPage'
import Dashboard from './components/Dashboard/Dashboard'
import QuizInterface from './components/Quiz/QuizInterface'
import QuizResults from './components/Quiz/QuizResults'

type AppState = 'dashboard' | 'quiz' | 'results'

interface QuizData {
  quizId: string
  score?: number
  totalQuestions?: number
  timeTaken?: number
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [appState, setAppState] = useState<AppState>('dashboard')
  const [quizData, setQuizData] = useState<QuizData>({ quizId: '' })

  const handleStartQuiz = (quizId: string) => {
    setQuizData({ quizId })
    setAppState('quiz')
  }

  const handleQuizComplete = (score: number, totalQuestions: number, timeTaken: number) => {
    setQuizData(prev => ({
      ...prev,
      score,
      totalQuestions,
      timeTaken
    }))
    setAppState('results')
  }

  const handleBackToDashboard = () => {
    setAppState('dashboard')
    setQuizData({ quizId: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <Layout>
      {appState === 'dashboard' && (
        <Dashboard onStartQuiz={handleStartQuiz} />
      )}
      
      {appState === 'quiz' && (
        <QuizInterface
          quizId={quizData.quizId}
          onComplete={handleQuizComplete}
          onBack={handleBackToDashboard}
        />
      )}
      
      {appState === 'results' && quizData.score !== undefined && (
        <QuizResults
          quizId={quizData.quizId}
          score={quizData.score}
          totalQuestions={quizData.totalQuestions!}
          timeTaken={quizData.timeTaken!}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </Layout>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App