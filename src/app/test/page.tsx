'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

interface Question {
 id: string
 category: string
 text: string
 options: string[]
 correct_answer: number
 explanation: string
}

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

export default function TestPage() {
 const searchParams = useSearchParams()
 const username = searchParams.get('username')
 const [questions, setQuestions] = useState<Question[]>([])
 const [currentQuestion, setCurrentQuestion] = useState(0)
 const [attempts, setAttempts] = useState<QuestionAttempt[]>([])
 const [timeLeft, setTimeLeft] = useState(18)
 const [startTime] = useState<number>(Date.now())
 const [isLoading, setIsLoading] = useState(true)
 const router = useRouter()

 // Fetch questions
 useEffect(() => {
   if (!username) {
     router.push('/')
     return
   }

   async function fetchQuestions() {
     try {
       console.log('Fetching questions from Supabase...')
       const { data, error } = await supabase
         .from('questions')
         .select('*')
       
       if (error) {
         console.error('Supabase error:', error)
         return
       }

       if (!data || data.length === 0) {
         console.warn('No questions found')
         return
       }

       console.log(`Successfully loaded ${data.length} questions`)
       setQuestions(data)
       setIsLoading(false)
     } catch (err) {
       console.error('Error fetching questions:', err)
     }
   }

   fetchQuestions()
 }, [username, router])

 const handleAnswer = useCallback(async (answerIndex: number | null) => {
   if (!questions[currentQuestion]) return

   const timeSpent = 18 - timeLeft
   const attempt: QuestionAttempt = {
     questionId: questions[currentQuestion].id,
     questionText: questions[currentQuestion].text,
     options: questions[currentQuestion].options,
     userAnswer: answerIndex ?? -1,
     correctAnswer: questions[currentQuestion].correct_answer,
     timeSpent,
     isCorrect: answerIndex === questions[currentQuestion].correct_answer,
     category: questions[currentQuestion].category
   }

   const newAttempts = [...attempts, attempt]
   setAttempts(newAttempts)
   
   if (currentQuestion + 1 >= questions.length) {
     // Test complete - save attempt and navigate to results
     const totalTime = Date.now() - startTime
     
     // Save attempt
     try {
       const { data: attemptData, error: attemptError } = await supabase
         .from('attempts')
         .insert([{
           username: username,
           score: newAttempts.filter(a => a.isCorrect).length,
           time_taken: Math.floor(totalTime / 1000)
         }])
         .select()

       if (attemptError) throw attemptError

       if (attemptData && attemptData[0]) {
         // Save individual question attempts
         const questionAttempts = newAttempts.map(attempt => ({
           attempt_id: attemptData[0].id,
           question_id: attempt.questionId,
           user_answer: attempt.userAnswer,
           is_correct: attempt.isCorrect,
           time_taken: attempt.timeSpent
         }))

         const { error: questionAttemptsError } = await supabase
           .from('question_attempts')
           .insert(questionAttempts)

         if (questionAttemptsError) throw questionAttemptsError
       }

       // Properly encode the URL parameters
       const encodedAttempts = encodeURIComponent(JSON.stringify(newAttempts))
       const encodedUsername = encodeURIComponent(username || '')
       const searchParams = new URLSearchParams()
       searchParams.set('attempts', encodedAttempts)
       searchParams.set('time', totalTime.toString())
       searchParams.set('username', encodedUsername)

       router.push(`/results?${searchParams.toString()}`)
     } catch (err) {
       console.error('Error saving attempt:', err)
       // Still navigate to results even if save fails, using the same encoding
       const encodedAttempts = encodeURIComponent(JSON.stringify(newAttempts))
       const encodedUsername = encodeURIComponent(username || '')
       const searchParams = new URLSearchParams()
       searchParams.set('attempts', encodedAttempts)
       searchParams.set('time', totalTime.toString())
       searchParams.set('username', encodedUsername)

       router.push(`/results?${searchParams.toString()}`)
     }
     return
   }

   setCurrentQuestion(currentQuestion + 1)
   setTimeLeft(18)
 }, [attempts, currentQuestion, questions, router, startTime, timeLeft, username])

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

 if (isLoading) {
   return (
     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
       <main className="container mx-auto min-h-screen flex flex-col items-center justify-center">
         <p className="text-xl">Loading questions...</p>
       </main>
     </div>
   )
 }

 if (!username || questions.length === 0) {
   return (
     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
       <main className="container mx-auto min-h-screen flex flex-col items-center justify-center">
         <p className="text-xl">No questions available or missing username</p>
         <Button onClick={() => router.push('/')} className="mt-4">
           Return Home
         </Button>
       </main>
     </div>
   )
 }

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