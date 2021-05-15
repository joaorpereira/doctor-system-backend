import express from 'express'
import CompaniesController from '../controllers/CompaniesController'
import FilesController from '../controllers/FilesController'
import ServicesController from '../controllers/ServicesController'

const router = express.Router()

// === company ===
router.post('/company', CompaniesController.create)
router.get('/company', CompaniesController.getCompanyList)
router.get('/company/:id/:lat/:lon', CompaniesController.getCompany)
router.put('/company/:id', CompaniesController.update)
router.delete('/company/:id', CompaniesController.delete)

// === service ===
router.post('/service', ServicesController.uploadAWS)
router.get('/service/:id', ServicesController.getServicesList)
router.get('/service/filter/:id', ServicesController.getFilteredServicesList)
router.put('/service/:id', ServicesController.update)
router.delete('/service/:id/:status', ServicesController.removeInactiveService)

// === file ===
router.post('/file', FilesController.delete)

export default router
