import express from 'express'
import CompaniesController from '../controllers/CompaniesController'

const router = express.Router()

router.post('/company', CompaniesController.create)
router.get('/company', CompaniesController.getCompanyList)
router.get('/company/:id', CompaniesController.getCompany)
router.put('/company/:id', CompaniesController.update)

export default router
