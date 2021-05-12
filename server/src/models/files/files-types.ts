import { Document, Model  } from 'mongoose'

export interface IFiles {
  folder: string
  reference_id: string
  created_at: Date
  updated_at: Date
}

export interface IFilesDocument extends IFiles, Document {}

export interface IFilesModel extends Model<IFilesDocument> {}
