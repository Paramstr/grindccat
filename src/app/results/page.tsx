'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

interface QuestionAttempt {
  questionId: string
  questionText: string
  options: string[]
  userAnswer: number
  correctAnswer: number
  timeSpent: number
  isCorrect: boolean
  category: string
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const username = searchParams.get('username')
  const attemptsParam = searchParams.get('attempts')
  const timeTaken = searchParams.get('time')

  const [attempts, setAttempts] = useState<QuestionAttempt[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (attemptsParam) {
      try {
        const decodedString = decodeURIComponent(attemptsParam)
        const decodedAttempts = JSON.parse(decodedString)
        setAttempts(decodedAttempts)
      } catch (err) {
        console.error('Error parsing attempts:', err)
        setError('Error loading results. Please try again.')
      }
    }
  }, [attemptsParam])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Return Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!attempts.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400 mb-4">No results available</p>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Return Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const score = attempts.filter(attempt => attempt.isCorrect).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto min-h-screen flex flex-col items-center py-8 px-4">
        <Card className="w-full max-w-3xl bg-gray-800 border-gray-700 mb-8">
          <CardHeader className="space-y-4">
            <CardTitle className="text-white text-center text-2xl">
              Results for {decodeURIComponent(username || '')}
            </CardTitle>
            <div className="text-center space-y-2">
              <p className="text-xl">Score: {score} / {attempts.length}</p>
              <p className="text-lg text-gray-400">Total Time: {Math.floor(Number(timeTaken) / 1000)} seconds</p>
            </div>
          </CardHeader>
        </Card>

        <div className="w-full max-w-3xl space-y-6">
          {attempts.map((attempt, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardHeader className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-1 rounded bg-blue-600 text-sm mb-2">
                      {attempt.category}
                    </span>
                    <p className="text-lg font-medium">{attempt.questionText}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {attempt.isCorrect ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {attempt.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-md border ${
                        optionIndex === attempt.correctAnswer
                          ? 'bg-green-900/30 border-green-500/50'
                          : optionIndex === attempt.userAnswer && !attempt.isCorrect
                          ? 'bg-red-900/30 border-red-500/50'
                          : 'bg-gray-700/50 border-gray-600'
                      }`}
                    >
                      {option}
                      {optionIndex === attempt.correctAnswer && (
                        <span className="ml-2 text-green-500 text-sm">✓ Correct Answer</span>
                      )}
                      {optionIndex === attempt.userAnswer && !attempt.isCorrect && (
                        <span className="ml-2 text-red-500 text-sm">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  Time taken: {attempt.timeSpent} seconds
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          onClick={() => window.location.href = '/'} 
          className="mt-8 bg-blue-600 hover:bg-blue-700"
        >
          Return Home
        </Button>
      </main>
    </div>
  )
}