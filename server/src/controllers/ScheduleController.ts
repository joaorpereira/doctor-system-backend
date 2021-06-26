/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import mongoose, { ObjectId } from "mongoose";
import dotenv from "dotenv";
import { Request, Response } from "express";

import { getDay, add, format, startOfDay, endOfDay, subHours } from "date-fns";
import * as _ from "lodash";

import { pagarmeService } from "../services/pargar-me";
import { ClientsModel } from "../models/clients/clientsModel";
import { ServicesModel } from "../models/services/servicesModel";
import { CompaniesModel } from "../models/companies/companiesModel";
import { WorkersModel } from "../models/workers/workersModel";
import { ScheduleModel } from "../models/schedule/scheduleModel";
import { WorkHoursModel } from "../models/workHours/workHoursModel";
import {
  convertHourToMinutes,
  timeConvert,
  getIntervalByMinutes,
  DURATION_TIME,
  splitByValue,
} from "../utils/formatDate";

dotenv.config();

type CreateParams = {
  company_id: string;
  worker_id: string;
  client_id: string;
  service_id: string;
  schedule_date: Date;
};

type IFilter = {
  range: {
    start: Date;
    end: Date;
  };
  company_id: string;
};

type ISlot = {
  days: number[];
  services: string[];
};

class ScheduleController {
  async getScheduleDisponibility(req: Request, res: Response) {
    try {
      const { company_id, service_id, date } = req.body;

      const service = await ServicesModel.findById(service_id).select(
        "service_duration"
      );

      const workHours = await WorkHoursModel.find({ company_id });

      let workers = [];

      // service duration
      let serviceMinutes = 0;
      if (service) {
        const day = new Date(service.service_duration);
        serviceMinutes = convertHourToMinutes(day);
      }

      // service slots
      const slots = serviceMinutes / DURATION_TIME;
      const servicesSlots = [];

      for (let i = 0; i < slots; i++) {
        const num = serviceMinutes + DURATION_TIME * i;
        const newTime = timeConvert(num);
        servicesSlots.push(newTime);
      }

      // searching next days with available schedule disponibility
      const schedule = [];
      let lastDay = new Date(date);

      for (let i = 0; i <= 365 && schedule.length < 7; i++) {
        // eslint-disable-next-line no-loop-func
        const validSlots = workHours.filter(({ days, services }: ISlot) => {
          // verifying week day is available
          const day = getDay(lastDay);
          const availableDay = days.includes(day);

          // verifying specialties is available in that day
          const availableService = services.includes(service_id);

          return availableDay && availableService;
        });

        /*
          verifying workers disponibility and 
          their respectives workHours availability
          [
            {
              "2021-05-06": {
                "worker_name": [
                  "worker_hour"
                ]
              }
            }
          ]
        */

        if (validSlots.length > 0) {
          let workerDisponibilityByDay: any = {};
          for (const slot of validSlots) {
            for (const workerId of slot.workers) {
              const interval = getIntervalByMinutes(
                slot.start_time,
                slot.end_time
              );

              workerDisponibilityByDay[workerId] = interval.map(
                (intervalDate) => format(intervalDate, "HH:mm")
              );
            }
          }

          // verifying workers disponibility by day
          for (const workerId of Object.keys(workerDisponibilityByDay)) {
            const start = subHours(startOfDay(lastDay), 3);
            const end = subHours(endOfDay(lastDay), 3);

            const unfilteredSchedule = await ScheduleModel.find({
              worker_id: workerId,
              schedule_date: {
                $gte: start,
                $lte: end,
              },
            })
              .select("schedule_date service_id -_id")
              .populate("service_id", "service_duration");

            // recover scheduled time
            const busySchedule = unfilteredSchedule
              .map((schedule) => {
                const duration: any = schedule.service_id as ObjectId;
                const totalMinutes = convertHourToMinutes(
                  duration.service_duration
                );
                const scheduleDate = schedule.schedule_date;
                const interval = getIntervalByMinutes(
                  scheduleDate,
                  scheduleDate,
                  totalMinutes
                ).map((item) => format(add(item, { hours: 3 }), "HH:mm"));
                return interval;
              })
              .flat();

            // removing occupied slots
            let disponibleHours = splitByValue(
              workerDisponibilityByDay[workerId].map((dayOff: string) =>
                busySchedule.includes(dayOff) ? "-" : dayOff
              ),
              "-"
            ).filter((space: []) => space.length > 0);

            // verifying if there is free slots for a new service
            disponibleHours = disponibleHours.filter(
              (hour: []) => hour.length >= slots
            );

            // verifying if there is free slots for a the duration of a new service
            disponibleHours = disponibleHours
              .map((slot: []) =>
                slot.filter(
                  (hour: string, index: number) =>
                    slot.length - index >= slots && hour
                )
              )
              .flat();

            // remove worker without disponible workHour

            if (disponibleHours.length === 0) {
              workerDisponibilityByDay = _.omit(
                workerDisponibilityByDay,
                workerId
              );
            } else {
              workerDisponibilityByDay[workerId] = disponibleHours;
            }
          }

          // checking if there is work available that day

          const totalWorkers = Object.keys(workerDisponibilityByDay).length;

          if (totalWorkers > 0) {
            /* 
              remove one day because the condition just starts at 
              second loop the value os lastDay, already increase to the day 
              ahead because that it's needed remove one hour of lastDay
            */
            workers.push(Object.keys(workerDisponibilityByDay));
            schedule.push({
              [format(lastDay, "yyyy-MM-dd")]: workerDisponibilityByDay,
            });
          }
        }

        lastDay = add(lastDay, { days: 1 });
      }

      // workers unique list
      workers = workers.flat();
      workers = _.uniq(workers);

      // recovering worker info
      const workerList = await WorkersModel.find({
        _id: { $in: workers },
      }).select("name picture");

      res.status(200).send({ workerList, schedule });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao criar horário", error: error.message });
    }
  }

