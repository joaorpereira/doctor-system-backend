import { model } from 'mongoose'
import workerService from './workerService-schema'
import { IWorkerServiceDocument } from './workerService-types'

export const WorkerServiceModel = model<IWorkerServiceDocument>(
  'WorkerService',
  workerService
)
