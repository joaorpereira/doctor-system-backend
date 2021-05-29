import { model } from 'mongoose'
import ServicesSchema from '../../database/serviceSchema'
import { IServicesDocument } from './servicesTypes'

export const ServicesModel = model<IServicesDocument>('Services', ServicesSchema)
