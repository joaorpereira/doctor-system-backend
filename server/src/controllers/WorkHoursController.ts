import { Response, Request } from 'express'
import { WorkHoursModel } from '../models/workHours/workHours-model'

class WorkHoursController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body
      const work_hour = await new WorkHoursModel(data).save()
      res.status(201).send({ work_hour })
    } catch (error) {
      res.status(404).send({ message: error.message })
    }
  }
}

export default new WorkHoursController()
