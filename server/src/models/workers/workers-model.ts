import { model } from 'mongoose'
import WorkersSchema from '../../database/workers-schema'
import { IWorkersDocument } from './workers-types'

export const CompanyModel = model<IWorkersDocument>('Workers', WorkersSchema)
