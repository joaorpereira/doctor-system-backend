import { model } from 'mongoose'
import WorkHoursSchema from './workHours-schema'
import { IWorkHoursDocument } from './workHours-types'

export const CompanyModel = model<IWorkHoursDocument>('WorkHours', WorkHoursSchema)
