import { Request, Response } from 'express'
import { CompaniesModel } from '../models/companies/companies-model'

class CompaniesController {
  async create(req: Request, res: Response) {
    try {
      const company = await new CompaniesModel(req.body).save()
      res.status(201).send({ company, message: 'Empresa criada com sucesso' })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }
}

export default new CompaniesController()
