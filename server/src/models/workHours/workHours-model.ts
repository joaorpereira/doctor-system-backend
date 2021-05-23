import { model } from 'mongoose'
import WorkHoursSchema from '../../database/workHours-schema'
import { IWorkHoursDocument } from './workHours-types'

export const WorkHoursModel = model<IWorkHoursDocument>('WorkHours', WorkHoursSchema)
