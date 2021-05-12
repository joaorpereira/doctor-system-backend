import { model } from 'mongoose'
import ServicesSchema from '../../database/services-schema'
import { IServicesDocument } from './services-types'

export const ServicesModel = model<IServicesDocument>('Services', ServicesSchema)
