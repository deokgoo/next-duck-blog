import { NextApiRequest, NextApiResponse } from 'next'
import { getAllData, registerWeight } from 'service/firebase'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const uuid = req.query.id
  const { originWeight, todayWeight } = req.body

  console.log(originWeight, todayWeight)

  const date = new Date().getDate()

  if (typeof uuid === 'string') registerWeight(uuid, date, originWeight, todayWeight)

  return res.status(200).send('success')
}
