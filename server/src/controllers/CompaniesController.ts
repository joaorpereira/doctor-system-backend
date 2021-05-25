import { Request, Response } from 'express'
import { CompaniesModel } from '../models/companies/companies-model'
import { getDistance } from '../services/distance'
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
      const { id, lat: user_lat, lon: user_lon } = req.params
      let company = await CompaniesModel.findById(id)
      let distance = 0

      if(company){
        const company_coord : number[] = Object.values(company.geolocation.coordinates) 
        distance = getDistance(Number(user_lat), Number(user_lon), company_coord[0], company_coord[1])
      } else {
        throw new Error('Empresa não localizada');
      }

      distance =  parseFloat(distance.toFixed(1));
     
      res.status(200).send({ company, distance })
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
        ...data,
        name: data.name && data.name ,
        password: data.password && data.password,
        picture: data.picture && data.picture,
        background: data.background && data.background,
        phone_number: data.phone_number && data.phone_number,
        geolocation: data.geolocation && data.geolocation,
        address: data.address && data.address,
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
      await CompaniesModel.deleteOne({ _id: id })
      res.status(200).send({ message: 'Empresa removida com sucesso' })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }
}

export default new CompaniesController()
