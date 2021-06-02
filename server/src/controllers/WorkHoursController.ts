import { Response, Request } from 'express'
import { WorkerServiceModel } from '../models/relations/workerService/workerServiceModel'
import { Status } from '../models/relations/workerService/workerServiceTypes'
import { WorkHoursModel } from '../models/workHours/workHoursModel'
import { IWorkHoursBody } from '../models/workHours/workHoursTypes'
import * as _ from 'lodash'

type ListOfWorkers = {
  label: string
  value: string
}
class WorkHoursController {
  async getWorkHoursByCompany(req: Request, res: Response) {
    try {
      const { id } = req.params
      const company_work_hours = await WorkHoursModel.find({ company_id: id })
      res.status(201).send({ company_work_hours })
    } catch (error) {
      res.status(404).send({
        message: 'Erro ao buscar os horários do salão',
        error: error.message,
      })
    }
  }

  async getWorkerHoursByService(req: Request, res: Response) {
    try {
      const { services } = req.body

      const servicesByWorkers = await WorkerServiceModel.find({
        service_id: { $in: services },
        status: Status['ATIVO'],
      })
        .populate('worker_id', 'name')
        .select('worker_id -_id')

      const listOfWorkers: ListOfWorkers[] = _.unionBy(
        servicesByWorkers,
        (worker: any) => worker.worker_id._id.toString()
      ).map((worker: any) => ({
        label: worker.worker_id.name,
        value: worker.worker_id._id,
      }))

      res.status(200).send({ listOfWorkers })
    } catch (error) {
      res
        .status(404)
        .send({ message: 'Não foi efetuar a operação', error: error.message })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const work_hours = await new WorkHoursModel(data).save()
      res.status(201).send({ work_hours })
    } catch (error) {
      res
        .status(404)
        .send({ message: 'Erro ao criar novo horário', error: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data: IWorkHoursBody = req.body

      const update = {
        ...data,
        services: data.services,
        workers: data.workers,
        days: data.days,
        start_time: data.start_time,
        end_time: data.end_time,
      }

      const work_hours = await WorkHoursModel.findOneAndUpdate(
        { _id: id },
        update,
        {
          returnOriginal: false,
        }
      )

      res
        .status(200)
        .send({ work_hours, message: 'Horário alterado com sucesso' })
    } catch (error) {
      res.status(404).send({
        message: 'Não foi possível alterar o horário',
        error: error.message,
      })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      await WorkHoursModel.deleteOne({ _id: id })
      res.status(200).send({ message: 'Horário removido com sucesso' })
    } catch (error) {
      res
        .status(404)
        .send({ message: 'Erro ao remover horário', error: error.message })
    }
  }
}

export default new WorkHoursController()
