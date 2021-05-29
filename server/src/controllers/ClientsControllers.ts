import mongoose from 'mongoose'
import { Request, Response } from 'express'
T
import { pagarmeService } from '../services/pargar-me'
import { ClientsModel } from '../models/clients/clientsModel'
import { IClients, Status, DocumentType } from '../models/clients/clientsTypes'
import { CompanyClientModel } from '../models/relations/companyClient/companyClientModel'

class ClientsControllers {
  async getAllClients(req: Request, res: Response) {
    try {
      const clients = await ClientsModel.find()
      res.status(200).send({ clients })
    } catch (error) {
      res
        .status(404)
        .send({
          message: 'Lista de clientes não encontrada',
          error: error.message,
        })
    }
  }

  async getClient(req: Request, res: Response) {
    try {
      const { id } = req.params
      const client = await ClientsModel.findById(id)

      res.status(200).send({ client })
    } catch (error) {
      res
        .status(404)
        .send({ message: 'Cliente não encontrado', error: error.message })
    }
  }

  async filteredClientList(req: Request, res: Response) {
    try {
      const { filters } = req.body
      const clients = await ClientsModel.find(filters)

      res.status(200).send({ clients, message: 'Lista de clientes encontrada' })
    } catch (error) {
      res
        .status(404)
        .send({ message: 'Cliente não encontrado', error: error.message })
    }
  }

  async create(req: Request, res: Response) {
    const db = mongoose.connection
    const session = await db.startSession()
    session.startTransaction()
    let message = 'Erro ao criar cliente'

    try {
      const {
        company_id,
        client_data,
      }: { company_id: string; client_data: IClients } = req.body

      const client = await ClientsModel.findOne({
        $or: [
          { email: client_data.email },
          { phone_number: client_data.phone_number },
        ],
      })

      let newClient = null

      if (!client) {
        const _id = mongoose.Types.ObjectId()

        const pagarMeCustomer = await pagarmeService('customers', {
          external_id: _id,
          name: client_data.name,
          type:
            client_data.document.type === DocumentType['cpf']
              ? 'individual'
              : 'corporations',
          country: client_data.address.country,
          email: client_data.email,
          documents: [
            {
              type: client_data.document.type,
              number: client_data.document.number,
            },
          ],
          phone_numbers: [client_data.phone_number],
          birthday: client_data.birth_date,
        })

        if (pagarMeCustomer.message) {
          throw pagarMeCustomer as string
        }

        // create client

        newClient = await new ClientsModel({
          ...client_data,
          _id: _id,
          customer_id: pagarMeCustomer?.data?.id as string,
        }).save({ session })
      }

      const client_id: string = client ? client._id : (newClient?._id as string)

      const verifyRelationship = await CompanyClientModel.findOne({
        company_id,
        client_id,
        status: {
          $ne: Status['INATIVO'],
        },
      })

      if (!verifyRelationship) {
        await new CompanyClientModel({
          company_id,
          client_id,
        }).save({ session })
      }

      if (verifyRelationship) {
        await CompanyClientModel.findOneAndUpdate(
          {
            company_id,
            client_id,
          },
          { status: Status['ATIVO'] },
          { session }
        )
      }

      await session.commitTransaction()
      session.endSession()

      if (client && verifyRelationship) {
        message = 'Cliente já cadastrado'
        throw new Error(message)
      } else {
        res.status(201).send({
          client: client ?? newClient,
          message: 'Cliente criado com sucesso',
        })
      }
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      res.status(404).send({ message, error })
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const data = req.body

    try {
      const update = {
        ...data,
        password: data.password,
        picture: data.picture,
        phone_number: data.phone_number,
        address: data.address,
      }

      const client = await ClientsModel.findOneAndUpdate({ _id: id }, update, {
        returnOriginal: false,
      })

      res.status(200).send({ client, message: 'Cliente alterado com sucesso' })
    } catch (error) {
      res.status(404).send({
        message: 'Erro ao alterar dados do cliente',
        error: error.message,
      })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      await ClientsModel.deleteOne({ _id: id })
      res.status(200).send({ message: 'Cliente removido com sucesso' })
    } catch (error) {
      res
        .status(404)
        .send({ message: 'Erro ao remover Cliente', error: error.message })
    }
  }
}

export default new ClientsControllers()
