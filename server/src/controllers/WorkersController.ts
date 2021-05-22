import mongoose from 'mongoose'
import { Request, Response } from 'express'
import { WorkersModel } from '../models/workers/workers-model'
import { CompanyWorkerModel } from '../models/relations/companyWorker/companyWorker-model'
import { WorkerServiceModel } from '../models/relations/workerService/workerService-model'
import { Status } from '../models/relations/companyWorker/companyWorker-types'
import { pagarmeService } from '../services/pargar-me'
import { IWorkers, IBankAccount } from '../models/workers/workers-types'
import {
  IWorkerData,
  ICompanyWorkers,
} from '../models/relations/workerService/workerService-types'

class WorkersController {
  async getAllWorkers(req: Request, res: Response) {
    try {
      const workers = await WorkersModel.find()
      res.status(200).send({ workers })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }
  async getWorker(req: Request, res: Response) {
    try {
      const { id } = req.params
      console.log(id)
      const worker = await WorkersModel.findById(id)

      res.status(200).send({ worker })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }
  async create(req: Request, res: Response) {
    const db = mongoose.connection
    const session = await db.startSession()
    session.startTransaction()

    try {
      const {
        company_id,
        worker_data,
      }: { company_id: string; worker_data: IWorkers } = req.body

      const worker = await WorkersModel.findOne({
        $or: [
          { email: worker_data.email },
          { phone_number: worker_data.phone_number },
        ],
      })

      let newWorker = null

      if (!worker) {
        const bank_account: IBankAccount = worker_data.bank_account

        const pagarMeBankAccount = await pagarmeService('bank_accounts', {
          agencia: bank_account.bank_agency,
          bank_code: bank_account.bank_code,
          conta: bank_account.acc_number,
          conta_dv: bank_account.verify_digit,
          document_number: bank_account.cpf_or_cnpj,
          legal_name: bank_account.acc_user_name,
          type: bank_account.acc_type,
        })

        if (pagarMeBankAccount.message) {
          throw pagarMeBankAccount as string
        }

        const pagarMeRecipient = await pagarmeService('recipients', {
          transfer_interval: 'daily',
          transfer_enabled: true,
          bank_account_id: pagarMeBankAccount?.data?.id,
        })

        if (pagarMeRecipient.message) {
          throw pagarMeRecipient as string
        }

        // // create worker

        newWorker = await new WorkersModel({
          ...worker_data,
          recipient_id: pagarMeRecipient?.data?.id as string,
        }).save({ session })
      }

      const worker_id: string = worker ? worker._id : (newWorker?._id as string)

      const newStatus: Status = (
        worker ? worker.status : newWorker?.status
      ) as Status

      const verifyRelationship = await CompanyWorkerModel.findOne({
        company_id,
        worker_id,
        status: {
          $ne: Status[newStatus],
        },
      })

      if (!verifyRelationship) {
        await new CompanyWorkerModel({
          company_id,
          worker_id,
          status: newStatus,
        }).save({ session })
      }

      if (verifyRelationship) {
        await CompanyWorkerModel.findOneAndUpdate(
          {
            company_id,
            worker_id,
          },
          { status: newStatus },
          { session }
        )
      }

      await WorkerServiceModel.insertMany(
        worker_data?.services?.map(
          (serviceId: string) => ({
            service_id: serviceId,
            worker_id,
          }),
          { session }
        ) as []
      )

      await session.commitTransaction()
      session.endSession()

      if (worker && verifyRelationship) {
        throw new Error('Colaborador já cadastrado')
      } else {
        res.status(201).send({
          worker: worker ?? newWorker,
          message: 'Colaborador criado com sucesso',
        })
      }
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      res
        .status(404)
        .send({ error: error.message, message: 'Erro ao criar colaborador' })
    }
  }
  async update(req: Request, res: Response) {
    const { id } = req.params
    const data = req.body

    const update = {
      password: data.password,
      picture: data.picture,
      phone_number: data.phone_number,
    }

    const company = await WorkersModel.findOneAndUpdate({ _id: id }, update, {
      returnOriginal: false,
    })

    res
      .status(200)
      .send({ company, message: 'Colaborador alterado com sucesso' })
  }
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      WorkersModel.deleteOne({ _id: id })
      res.status(200).send({ message: 'Colaborador removido com sucesso' })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }

  async listWorkersByCompany(req: Request, res: Response) {
    try {
      const { company_id } = req.params
      let newListOfWorkers: any = []

      const listWorkersByCompany = await CompanyWorkerModel.find({
        company_id,
        status: { $ne: Status['REMOVIDO'] },
      })
        .populate({ path: 'worker_id', select: '-password -recipient_id' })
        .select('worker_id created_at status')

      for (let worker of listWorkersByCompany) {
        const workerDoc = worker._doc
        const workerData: IWorkerData = worker.worker_id as any
        const workerServices = await WorkerServiceModel.find({
          worker_id: workerData._id,
        })
        newListOfWorkers = [{ ...workerDoc, workerServices }]
      }

      const lifOfWorkers: ICompanyWorkers = newListOfWorkers.map(
        (item: any) => ({
          _id: item._id,
          status: item.status,
          worker: item.worker_id,
          services: item.workerServices,
          created_at: item.created_at,
        })
      )

      res.status(200).send({ lifOfWorkers })
    } catch (error) {
      res.status(404).send({ error: error.message })
    }
  }
}

export default new WorkersController()
