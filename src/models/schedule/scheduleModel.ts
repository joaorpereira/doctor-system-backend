import { model } from "mongoose";
import schedule from "../../database/scheduleSchema";
import { IScheduleDocument } from "./scheduleTypes";

export const ScheduleModel = model<IScheduleDocument>("Schedule", schedule);
