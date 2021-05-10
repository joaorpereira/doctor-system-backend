import dotenv from 'dotenv'
import express, { Express } from 'express'
import { AddressInfo } from 'net'
import cors from 'cors'
import morgan from 'morgan'
import { connect } from './config/database'
import router from './routes'


dotenv.config()

const app: Express = express()

app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

connect()

app.use('/', router)

const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo
    console.log(`Serving running in http://localhost: ${address.port}`)
  } else {
    console.error(`Failure starting server`)
  }
})
