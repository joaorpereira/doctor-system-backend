import { Response, Request } from 'express'
import { WorkHoursModel } from '../models/workHours/workHours-model'
import { IWorkHoursBody } from '../models/workHours/workHours-types'

class WorkHoursController {
  async getWorkHoursByCompany(req: Request, res: Response) {
    try {
      const { id } = req.params
      const company_work_hours = await WorkHoursModel.find({ company_id: id })
      res.status(201).send({ company_work_hours })
    } catch (error) {
      res
        .status(404)
        .send({ message: 'Erro ao buscar os horários do salão', error })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const work_hours = await new WorkHoursModel(data).save()
      res.status(201).send({ work_hours })
    } catch (error) {
      res.status(404).send({ message: 'Erro ao criar novo horário', error })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data: IWorkHoursBody = req.body

      const update = {
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
      res
        .status(404)
        .send({ message: 'Não foi possível alterar o horário', error })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      await WorkHoursModel.deleteOne({ _id: id })
      res.status(200).send({ message: 'Horário removido com sucesso' })
    } catch (error) {
      res.status(404).send({ message: 'Erro ao remover Horário', error })
    }
  }
}

export default new WorkHoursController()
