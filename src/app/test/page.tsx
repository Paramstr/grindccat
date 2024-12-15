'use client'

import { useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { saveAttempt, supabase } from '@/lib/supabase'
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
       // First try to get unseen questions
       const { data, error } = await supabase
         .from('questions')
         .select('*')
         .not('id', 'in', 
           supabase
             .from('question_attempts')
             .select('question_id, test_attempts!inner(username)')
             .eq('test_attempts.username', username)
         )
         .order('RANDOM()')
         .limit(30)
       
       if (error) throw error

       // If no unseen questions, get any 50 questions
       if (!data || data.length < 50) {
         const { data: allQuestions, error: allError } = await supabase
           .from('questions')
           .select('*')
           .order('RANDOM()')
           .limit(30)
         
         if (allError) throw allError
         setQuestions(allQuestions || [])
         return
       }

       setQuestions(data)
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
   }

   addAttempt(attempt)
   
   if (currentQuestionIndex + 1 >= questions.length) {
     const totalTime = Date.now() - testStartTime
     
     try {
       const { data: testAttemptData, error: testAttemptError } = await supabase
         .from('test_attempts')
         .insert([{
           username: username,
           score: attempts.filter(a => a.isCorrect).length,
           time_taken: Math.floor(totalTime / 1000)
         }])
         .select()

       if (testAttemptError) throw testAttemptError

       if (testAttemptData?.[0]) {
         const testAttemptId = testAttemptData[0].id
         
         for (const attempt of attempts) {
           await saveAttempt({ 
             ...attempt, 
             username: username!,
             test_attempt_id: testAttemptId
           })
         }
       }
       
       router.push('/results')
     } catch (err) {
       console.error('Error saving attempt:', err)
     }
     return
   }

   nextQuestion()
   updateTimeLeft(18)
 }, [questions, currentQuestionIndex, timeLeft, attempts, testStartTime, username, addAttempt, nextQuestion, updateTimeLeft, router])

 useEffect(() => {
   const timer = setInterval(() => {
     updateTimeLeft(timeLeft - 1)
   }, 1000)

   return () => clearInterval(timer)
 }, [timeLeft, updateTimeLeft])

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

 const question = questions[currentQuestionIndex]
 const progressValue = ((18 - timeLeft) / 18) * 100

 return (
   <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
     <main className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4">
       <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
         <CardHeader className="space-y-4">
           <div className="flex justify-between items-center">
             <CardTitle className="text-white">
               Question {currentQuestionIndex + 1} of {questions.length}
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