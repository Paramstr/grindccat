export interface Question {
  id: string
  category: string
  text: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface QuestionAttempt {
  questionId: string
  questionText: string
  options: string[]
  userAnswer: number
  correctAnswer: number
  timeSpent: number
  isCorrect: boolean
  category: string
  explanation: string
}

export interface TestState {
  username: string | null
  questions: Question[]
  currentQuestionIndex: number
  attempts: QuestionAttempt[]
  timeLeft: number
  testStartTime: number
  isLoading: boolean
  isTestActive: boolean
} 