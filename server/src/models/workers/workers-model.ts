import { model } from 'mongoose'
import WorkersSchema from '../../database/workers-schema'
import { IWorkersDocument } from './workers-types'

export const WorkersModel = model<IWorkersDocument>('Workers', WorkersSchema)
