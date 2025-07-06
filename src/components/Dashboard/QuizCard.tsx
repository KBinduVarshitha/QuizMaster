import React from 'react'
import { Clock, FileText, Play, Trophy } from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string | null
  duration_minutes: number
  total_questions: number
  created_at: string
  is_active: boolean
}

interface QuizCardProps {
  quiz: Quiz
  onStartQuiz: (quizId: string) => void
  userAttempts?: number
  bestScore?: number
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onStartQuiz,
  userAttempts = 0,
  bestScore
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {quiz.description || 'Test your knowledge with this quiz'}
            </p>
          </div>
          {bestScore !== undefined && (
            <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">{bestScore}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{quiz.total_questions} questions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{quiz.duration_minutes} minutes</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {userAttempts > 0 ? (
              <span>Attempted {userAttempts} time{userAttempts > 1 ? 's' : ''}</span>
            ) : (
              <span>Not attempted yet</span>
            )}
          </div>
          
          <button
            onClick={() => onStartQuiz(quiz.id)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>{userAttempts > 0 ? 'Retake' : 'Start'} Quiz</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuizCard