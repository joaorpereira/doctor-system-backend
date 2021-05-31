import { model } from 'mongoose'
import WorkersSchema from '../../database/workerSchema'
import { IWorkersDocument } from './workersTypes'

export const WorkersModel = model<IWorkersDocument>('Workers', WorkersSchema)