  async filterScheduleList(req: Request, res: Response) {
    try {
      const { range, company_id }: IFilter = req.body;

      const schedules = await ScheduleModel.find({
        company_id,
        schedule_date: {
          $gte: range?.start,
          $lte: range?.end,
        },
      }).populate([
        { path: "service_id", select: "title service_duration" },
        { path: "worker_id", select: "name" },
        { path: "client_id", select: "name" },
      ]);
      res.status(200).send({ schedules });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao filtrar horário", error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();

    try {
      const {
        company_id,
        worker_id,
        client_id,
        service_id,
        schedule_date,
      }: CreateParams = req.body;

      const client = await ClientsModel.findById(client_id).select(
        "name email address customer_id document phone_number"
      );

      const worker = await WorkersModel.findById(worker_id).select(
        "recipient_id"
      );

      const company = await CompaniesModel.findById(company_id).select(
        "recipient_id"
      );

      const service = await ServicesModel.findById(service_id).select(
        "price title"
      );

      const finalPrice = Number(service?.price) * 100;

      const workerPrice = finalPrice * 0.65;
      const companyPrice = finalPrice * 0.25;
      const appPrice = finalPrice * 0.1;

      const zipCode =
        client && (client.address.cep.split("-").join("") as string);

      const data = {
        amount: finalPrice,

        card_number: "4111111111111111",
        card_cvv: "123",
        card_expiration_date: "0922",
        card_holder_name: "Morpheus Fishburne",

        customer: {
          external_id: client?.customer_id,
          name: client?.name,
          email: client?.email,
          country: "br",
          type: client?.document.type === "cpf" ? "individual" : "corporation",
          documents: [
            {
              type: client?.document.type,
              number: String(client?.document.number),
            },
          ],
          phone_numbers: [client?.phone_number],
        },

        billing: {
          name: client?.name,
          address: {
            country: "br",
            state: client?.address.state,
            city: client?.address.city,
            street: client?.address.street,
            street_number: client?.address.number,
            zipcode: zipCode,
          },
        },
        items: [
          {
            id: service_id,
            title: service?.title,
            unit_price: finalPrice,
            quantity: 1,
            tangible: false,
          },
        ],
        split_rules: [
          {
            recipient_id: company?.recipient_id,
            amount: companyPrice,
          },
          {
            recipient_id: worker?.recipient_id,
            amount: workerPrice,
          },
          {
            recipient_id: "re_ckp9zscoq04a40h9t73nhserw",
            amount: appPrice,
          },
        ],
      };

      const createPayment: any = await pagarmeService({
        endpoint: "/transactions",
        data,
      });

      if (createPayment.message) {
        // eslint-disable-next-line no-throw-literal
        throw createPayment as string;
      }

      const schedule = await new ScheduleModel({
        company_id,
        client_id,
        worker_id,
        service_id,
        schedule_date,
        price: finalPrice,
        transaction_id: createPayment?.data?.id as string,
      }).save({
        session,
      });

      await session.commitTransaction();
      session.endSession();

      res.status(201).send({ schedule, message: "Horário criado com sucesso" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res
        .status(404)
        .send({ message: "Erro ao criar horário", error: error.message });
    }
  }
}

export default new ScheduleController();
