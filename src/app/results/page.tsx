'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { ResultPieChart } from '@/components/ResultPieChart'

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
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white relative">
        <div className="absolute inset-0 dotted-background" aria-hidden="true" />
        <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4 relative">
          <Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
            <CardContent className="p-6 text-center">
              <p className="text-zinc-100 mb-4">No test results available</p>
              <Button 
                onClick={() => router.push('/')} 
                className="bg-zinc-600 hover:bg-zinc-500 text-white"
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white relative">
    <div className="absolute inset-0 dotted-background" aria-hidden="true" />
    <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4 gap-8 relative">
      <div className="text-center space-y-2 mt-8 mb-8">
        <h1 className="text-7xl font-bold text-zinc-100 font-tt-neoris">
          Grind CCAT
        </h1>
        <a 
          href="https://x.com/maybeParam" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-block text-sm text-zinc-500 hover:text-zinc-300 transition-all duration-200 tracking-wide font-light hover:tracking-wider"
        >
          @maybeParam
      </a>
    </div>

        <Card className="w-full max-w-3xl bg-zinc-800/50 border-zinc-700 mb-8 backdrop-blur-sm">
          <CardHeader className="space-y-6">
            <CardTitle className="text-zinc-100 text-center text-3xl font-tt-neoris">
              Results for {username}
            </CardTitle>
            
            <div className="border-b border-zinc-700/50 pb-6">
              <div className="text-center space-y-3">
                <p className="text-2xl text-zinc-100">
                  Total Score: <span className="font-bold">{score}</span> / {attempts.length}
                </p>
                <p className="text-lg text-zinc-400">Time: {totalTime} seconds</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
              <div className="space-y-4">
                <h3 className="inline-block px-3 py-1.5 rounded-lg text-lg font-medium text-white text-center bg-purple-600/20 border border-purple-500/30 w-full">
                  Verbal Reasoning
                </h3>
                <ResultPieChart attempts={attempts} category="Verbal" />
              </div>
              <div className="space-y-4">
                <h3 className="inline-block px-3 py-1.5 rounded-lg text-lg font-medium text-white text-center bg-blue-600/20 border border-blue-500/30 w-full">
                  Math & Logic
                </h3>
                <ResultPieChart attempts={attempts} category="Math & Logic" />
              </div>
            </div>

            <div className="border-t border-zinc-700/50 pt-6">
              <div className="text-center">
                <Button 
                  onClick={() => {
                    resetTest()
                    router.push(`/?username=${username}`)
                  }} 
                  className="bg-zinc-700 hover:bg-zinc-600 text-white"
                >
                  Take Again
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="w-full max-w-3xl space-y-6">
          {attempts.map((attempt, index) => (
            <Card key={index} className="bg-zinc-800 border-zinc-700">
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
                    <p className="text-lg font-medium text-zinc-100">{attempt.questionText}</p>
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
          className="mt-8 bg-zinc-600 hover:bg-zinc-500 text-white"
        >
          Return Home
        </Button>
      </main>
    </div>
  )
}