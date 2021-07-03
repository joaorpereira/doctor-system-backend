import { model } from "mongoose";
import workerService from "../../../database/relations/workerServiceSchema";
import { IWorkerServiceDocument } from "./workerServiceTypes";

export const WorkerServiceModel = model<IWorkerServiceDocument>(
  "WorkerService",
  workerService
);
