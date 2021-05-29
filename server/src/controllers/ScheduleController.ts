import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Request, Response } from 'express'

dotenv.config()

import { pagarmeService } from '../services/pargar-me'
import { ClientsModel } from '../models/clients/clients-model'
import { ServicesModel } from '../models/services/services-model'
import { CompaniesModel } from '../models/companies/companies-model'
import { WorkersModel } from '../models/workers/workers-model'
import { ScheduleModel } from '../models/schedule/schedule-model'

type CreateParams = {
  company_id: string
  worker_id: string
  client_id: string
  service_id: string
  schedule_date: Date
}

type IFilter = {
  range: {
    start: Date
    end: Date
  }
  company_id: string
}

class ScheduleController {
  async getScheduleList(req: Request, res: Response) {}

  async filterScheduleList(req: Request, res: Response) {
    try {
      const { range, company_id } : IFilter = req.body

      const schedules = await ScheduleModel.find({
        company_id: company_id,
        schedule_date: {
          $gte: range?.start,
          $lte: range?.end,
        },
      }).populate([
        { path: 'service_id', select: 'title service_duration' },
        { path: 'worker_id', select: 'name' },
        { path: 'client_id', select: 'name' },
      ])
      res.status(200).send({ schedules })
    } catch (error) {
      res.status(404).send({ message: 'Erro ao filtrar horário', error: error.message })
    }
  }

  async create(req: Request, res: Response) {
    const db = mongoose.connection
    const session = await db.startSession()
    session.startTransaction()

    try {
      const {
        company_id,
        worker_id,
        client_id,
        service_id,
        schedule_date,
      }: CreateParams = req.body

      const client = await ClientsModel.findById(client_id).select(
        'name email address customer_id document phone_number'
      )

      const worker = await WorkersModel.findById(worker_id).select(
        'recipient_id'
      )

      const company = await CompaniesModel.findById(company_id).select(
        'recipient_id'
      )

      const service = await ServicesModel.findById(service_id).select(
        'price title'
      )

      const finalPrice = Number(service?.price)

      const workerPrice = finalPrice * 0.65
      const companyPrice = finalPrice * 0.25
      const appPrice = finalPrice * 0.1

      const zipCode =
        client && (client.address.cep.split('-').join('') as string)

      const createPayment: any = await pagarmeService('/transactions', {
        amount: finalPrice,

        card_number: '4111111111111111',
        card_cvv: '123',
        card_expiration_date: '0922',
        card_holder_name: 'Morpheus Fishburne',

        customer: {
          external_id: client?.customer_id,
          name: client?.name,
          email: client?.email,
          country: 'br',
          type: client?.document.type === 'cpf' ? 'individual' : 'corporation',
          documents: [
            {
              type: client?.document.type,
              number: String(client?.document.number),
            },
          ],
          phone_numbers: [client?.phone_number],
        },

        billing: {
          name: client?.name,
          address: {
            country: 'br',
            state: client?.address.state,
            city: client?.address.city,
            street: client?.address.street,
            street_number: client?.address.number,
            zipcode: zipCode,
          },
        },
        items: [
          {
            id: service_id,
            title: service?.title,
            unit_price: finalPrice,
            quantity: 1,
            tangible: false,
          },
        ],
        split_rules: [
          {
            recipient_id: company?.recipient_id,
            amount: companyPrice,
          },
          {
            recipient_id: worker?.recipient_id,
            amount: workerPrice,
          },
          {
            recipient_id: 're_ckp9zscoq04a40h9t73nhserw',
            amount: appPrice,
          },
        ],
      })

      if (createPayment.message) {
        throw createPayment as string
      }

      const schedule = await new ScheduleModel({
        company_id: company_id,
        client_id: client_id,
        worker_id: worker_id,
        service_id: service_id,
        schedule_date: schedule_date,
        price: finalPrice,
        transaction_id: createPayment?.data?.id as string,
      }).save({
        session,
      })

      await session.commitTransaction()
      session.endSession()

      res.status(201).send({ schedule, message: 'Horário criado com sucesso' })
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      res
        .status(404)
        .send({ message: 'Erro ao criar horário', error: error.message })
    }
  }
  async update(req: Request, res: Response) {}
  async delete(req: Request, res: Response) {}
}

export default new ScheduleController()
