import { Request, Response } from 'express'
import { FilesModel } from '../models/files/filesModel'
import { deleteFileS3 } from '../services/aws'

class FilesController {
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.body

      await deleteFileS3(id)

      await FilesModel.findOneAndDelete({
        folder : id
      })

      res.status(200).send({message: 'Arquivo removido com sucesso'})
    } catch (error) {
      res.status(404).send({ message: 'Erro ao remover arquivo', error: error.message })
    }
  }
}

export default new FilesController()
