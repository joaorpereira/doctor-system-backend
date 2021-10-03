import { Request, Response } from "express";
import Busboy from "busboy";
import { FilesModel } from "../models/files/filesModel";
import { deleteFileS3, uploadToS3 } from "../services/aws";

type ErrorProps = {
  message?: string;
  statusCode?: number;
};

interface IBusboyRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: any;
}

type IErrorAWS = {
  error: string;
};

class FilesController {
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.body;

      await deleteFileS3(id);

      await FilesModel.findOneAndDelete({
        folder: id,
      });

      res.status(200).send({ message: "Arquivo removido com sucesso" });
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res
        .status(404)
        .send({ message: "Erro ao remover arquivo", error: newError });
    }
  }

  async upload(req: Request, res: Response) {
    const { data } = req.body;
    const documentFile = (req as IBusboyRequest).files;

    const jsonService = JSON.parse(data);

    const busboy = new Busboy({ headers: req.headers });
    const errors: IErrorAWS[] = [];
    let file = "";

    try {
      if (!jsonService || !jsonService.id || !jsonService.role) {
        throw new Error(
          "Dados do enviados de forma incorreta. ID, Role e File são campos obrigatórios"
        );
      }

      // eslint-disable-next-line consistent-return
      busboy.on("finish", async () => {
        const objectKeysLength = Object.keys(documentFile).length as number;

        if (documentFile && objectKeysLength > 0) {
          const prefix = Math.floor(Math.random() * 65536);
          const currentTime = new Date().getTime();

          const documentFileKey = Object.keys(documentFile)[0];
          const newFile = documentFile[documentFileKey];

          const nameParts: string[] = newFile.name.split(".");

          const fileName = `${prefix}${currentTime}.${
            nameParts[nameParts.length - 1]
          }`;

          const path = `${jsonService.role.toLowerCase()}/${
            jsonService.id
          }/${fileName}`;

          const response = (await uploadToS3({
            file: newFile,
            path,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })) as any;

          if (response.error) {
            errors.push({ error: response.error });
          } else {
            file = path;
          }
        }

        if (errors.length > 0) {
          return res.status(404).send(errors[0]);
        }

        const newFile = {
          reference_id: jsonService.id as string,
          model: jsonService.role as string,
          folder: file,
          created_at: new Date(),
        };

        if (newFile) {
          await new FilesModel(newFile).save();
        }

        res.status(201).send({
          data: newFile,
          message: "Upload do arquivo realizado com sucesso",
        });
      });
      req.pipe(busboy);
    } catch (error) {
      const newError = error as unknown as ErrorProps;
      res.status(404).send({
        message: newError.message || "Erro ao realizar upload do arquivo",
        error,
      });
    }
  }
}

export default new FilesController();
