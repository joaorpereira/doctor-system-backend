import { model } from 'mongoose'
import WorkersSchema from '../../database/workers/workers-schema'
import { IWorkersDocument } from './workers-types'

export const CompanyModel = model<IWorkersDocument>('Workers', WorkersSchema)
