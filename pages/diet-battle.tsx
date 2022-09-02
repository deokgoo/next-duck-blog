import ThinkIcon from '@/components/icos/think'
import dynamic from 'next/dynamic'
import DietBattleForm from '@/components/diet-battle/form'
import { useEffect, useState } from 'react'
import { getAllData } from 'service/firebase'

const DietBattle = () => {
  const ApexCharts = dynamic(() => import('@/components/ApexChart'), { ssr: false })
  const [dietDate, setDietDate] = useState<any>({})

  useEffect(() => {
    refetchDate()
  }, [])

  const refetchDate = async () => {
    const data = await getAllData()
    if (data) {
      setDietDate(data)
    }
  }

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
        <div className="col-start-2 col-span-4 text-center" style={{ fontSize: '18px' }}>
          CryptoJS의 SHA256의 암호화를 사용하고 있으며 길이 256 사이즈로 저장하고 있습니다. <br />
          서버도 별도의 로그를 남기고있지 않으니 안심해주세요!!
        </div>
        <div className="col-start-1 col-span-6 text-center">
          <ApexCharts dietDate={dietDate} />
        </div>
        <div className="col-start-2 col-span-4 text-center">
          <DietBattleForm refetch={refetchDate} />
        </div>
      </div>
    </div>
  )
}

export default DietBattle
