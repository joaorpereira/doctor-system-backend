import dotenv from 'dotenv'
import express, { Express } from 'express'
import { AddressInfo } from 'net'
import cors from 'cors'
import morgan from 'morgan'
import busboy from 'connect-busboy'
// @ts-ignore
import busboyBodyParser from 'busboy-body-parser'

import { connect } from './config/database'
import router from './routes'



dotenv.config()

const app: Express = express()

app.use(morgan('combined'))
app.use(express.json())
app.use(busboy())
app.use(busboyBodyParser())
app.use(cors())

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
