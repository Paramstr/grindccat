'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function CountdownPage() {
  const [count, setCount] = useState(3)
  const router = useRouter()
  const { username, startTest } = useTestStore()

  useEffect(() => {
    if (!username) {
      router.push('/')
    }
  }, [username, router])

  useEffect(() => {
    if (!username) return

    const timer = setInterval(() => {
      setCount((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [username])

  useEffect(() => {
    if (count <= 0) {
      startTest()
      router.push('/test')
    }
  }, [count, router, startTest])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { type: "spring", duration: 0.5 }
            }}
            exit={{ 
              scale: 1.5, 
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            className="relative"
          >
            <div className="text-8xl font-bold">{count}</div>
            <motion.div
              className="absolute inset-0 border-4 border-blue-500 rounded-full"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ 
                scale: 1.5, 
                opacity: 0,
                transition: { duration: 1, repeat: Infinity }
              }}
            />
          </motion.div>
        </AnimatePresence>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-2xl font-medium text-blue-400"
        >
          Get ready...
        </motion.p>
      </main>
    </div>
  )
}