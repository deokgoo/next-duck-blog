import ThinkIcon from '@/components/icos/think'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const DietBattle = () => {
  const ApexCharts = dynamic(() => import('@/components/ApexChart'), { ssr: false })

  useEffect(() => {
    console.log('asdf')
  }, [])

  return (
    <div className="mt-3 text-4xl">
      <div className="grid grid-cols-6 gap-4">
        <div className="col-start-1 col-end-3 text-center font-bold">
          <span className="text-amber-500">Diet </span>battle
        </div>
        <div className="col-end-7 col-span-2 flex justify-center text-yellow-200">
          <ThinkIcon />
        </div>
        <div className="col-start-2 col-span-4 text-center">Instructions</div>
        <div className="col-start-2 col-span-4 text-center">
          <ApexCharts />
        </div>
      </div>
    </div>
  )
}

export default DietBattle
