'use client'

import { useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { supabase, saveTestResults } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { QuestionAttempt } from '@/store/types'

export default function TestPage() {
 const {
   username,
   questions,
   currentQuestionIndex,
   attempts,
   timeLeft,
   testStartTime,
   isLoading,
   setQuestions,
   addAttempt,
   nextQuestion,
   updateTimeLeft,
 } = useTestStore()
 const router = useRouter()

 // Fetch questions
 useEffect(() => {
   if (!username) {
     router.push('/')
     return
   }

   async function fetchQuestions() {
     try {
       // First get the list of attempted question IDs through the test_attempts table
       const { data: attemptedQuestions } = await supabase
         .from('test_attempts')
         .select(`
           id,
           question_attempts(question_id)
         `)
         .eq('username', username)

       // Extract all question IDs from all attempts
       const attemptedIds = attemptedQuestions?.flatMap(
         attempt => attempt.question_attempts?.map(qa => qa.question_id) || []
       ) || []

       // Then get unseen questions
       const { data, error } = await supabase
         .from('questions')
         .select('*')
         .not('id', 'in', `(${attemptedIds.join(',')})`)
         .limit(30)
       
       if (error) throw error

       // If no unseen questions or not enough questions, get any 30 questions
       if (!data || data.length < 30) {
         const { data: allQuestions, error: allError } = await supabase
           .from('questions')
           .select('*')
           .limit(30)
         
         if (allError) throw allError
         
         // Shuffle the results in memory
         const shuffledQuestions = allQuestions ? [...allQuestions].sort(() => Math.random() - 0.5) : []
         setQuestions(shuffledQuestions)
         return
       }

       // Shuffle the results in memory
       const shuffledQuestions = [...data].sort(() => Math.random() - 0.5)
       setQuestions(shuffledQuestions)
     } catch (err) {
       console.error('Error fetching questions:', err)
     }
   }

   fetchQuestions()
 }, [username, router, setQuestions])

 const handleAnswer = useCallback(async (answerIndex: number | null) => {
   if (!questions[currentQuestionIndex]) return

   const attempt: QuestionAttempt = {
     questionId: questions[currentQuestionIndex].id,
     questionText: questions[currentQuestionIndex].text,
     options: questions[currentQuestionIndex].options,
     userAnswer: answerIndex ?? -1,
     correctAnswer: questions[currentQuestionIndex].correct_answer,
     timeSpent: 18 - timeLeft,
     isCorrect: answerIndex === questions[currentQuestionIndex].correct_answer,
     category: questions[currentQuestionIndex].category,
     explanation: questions[currentQuestionIndex].explanation,
     skipped: false
   }

   addAttempt(attempt)
   
   if (currentQuestionIndex + 1 >= questions.length) {
     handleTestComplete(attempt)
     return
   }

   nextQuestion()
   updateTimeLeft(18)
 }, [questions, currentQuestionIndex, timeLeft, attempts, testStartTime, username, addAttempt, nextQuestion, updateTimeLeft, router])

 const handleSkip = useCallback(() => {
   if (!questions[currentQuestionIndex]) return

   const attempt: QuestionAttempt = {
     questionId: questions[currentQuestionIndex].id,
     questionText: questions[currentQuestionIndex].text,
     options: questions[currentQuestionIndex].options,
     userAnswer: -1,
     correctAnswer: questions[currentQuestionIndex].correct_answer,
     timeSpent: 18 - timeLeft,
     isCorrect: false,
     category: questions[currentQuestionIndex].category,
     explanation: questions[currentQuestionIndex].explanation,
     skipped: true
   }

   addAttempt(attempt)

   if (currentQuestionIndex + 1 >= questions.length) {
     handleTestComplete(attempt)
     return
   }

   nextQuestion()
   updateTimeLeft(18)
 }, [questions, currentQuestionIndex, timeLeft, addAttempt, nextQuestion, updateTimeLeft])

 useEffect(() => {
   const timer = setInterval(() => {
     updateTimeLeft(timeLeft - 1)
   }, 1000)

   return () => clearInterval(timer)
 }, [timeLeft, updateTimeLeft])

 const handleTestComplete = async (attempt: QuestionAttempt) => {
   const totalTime = Date.now() - testStartTime
   const allAttempts = [...attempts, attempt]
   
   // Start saving in background
   saveTestResults({
     username: username!,
     score: allAttempts.filter(a => a.isCorrect).length,
     timeTaken: Math.floor(totalTime / 1000),
     attempts: allAttempts
   }).catch(err => {
     console.error('Error saving test results:', err)
   })

   // Navigate immediately
   router.push('/results')
 }

 if (isLoading) {
   return (
     <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white relative">
       <div className="absolute inset-0 dotted-background" aria-hidden="true" />
       <main className="container mx-auto min-h-screen flex flex-col items-center justify-center relative">
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

 const question = questions[currentQuestionIndex]

 return (
   <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white relative">
     <div className="absolute inset-0 dotted-background" aria-hidden="true" />
     <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4 relative">
       <Card className="w-full max-w-2xl bg-zinc-800 border-zinc-700">
         <CardHeader className="space-y-4">
           <div className="flex justify-between items-center">
             <CardTitle className="text-zinc-100">
               Question {currentQuestionIndex + 1} of {questions.length}
             </CardTitle>
             <span className={`text-xl font-bold ${
               timeLeft <= 5 ? 'text-red-500' : 'text-zinc-100'
             }`}>
               {18 - timeLeft}s
             </span>
           </div>
           <div className="space-y-1">
             <Progress 
               value={((18 - timeLeft) / 18) * 100} 
               className={`h-2 ${timeLeft === 0 ? 'bg-red-900/30' : ''}`}
               indicatorClassName={timeLeft === 0 ? 'bg-red-500' : undefined}
             />
             {/* {timeLeft <= 5 && (
               <p className="text-red-500 text-sm text-right animate-pulse">
                 Time is running out!
               </p>
             )} */}
           </div>
         </CardHeader>
         <CardContent className="space-y-6">
           <div>
             <span className={`inline-block px-2 py-1 rounded text-sm mb-2 text-white ${
               question.category === 'Verbal' 
                 ? 'bg-purple-600' 
                 : 'bg-blue-600'
             }`}>
               {question.category}
             </span>
             <p className="text-lg text-zinc-100">{question.text}</p>
           </div>
           <div className="grid gap-3">
             {question.options.map((option, index) => (
               <Button
                 key={index}
                 variant="outline"
                 className="w-full text-left justify-start h-auto py-3 bg-zinc-700 hover:bg-zinc-600 hover:text-zinc-200 border-zinc-600 text-white transition-colors"
                 onClick={() => handleAnswer(index)}
               >
                 {option}
               </Button>
             ))}
             <div className="flex justify-end mt-2">
               <Button
                 variant="outline"
                 className="px-6 py-2 bg-amber-500/20 hover:bg-amber-500/50 hover:text-amber-200 border-amber-500/30 text-amber-300 transition-colors"
                 onClick={handleSkip}
               >
                 Skip Question
               </Button>
             </div>
           </div>
         </CardContent>
       </Card>
     </main>
   </div>
 )
}