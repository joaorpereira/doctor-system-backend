import { Document, Model } from "mongoose";

export interface IFilesDocument extends Document {}

export interface IFilesModel extends Model<IFilesDocument> {}
