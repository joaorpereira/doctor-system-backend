import { Request, Response } from 'express'
import { CompaniesModel } from '../models/companies/companies-model'

class CompaniesController {
  async getCompanyList(req: Request, res: Response) {
    try {
      const companies = await CompaniesModel.find()
      res.status(200).send({ companies })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }

  async getCompany(req: Request, res: Response) {
    try {
      const { id } = req.params
      const company = await CompaniesModel.find({ _id: id })
      res.status(200).send({ company })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const company = await new CompaniesModel(req.body).save()
      res.status(201).send({ company, message: 'Empresa criada com sucesso' })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body

      const update = {
        name: data.name,
        password: data.password,
        email: data.email,
        picture: data.picture,
        background: data.background,
        phone_number: data.phone_number,
        geolocation: data.geolocation,
        address: data.address,
      }

      const company = await CompaniesModel.findOneAndUpdate(
        { _id: id },
        update,
        {
          returnOriginal: false,
        }
      )

      res.status(200).send({ company, message: 'Empresa alterada com sucesso' })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      CompaniesModel.deleteOne({ _id: id })
      res.status(200).send({ message: 'Empresa removida com sucesso' })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }
}

export default new CompaniesController()
