import { NextApiRequest, NextApiResponse } from 'next'
import { getAllData, registerWeight } from 'service/firebase'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const uuid = req.query.id
  const { originWeight, todayWeight } = req.body

  const date = new Date().getDate()

  if (typeof uuid === 'string') {
    try {
      await registerWeight(uuid, date, originWeight, todayWeight)
      return res.status(200).send('success')
    } catch (e) {
      console.log(e)
      return res.status(500).send('errpr')
    }
  }
}
