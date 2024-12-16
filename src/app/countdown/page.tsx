'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function CountdownPage() {
  const [count, setCount] = useState(3)
  const router = useRouter()
  const { username, startTest, setQuestions, setLoading } = useTestStore()

  // Fetch questions when component mounts
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('questions')
          .select('*')

        if (error) throw error
        if (data) setQuestions(data)
      } catch (error) {
        console.error('Error fetching questions:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [setQuestions, setLoading, router])

  useEffect(() => {
    if (!username) {
      router.push('/')
    }
  }, [username, router])

  useEffect(() => {
    if (!username) return

    const startTime = Date.now()
    let timeoutId: NodeJS.Timeout

    const updateCount = () => {
      const elapsedTime = Date.now() - startTime
      const newCount = 3 - Math.floor(elapsedTime / 1000)
      
      if (newCount >= 0) {
        setCount(newCount)
        timeoutId = setTimeout(updateCount, 1000 - (elapsedTime % 1000))
      } else {
        startTest()
        router.push('/test')
      }
    }

    updateCount()
    return () => clearTimeout(timeoutId)
  }, [username, router, startTest])

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white relative">
      <div className="absolute inset-0 dotted-background" aria-hidden="true" />
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { type: "spring", duration: 0.4 }
            }}
            exit={{ 
              scale: 1.1, 
              opacity: 0,
              transition: { duration: 0.2 }
            }}
            className="relative"
          >
            <div className="text-8xl font-bold text-zinc-100">{count}</div>
          </motion.div>
        </AnimatePresence>
        
      </main>
    </div>
  )
}