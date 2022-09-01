import axios from 'axios'

export const existName = async (name: string) => {
  const url = '/api/diet-battle/login'

  return axios.post(url, { name })
}

export const registerWeight = async (uuid: string, originWeight: string, todayWeight: number) => {
  const url = `/api/diet-battle/register/${uuid}`

  return axios.post(url, { originWeight, todayWeight })
}
