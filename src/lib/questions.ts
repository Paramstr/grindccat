// src/lib/questions.ts
export interface Question {
    id: number
    category: string
    text: string
    options: string[]
    correctAnswer: number
    explanation: string
    timeLimit?: number // optional override for default 18 seconds
  }
  
  export const questions: Question[] = [
    {
      id: 1,
      category: "Verbal",
      text: "Choose the word most nearly OPPOSITE to: LACKADAISICAL",
      options: ["Uncaring", "Languorous", "Zealous", "Empty", "Whimsical"],
      correctAnswer: 2,
      explanation: "Lackadaisical means lacking enthusiasm, while zealous means showing great enthusiasm - making them opposites."
    },
    {
      id: 2,
      category: "Math & Logic",
      text: "108 is 30% of what number?",
      options: ["324", "360", "380", "400", "420"],
      correctAnswer: 1,
      explanation: "To solve this, we use the equation: 108 = 0.30x. Therefore, x = 108/0.30 = 360."
    },
    {
      id: 3,
      category: "Spatial Reasoning",
      text: "Which pattern completes the sequence?",
      options: ["Pattern A", "Pattern B", "Pattern C", "Pattern D", "Pattern E"],
      correctAnswer: 3,
      explanation: "The sequence follows a rotation pattern where each shape rotates 45 degrees clockwise."
    }
  ]
  
  // Types for storing test results
  export interface TestResult {
    username: string
    correctAnswers: number
    totalQuestions: number
    timePerQuestion: number[]
    timestamp: number
  }
  
  export interface QuestionAttempt {
    questionId: number
    userAnswer: number
    timeSpent: number
    isCorrect: boolean
  }