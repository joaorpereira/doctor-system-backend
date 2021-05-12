import { model } from 'mongoose'
import schedule from '../../database/schedule-schema'
import { IScheduleDocument } from './schedule-types'

export const RelationWorkerServiceModel = model<IScheduleDocument>(
  'Schedule',
  schedule
)
