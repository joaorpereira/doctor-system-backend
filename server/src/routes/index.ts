import express from 'express'
import CompaniesController from '../controllers/CompaniesController'
import FilesController from '../controllers/FilesController'
import WorkHoursController from '../controllers/WorkHoursController'
import ServicesController from '../controllers/ServicesController'
import WorkersController from '../controllers/WorkersController'

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

// === files ===
router.post('/file', FilesController.delete)

// === worker ===
router.get('/worker', WorkersController.getAllWorkers)
router.post('/worker', WorkersController.create)
router.get('/worker/info/:id', WorkersController.getWorker)
router.get('/worker/:company_id', WorkersController.listWorkersByCompany)
router.put('/worker/:id', ServicesController.update)
router.delete('/worker/:id', WorkersController.delete)

// === workHours ===
router.post('/work-hours', WorkHoursController.create)
router.get('/work-hours/:id', WorkHoursController.getWorkHoursByCompany)
router.put('/work-hours/:id', WorkHoursController.update)
router.delete('/work-hours/:id', WorkHoursController.delete)

export default router
