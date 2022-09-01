import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const nameList = ['giftchoi', 'deokgoo']
  const { name } = req.body

  if (nameList.includes(name)) {
    // giftchoi, deokgoo 정보 다 가져오기

    return res.status(200).send('success')
  } else {
    return res.status(401).json({ error: 'failed name' })
  }
}
