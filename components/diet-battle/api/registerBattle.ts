import axios from 'axios'

export const existName = async (name: string) => {
  const url = '/api/diet-battle/login'

  return axios.post(url, { name })
}
