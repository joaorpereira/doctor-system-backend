/* eslint-disable no-await-in-loop */
import { Request, Response } from "express";
import Busboy from "busboy";
import { ServicesModel } from "../models/services/servicesModel";
import { Status } from "../models/services/servicesTypes";
import { FilesModel } from "../models/files/filesModel";
import { uploadToS3 } from "../services/aws";

interface IBusboyRequest extends Request {
  files: any;
}

interface IErrorAWS {
  error: string;
}
class ServicesController {
  async getServicesList(req: Request, res: Response) {
    try {
      const newServices = [];
      const { id } = req.params;

      const services = await ServicesModel.find({
        company_id: id,
        status: { $ne: Status.REMOVIDO },
      }).select(" -updated_at -__v");

      // eslint-disable-next-line no-restricted-syntax
      for (const service of services) {
        const files = await FilesModel.find({
          model: "Services",
          reference_id: service._id,
        });
        newServices.push({
          ...service._doc,
          files,
        });
      }

      res.status(200).send({
        services: newServices,
      });
    } catch (error) {
      res.status(404).send({
        message: "Lista de serviços não encontrada",
        error: error.message,
      });
    }
  }

  async getFilteredServicesList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const status: Status = Status.ATIVO;

      const services = await ServicesModel.find({
        company_id: id,
        status,
      }).select("_id title");

      const newServices = services.map((s) => ({
        label: s.title,
        value: s._id,
      }));

      res.status(200).send({
        services: newServices,
      });
    } catch (error) {
      res.status(404).send({
        message: "Erro ao filtrar lista de serviços",
        error: error.message,
      });
    }
  }

  async uploadAWS(req: Request, res: Response) {
    const { service } = req.body;

    const documentFile = (req as IBusboyRequest).files;
    const currentTime = new Date().getTime();

    const jsonService = JSON.parse(service);

    if (!jsonService) {
      throw new Error("Dados do serviço enviados de forma incorreta");
    }

    const errors: IErrorAWS[] = [];
    const files: string[] = [];
    const busboy = new Busboy({ headers: req.headers });

    try {
      // eslint-disable-next-line consistent-return
      busboy.on("finish", async () => {
        const objectKeysLength = Object.keys(documentFile).length as number;

        if (documentFile && objectKeysLength > 0) {
          // eslint-disable-next-line no-restricted-syntax
          for (const key of Object.keys(documentFile)) {
            const prefix = Math.floor(Math.random() * 65536);
            const file = documentFile[key];

            const nameParts: string[] = file.name.split(".");

            const fileName = `${prefix}${currentTime}.${
              nameParts[nameParts.length - 1]
            }`;

            const path = `services/${jsonService.company_id}/${fileName}`;

            const response = (await uploadToS3({
              file,
              path,
            })) as any;

            if (response.error) {
              errors.push({ error: response.error });
            } else files.push(path);
          }
        }

        if (errors.length > 0) {
          return res.status(404).send(errors[0]);
        }

        const newService = await new ServicesModel(jsonService).save();

        const newFiles = files.map((file) => ({
          reference_id: newService._id as string,
          model: "Services",
          folder: file,
          created_at: new Date(),
        }));

        if (newFiles.length > 0) {
          await FilesModel.insertMany(newFiles);
        }

        res.status(201).send({
          files: newFiles,
          service: newService,
          message: "Serviço criado com sucesso",
        });
      });
      req.pipe(busboy);
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao criar serviço", error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    const { service } = req.body;
    const { id } = req.params;

    const documentFile = (req as IBusboyRequest).files;
    const currentTime = new Date().getTime();

    const jsonService = JSON.parse(service);

    if (!jsonService) {
      throw new Error("Dados do serviço enviados de forma incorreta");
    }

    const errors: IErrorAWS[] = [];
    const files: string[] = [];
    const busboy = new Busboy({ headers: req.headers });

    try {
      // eslint-disable-next-line consistent-return
      busboy.on("finish", async () => {
        const objectKeysLength = Object.keys(documentFile).length as number;

        if (documentFile && objectKeysLength > 0) {
          // eslint-disable-next-line no-restricted-syntax
          for (const key of Object.keys(documentFile)) {
            const prefix = Math.floor(Math.random() * 65536);

            const file = documentFile[key];

            const nameParts: string[] = file.name.split(".");

            const fileName = `${prefix}${currentTime}.${
              nameParts[nameParts.length - 1]
            }`;

            const path = `services/${jsonService.company_id}/${fileName}`;

            const response = (await uploadToS3({ file, path })) as any;
            if (response.error) {
              errors.push({ error: response.error });
            } else files.push(path);
          }
        } else {
          // deletar tambem do bucket
          await FilesModel.deleteMany({
            reference_id: id,
          });
        }

        if (errors.length > 0) {
          return res.status(404).send(errors[0]);
        }

        const newService = await ServicesModel.findByIdAndUpdate(
          id,
          jsonService
        );

        if (!newService) {
          throw new Error("Serviço não encontrado");
        }

        const newFiles = files.map((file) => ({
          reference_id: id,
          model: "Services",
          folder: file,
          created_at: new Date(),
        }));

        if (newFiles.length > 0) {
          await FilesModel.insertMany(newFiles);
        }

        res.status(200).send({
          message: "Serviço atualizado com sucesso",
        });
      });

      req.pipe(busboy);
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao atualizar serviço", error: error.message });
    }
  }

  async removeInactiveService(req: Request, res: Response) {
    try {
      const { id, status } = req.params;

      const newStatus: Status = status as Status;

      const service = await ServicesModel.findByIdAndUpdate(id, {
        status: Status[newStatus],
      });

      if (!service) {
        throw new Error("Serviço não encontrado");
      }

      res.status(200).send({
        services: service,
        message: `Status do serviço atualizado com sucesso. Novo status: ${newStatus}`,
      });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Erro ao atualizar serviço", error: error.message });
    }
  }
}

export default new ServicesController();
