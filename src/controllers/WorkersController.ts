import mongoose from "mongoose";
import { Request, Response } from "express";
import { WorkersModel } from "../models/workers/workersModel";
import { CompanyWorkerModel } from "../models/relations/companyWorker/companyWorkerModel";
import { WorkerServiceModel } from "../models/relations/workerService/workerServiceModel";
import { Status } from "../models/relations/companyWorker/companyWorkerTypes";
import { pagarmeService } from "../services/pargar-me";
import { IWorkers } from "../models/workers/workersTypes";
import {
  IWorkerData,
  ICompanyWorkers,
} from "../models/relations/workerService/workerServiceTypes";
import { hashPassword, comparePassword } from "../services/hashPassword";
import { generateToken } from "../services/generateToken";

class WorkersController {
  async login(req: Request, res: Response) {
    let statusCode = 404;
    let message = "Erro ao efetuar login";

    const { email, password } = req.body;

    try {
      if (!email || !password) {
        statusCode = 406;
        message = "Email e senha são campos obrigatórios";
        throw new Error(message);
      }
      const worker: any = await WorkersModel.findOne({
        email,
      }).select("name email _id picture role bank_account address");

      if (!worker) {
        statusCode = 404;
        message = "Colaborador não encontrado ou senha incorreta";
        throw new Error(message);
      }

      const comparedPassword = comparePassword(password, worker.password);

      if (!comparedPassword) {
        statusCode = 401;
        message = "Colaborador não encontrado ou senha incorreta";
        throw new Error(message);
      }

      const token: string = generateToken({
        id: worker.id,
        role: worker.role,
      });

      res.status(200).send({
        token,
        user: worker,
        message: "Colaborador logado com sucesso",
      });
    } catch (error) {
      res.status(statusCode).send({
        message,
        error: error.message,
      });
    }
  }

  async getAllWorkers(req: Request, res: Response) {
    try {
      const workers = await WorkersModel.find().select(" -updated_at -__v");
      res.status(200).send({ data: workers });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Lista de colaboradores não encontrada", error });
    }
  }

  async getWorker(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const worker = await WorkersModel.findById(id).select(
        " -updated_at -__v"
      );

      res.status(200).send({ data: worker });
    } catch (error) {
      res.status(404).send({ message: "Colaborador não encontrado", error });
    }
  }

  async create(req: Request, res: Response) {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();

    let message = "Erro ao criar colaborador";

    try {
      const {
        company_id,
        worker_data,
      }: { company_id: string; worker_data: IWorkers } = req.body;

      const worker = await WorkersModel.findOne({
        $or: [
          { email: worker_data.email },
          { phone_number: worker_data.phone_number },
        ],
      });

      let newWorker = null;

      if (!worker && worker_data) {
        const { bank_account } = worker_data;
        const { document } = worker_data;

        const bankAccounData = {
          agencia: bank_account.bank_agency,
          bank_code: bank_account.bank_code,
          conta: bank_account.acc_number,
          conta_dv: bank_account.verify_digit,
          document_number: document.number,
          legal_name: bank_account.acc_user_name,
          type: bank_account.acc_type,
        };

        const pagarMeBankAccount = await pagarmeService({
          endpoint: "bank_accounts",
          data: bankAccounData,
        });

        if (pagarMeBankAccount.message) {
          // eslint-disable-next-line no-throw-literal
          throw pagarMeBankAccount as string;
        }

        const recipientData = {
          transfer_interval: "daily",
          transfer_enabled: true,
          bank_account_id: pagarMeBankAccount?.data?.id,
        };

        const pagarMeRecipient = await pagarmeService({
          endpoint: "recipients",
          data: recipientData,
        });

        if (pagarMeRecipient.message) {
          // eslint-disable-next-line no-throw-literal
          throw pagarMeRecipient as string;
        }

        const hashedPassword = await hashPassword(worker_data.password);

        // create worker
        newWorker = await new WorkersModel({
          ...worker_data,
          password: hashedPassword,
          recipient_id: pagarMeRecipient?.data?.id as string,
        }).save({ session });
      }

      const worker_id: string = worker
        ? worker._id
        : (newWorker?._id as string);

      const newStatus: Status = (
        worker ? worker.status : newWorker?.status
      ) as Status;

      const verifyRelationship = await CompanyWorkerModel.findOne({
        company_id,
        worker_id,
        status: {
          $ne: Status[newStatus],
        },
      });

      if (!verifyRelationship) {
        await new CompanyWorkerModel({
          company_id,
          worker_id,
          status: newStatus,
        }).save({ session });
      }

      if (verifyRelationship) {
        await CompanyWorkerModel.findOneAndUpdate(
          {
            company_id,
            worker_id,
          },
          { status: newStatus },
          { session }
        );
      }

      await WorkerServiceModel.insertMany(
        worker_data?.services?.map((serviceId: string) => ({
          service_id: serviceId,
          worker_id,
        })) as []
      );

      await session.commitTransaction();
      session.endSession();

      if (worker && verifyRelationship) {
        message = "Colaborador já cadastrado";
        throw new Error(message);
      }

      res.status(201).send({
        data: worker ?? newWorker,
        message: "Colaborador criado com sucesso",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).send({ message, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const hashedPassword = await hashPassword(data.password);

    try {
      const update = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        picture: data.picture,
        services: data.services,
        phone_number: data.phone_number,
      };

      const worker = await WorkersModel.findOneAndUpdate({ _id: id }, update, {
        returnOriginal: false,
      }).select(" -updated_at -__v");

      res
        .status(200)
        .send({ data: worker, message: "Colaborador alterado com sucesso" });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao alterar colaborador", error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await WorkersModel.deleteOne({ _id: id });
      await CompanyWorkerModel.deleteOne({ worker_id: id });
      res.status(200).send({ message: "Colaborador removido com sucesso" });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao remover colaborador", error: error.message });
    }
  }

  async listWorkersByCompany(req: Request, res: Response) {
    try {
      const { company_id } = req.params;

      const listWorkersByCompany = await CompanyWorkerModel.find({
        company_id,
        status: { $ne: Status.REMOVIDO },
      })
        .populate({
          path: "worker_id",
          select: "-password -recipient_id -created_at",
        })
        .select("worker_id created_at status");

      const list = listWorkersByCompany.map((worker) => worker.worker_id);

      res.status(200).send({
        data: list,
      });
    } catch (error) {
      res.status(404).send({
        message: "Lista de colaboradores não encontrada",
        error: error.message,
      });
    }
  }
}

export default new WorkersController();
