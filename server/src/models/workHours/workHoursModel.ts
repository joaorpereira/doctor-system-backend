import { model } from 'mongoose'
import WorkHoursSchema from '../../database/workHourSchema'
import { IWorkHoursDocument } from './workHoursTypes'

export const WorkHoursModel = model<IWorkHoursDocument>('WorkHours', WorkHoursSchema)
