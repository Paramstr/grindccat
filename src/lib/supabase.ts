import { createClient } from '@supabase/supabase-js'
import { QuestionAttempt } from '@/store/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function saveAttempt(attempt: QuestionAttempt & { 
  username: string, 
  test_attempt_id: string 
}) {
  const response = await fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save attempt')
  }

  return response.json()
}

export async function saveTestResults(data: {
  username: string,
  score: number,
  timeTaken: number,
  attempts: QuestionAttempt[]
}) {
  const response = await fetch('/api/test-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save test results')
  }

  return response.json()
}

export async function getQuestionCountsByCategory() {
  const { data, error } = await supabase
    .from('questions')
    .select('category', { count: 'exact', head: true })
    .or('category.eq.Verbal,category.eq.Math & Logic')
    .then(async ({ error: countError }) => {
      if (countError) throw countError;
      
      const verbalCount = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'Verbal');
      
      const mathCount = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'Math & Logic');

      return {
        data: {
          verbal: verbalCount.count || 0,
          math: mathCount.count || 0
        },
        error: null
      };
    });

  if (error) {
    console.error('Error fetching question counts:', error);
    return { verbal: 0, math: 0 };
  }

  return data;
}
