import { createClient } from '@supabase/supabase-js'
import { QuestionAttempt } from '@/store/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function saveAttempt(attempt: QuestionAttempt & { 
  username: string, 
  test_attempt_id: string 
}) {
  const { data, error } = await supabase
    .from('attempts')
    .insert([{
      username: attempt.username,
      question_id: attempt.questionId,
      question_text: attempt.questionText,
      options: attempt.options,
      user_answer: Number(attempt.userAnswer),
      correct_answer: Number(attempt.correctAnswer),
      time_spent: attempt.timeSpent,
      is_correct: attempt.isCorrect,
      category: attempt.category,
      explanation: attempt.explanation,
      test_attempt_id: attempt.test_attempt_id
    }])
    .select()

  if (error) {
    console.error('Full error:', error)
    throw error
  }
  
  return data
}
