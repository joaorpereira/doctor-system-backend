import express from 'express'
import CompaniesController from '../controllers/CompaniesController'
import ServicesController from '../controllers/ServicesController'

const router = express.Router()

// === company ===
router.post('/company', CompaniesController.create)
router.get('/company', CompaniesController.getCompanyList)
router.get('/company/:id', CompaniesController.getCompany)
router.put('/company/:id', CompaniesController.update)
router.delete('/company/:id', CompaniesController.delete)

// === service ===
router.post('/service', ServicesController.uploadAWS)
router.get('/service/:id', ServicesController.getServicesList)

export default router
