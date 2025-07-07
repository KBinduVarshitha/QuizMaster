import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/database'
import { Trophy, Clock, Target, CheckCircle, XCircle, Home } from 'lucide-react'

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

interface QuizResultsProps {
  quizId: string
  score: number
  totalQuestions: number
  timeTaken: number
  onBackToDashboard: () => void
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quizId,
  score,
  totalQuestions,
  timeTaken,
  onBackToDashboard
}) => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [quizTitle, setQuizTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      // Fetch quiz title
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('question_order')

      if (questionsError) throw questionsError

      // Fetch user's latest attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_quiz_attempts')
        .select('answers')
        .eq('user_id', user?.id)
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (attemptError) throw attemptError

      setQuizTitle(quizData.title)
      setQuestions(questionsData || [])
      setUserAnswers(attemptData.answers || {})
    } catch (error) {
      console.error('Error fetching quiz data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200'
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const scorePercentage = Math.round((score / totalQuestions) * 100)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Header */}
      <div className={`rounded-xl shadow-sm border-2 p-8 mb-8 ${getScoreBackground(scorePercentage)}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className={`h-16 w-16 ${getScoreColor(scorePercentage)}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <h2 className="text-xl text-gray-700 mb-6">{quizTitle}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </div>
              <p className="text-gray-600">Your Score</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {score}/{totalQuestions}
              </div>
              <p className="text-gray-600">Correct Answers</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatTime(timeTaken)}
              </div>
              <p className="text-gray-600">Time Taken</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className={`text-2xl font-bold ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average per Question</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(Math.round(timeTaken / totalQuestions))}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grade</p>
              <p className={`text-2xl font-bold ${getScoreColor(scorePercentage)}`}>
                {scorePercentage >= 90 ? 'A' : scorePercentage >= 80 ? 'B' : 
                 scorePercentage >= 70 ? 'C' : scorePercentage >= 60 ? 'D' : 'F'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Question Review</h3>
        
        <div className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id]
            const isCorrect = userAnswer === question.correct_answer
            
            return (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 flex-1">
                    {index + 1}. {question.question_text}
                  </h4>
                  <div className="flex items-center ml-4">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'A', text: question.option_a },
                    { key: 'B', text: question.option_b },
                    { key: 'C', text: question.option_c },
                    { key: 'D', text: question.option_d }
                  ].map((option) => {
                    const isUserAnswer = userAnswer === option.key
                    const isCorrectAnswer = question.correct_answer === option.key
                    
                    let className = 'p-3 rounded-lg border '
                    
                    if (isCorrectAnswer) {
                      className += 'border-green-500 bg-green-50 text-green-700'
                    } else if (isUserAnswer && !isCorrect) {
                      className += 'border-red-500 bg-red-50 text-red-700'
                    } else {
                      className += 'border-gray-200 bg-gray-50'
                    }
                    
                    return (
                      <div key={option.key} className={className}>
                        <span className="font-medium">{option.key}.</span> {option.text}
                        {isCorrectAnswer && (
                          <span className="ml-2 text-xs font-medium text-green-600">
                            (Correct)
                          </span>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <span className="ml-2 text-xs font-medium text-red-600">
                            (Your Answer)
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={onBackToDashboard}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  )
}

export default QuizResults