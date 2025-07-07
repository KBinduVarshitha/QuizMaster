import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, testConnection } from '../../lib/database'
import QuizCard from './QuizCard'
import { Trophy, Target, Clock, Award, AlertCircle } from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string | null
  duration_minutes: number
  total_questions: number
  created_at: string
  is_active: boolean
}

interface UserStats {
  totalAttempts: number
  averageScore: number
  bestScore: number
  timeSpent: number
}

interface QuizAttempt {
  quiz_id: string
  score: number
  total_questions: number
  time_taken_seconds: number
}

interface DashboardProps {
  onStartQuiz: (quizId: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz }) => {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    timeSpent: 0
  })
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing')

  useEffect(() => {
    initializeDashboard()
  }, [user])

  const initializeDashboard = async () => {
    setLoading(true)
    setError(null)
    
    // Test connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      setConnectionStatus('failed')
      setError('Unable to connect to the database. Please check your internet connection and try again.')
      setLoading(false)
      return
    }
    
    setConnectionStatus('connected')
    await fetchQuizzes()
    
    if (user) {
      await fetchUserStats()
    }
  }

  const fetchQuizzes = async () => {
    try {
      console.log('Fetching quizzes...')
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      console.log('Quizzes fetched successfully:', data)
      setQuizzes(data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to load quizzes: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    if (!user) return

    try {
      console.log('Fetching user stats for user:', user.id)
      
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching user stats:', error)
        return
      }

      const attempts = data || []
      setQuizAttempts(attempts)

      if (attempts.length > 0) {
        const totalAttempts = attempts.length
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
        const totalPossibleScore = attempts.reduce((sum, attempt) => sum + attempt.total_questions, 0)
        const averageScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0
        const bestScore = Math.max(...attempts.map(attempt => 
          Math.round((attempt.score / attempt.total_questions) * 100)
        ))
        const timeSpent = attempts.reduce((sum, attempt) => sum + attempt.time_taken_seconds, 0)

        setUserStats({
          totalAttempts,
          averageScore,
          bestScore,
          timeSpent
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const getQuizAttempts = (quizId: string) => {
    return quizAttempts.filter(attempt => attempt.quiz_id === quizId).length
  }

  const getBestScore = (quizId: string) => {
    const attempts = quizAttempts.filter(attempt => attempt.quiz_id === quizId)
    if (attempts.length === 0) return undefined
    return Math.max(...attempts.map(attempt => 
      Math.round((attempt.score / attempt.total_questions) * 100)
    ))
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleRetry = () => {
    initializeDashboard()
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">
          {connectionStatus === 'testing' ? 'Testing connection...' : 'Loading dashboard...'}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Ready to test your knowledge?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalAttempts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.averageScore}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.bestScore}%</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(userStats.timeSpent)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Quizzes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Quizzes</h2>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No quizzes available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStartQuiz={onStartQuiz}
                userAttempts={getQuizAttempts(quiz.id)}
                bestScore={getBestScore(quiz.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard