import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const pagarme_key = process.env.API_PAGAR_ME_KEY as string

const api = axios.create({
  baseURL: 'https://api.pagar.me/1',
})

interface IPagarmeService {
  message?: string
  data?: {
      id: string
  }
}

export const pagarmeService = async (
  endpoint: string,
  data: Object
): Promise<IPagarmeService> => {
  try {
    const response = await api.post(endpoint, {
      api_key: pagarme_key,
      ...data,
    })

    return { data: response.data }
  } catch (err) {
    return {
      message: JSON.stringify(err.response.data.errors[0]),
    }
  }
}
