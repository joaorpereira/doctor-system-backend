import { model } from 'mongoose'
import schedule from '../../database/schedule-schema'
import { IScheduleDocument } from './schedule-types'

export const ScheduleModel = model<IScheduleDocument>(
  'Schedule',
  schedule
)
