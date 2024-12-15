import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TestState, Question, QuestionAttempt } from './types'

const initialState: TestState = {
  username: null,
  questions: [],
  currentQuestionIndex: 0,
  attempts: [],
  timeLeft: 18,
  testStartTime: 0,
  isLoading: true,
  isTestActive: false,
}

export const useTestStore = create<TestState & {
  setUsername: (username: string) => void
  setQuestions: (questions: Question[]) => void
  setLoading: (isLoading: boolean) => void
  addAttempt: (attempt: QuestionAttempt) => void
  nextQuestion: () => void
  updateTimeLeft: (timeLeft: number) => void
  startTest: () => void
  resetTest: () => void
}>()(
  persist(
    (set) => ({
      ...initialState,
      setUsername: (username) => set({ username }),
      setQuestions: (questions) => set({ questions, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      addAttempt: (attempt) => set((state) => ({ 
        attempts: [...state.attempts, attempt] 
      })),
      nextQuestion: () => set((state) => ({ 
        currentQuestionIndex: state.currentQuestionIndex + 1 
      })),
      updateTimeLeft: (timeLeft) => set({ timeLeft }),
      startTest: () => set({ 
        isTestActive: true, 
        testStartTime: Date.now(),
        timeLeft: 18,
        attempts: [],
        currentQuestionIndex: 0
      }),
      resetTest: () => set(initialState),
    }),
    {
      name: 'test-store',
      partialize: (state) => ({
        username: state.username,
        questions: state.questions
      })
    }
  )
) 