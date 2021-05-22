import mongoose from 'mongoose'
import { Request, Response } from 'express'
import { WorkersModel } from '../models/workers/workers-model'
import { CompanyWorkerModel } from '../models/relations/companyWorker/companyWorker-model'
import { WorkerServiceModel } from '../models/relations/workerService/workerService-model'
import { Status } from '../models/relations/companyWorker/companyWorker-types'
import { pagarmeService } from '../services/pargar-me'
import { IWorkers, IBankAccount } from '../models/workers/workers-types'

class WorkersController {
  async getListWorkers(req: Request, res: Response) {}
  async getWorker(req: Request, res: Response) {}
  async create(req: Request, res: Response) {
    const db = mongoose.connection
    const session = await db.startSession()
    session.startTransaction()

    try {
      const {
        company_id,
        worker_data,
      }: { company_id: string; worker_data: IWorkers } = req.body

      // const { email, phone_number, company_id, bank_account, cpf_or_cnpj } =
      //   req.body

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
  async update(req: Request, res: Response) {}
  async delete(req: Request, res: Response) {}
}

export default new WorkersController()
