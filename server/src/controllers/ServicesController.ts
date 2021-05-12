import { Request, Response } from 'express'
import { ServicesModel } from '../models/services/services-model'
import { Status, IServices } from '../models/services/services-types'

class ServicesController {
  async getServicesList(req: Request, res: Response) {
    try {
      const { id } = req.params
      const status: Status = Status['ATIVO']

      const services = ServicesModel.find({
        company_id: id,
        status,
      }).select('_id title')

      const newServices = services.map(s => ({ label: s.title, value: s._id }))

      res.status(200).send({
        services: newServices,
      })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const service: IServices = await new ServicesModel(req.body).save()
      res.status(201).send({ service, message: 'Serviço criado com sucesso' })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }
}

export default new ServicesController()
