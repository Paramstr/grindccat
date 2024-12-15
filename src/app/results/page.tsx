'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResultsPage() {
  const { attempts, username, resetTest, testStartTime } = useTestStore()
  const router = useRouter()
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>([])

  useEffect(() => {
    if (!attempts.length || !username) {
      resetTest()
      router.push('/')
    }
  }, [attempts, username, router, resetTest])

  if (!attempts.length || !username) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-white mb-4">No test results available</p>
              <Button 
                onClick={() => router.push('/')} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
  const totalTime = Math.floor((Date.now() - testStartTime) / 1000)

  const toggleExplanation = (index: number) => {
    setExpandedExplanations(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="container mx-auto min-h-screen flex flex-col items-center py-8 px-4">
        <Card className="w-full max-w-3xl bg-gray-800 border-gray-700 mb-8">
          <CardHeader className="space-y-4">
            <CardTitle className="text-white text-center text-2xl">
              Results for {username}
            </CardTitle>
            <div className="text-center space-y-2">
              <p className="text-xl text-white">Score: {score} / {attempts.length}</p>
              <p className="text-lg text-gray-400">Total Time: {totalTime} seconds</p>
            </div>
          </CardHeader>
        </Card>

        <div className="w-full max-w-3xl space-y-6">
          {attempts.map((attempt, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardHeader className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-1 rounded text-sm mb-2 text-white ${
                      attempt.category === 'Verbal' 
                        ? 'bg-purple-600' 
                        : 'bg-blue-600'
                    }`}>
                      {attempt.category}
                    </span>
                    <p className="text-lg font-medium text-white">{attempt.questionText}</p>
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
                      className={`p-3 rounded-md border text-white ${
                        optionIndex === attempt.correctAnswer
                          ? 'bg-green-900/30 border-green-500/50'
                          : optionIndex === attempt.userAnswer && !attempt.isCorrect
                          ? 'bg-red-900/30 border-red-500/50'
                          : 'bg-gray-700/50 border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{option}</span>
                        {optionIndex === attempt.correctAnswer && (
                          <div className="flex items-center">
                            <span className="text-green-500 text-sm mr-2">✓ Correct Answer</span>
                            {attempt.isCorrect && (
                              <button
                                onClick={() => toggleExplanation(index)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <InformationCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        )}
                        {optionIndex === attempt.userAnswer && !attempt.isCorrect && (
                          <span className="text-red-500 text-sm">✗ Your Answer</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <AnimatePresence>
                  {(expandedExplanations.includes(index) || !attempt.isCorrect) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-md bg-blue-900/30 border border-blue-500/30 text-blue-200 mt-2">
                        <p className="text-sm">{attempt.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-sm text-gray-400">
                  Time taken: {attempt.timeSpent} seconds
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          onClick={() => {
            resetTest()
            router.push('/')
          }} 
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Return Home
        </Button>
      </main>
    </div>
  )
}