// src/app/test/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { questions, QuestionAttempt } from '@/lib/questions'
import { useRouter } from 'next/navigation'

// Main component for the test page
export default function TestPage() {
  // State to track the current question index
  const [currentQuestion, setCurrentQuestion] = useState(0)
  // State to store attempts made by the user
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([])
  // State to track the time left for the current question
  const [timeLeft, setTimeLeft] = useState(18)
  // Store the start time of the test
  const [startTime] = useState<number>(Date.now())
  const router = useRouter()

  // Function to handle user's answer
  const handleAnswer = useCallback((answerIndex: number | null) => {
    const timeSpent = 18 - timeLeft
    const attempt: QuestionAttempt = {
      questionId: questions[currentQuestion].id,
      userAnswer: answerIndex ?? -1,
      timeSpent,
      isCorrect: answerIndex === questions[currentQuestion].correctAnswer
    }

    const newAttempts = [...attempts, attempt]
    setAttempts(newAttempts)
    
    if (currentQuestion + 1 >= questions.length) {
      // If all questions are answered, navigate to results page
      const totalTime = Date.now() - startTime
      router.push(`/results?attempts=${encodeURIComponent(JSON.stringify(newAttempts))}&time=${totalTime}`)
      return
    }

    // Move to the next question
    setCurrentQuestion(currentQuestion + 1)
    setTimeLeft(18)
  }, [attempts, currentQuestion, router, startTime, timeLeft])

  // Effect to handle the countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(null) // Auto-submit on timeout
          return 18
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion, handleAnswer])

  const question = questions[currentQuestion]
  const progressValue = ((18 - timeLeft) / 18) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <span className={`text-xl font-bold ${
                timeLeft <= 5 ? 'text-red-500' : 'text-white'
              }`}>
                {timeLeft}s
              </span>
            </div>
            <div className="space-y-1">
              <Progress value={progressValue} className="h-2" />
              {timeLeft <= 5 && (
                <p className="text-red-500 text-sm text-right animate-pulse">
                  Time is running out!
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <span className="inline-block px-2 py-1 rounded bg-blue-600 text-sm mb-2">
                {question.category}
              </span>
              <p className="text-lg text-white">{question.text}</p>
            </div>
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto py-3 bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}