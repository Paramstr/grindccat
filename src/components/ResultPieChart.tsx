import { ResponsivePie } from '@nivo/pie'
import { QuestionAttempt } from '@/store/types'

interface ResultPieChartProps {
  attempts: QuestionAttempt[]
  category: string
}

export function ResultPieChart({ attempts, category }: ResultPieChartProps) {
  const categoryAttempts = attempts.filter(a => a.category === category)
  const correct = categoryAttempts.filter(a => a.isCorrect).length
  const incorrect = categoryAttempts.length - correct

  const data = [
    {
      id: 'correct',
      label: 'Correct',
      value: correct,
      color: '#22c55e80', // green-500 with 50% opacity
      borderColor: '#22c55e' // solid green-500
    },
    {
      id: 'incorrect',
      label: 'Incorrect',
      value: incorrect,
      color: '#ef444480', // red-500 with 50% opacity
      borderColor: '#ef4444' // solid red-500
    }
  ]

  return (
    <div className="h-[150px] w-full">
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
        innerRadius={0}
        padAngle={1}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: 'data.color' }}
        borderWidth={2}
        borderColor={{ from: 'color', modifiers: [] }}
        enableArcLinkLabels={false}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ffffff"
   
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateY: 40,
            itemsSpacing: 20,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: '#a1a1aa', // zinc-400
            itemDirection: 'left-to-right',
            symbolSize: 12,
            symbolShape: 'circle'
          }
        ]}
        theme={{
          background: 'transparent',
          text: {
            fill: '#a1a1aa', // zinc-400
            fontSize: 14
          }
        }}
      />
    </div>
  )
} 