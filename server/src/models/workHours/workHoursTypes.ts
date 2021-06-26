import { Document, Model } from "mongoose";

export type IWorkHours = {
  company_id: string;
  services: string[];
  workers: string[];
  days: Number[];
  start_time: Date;
  end_time: Date;
  created_at?: Date;
  updated_at?: Date;
};

export type IWorkHoursBody = {
  services: string[];
  workers: string[];
  days: Number[];
  start_time: Date;
  end_time: Date;
  created_at?: Date;
  updated_at?: Date;
};

export interface IWorkHoursDocument extends IWorkHours, Document {}

export interface IWorkHoursModel extends Model<IWorkHoursDocument> {}
