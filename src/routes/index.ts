import express from "express";
import CompaniesController from "../controllers/CompaniesController";
import FilesController from "../controllers/FilesController";
import WorkHoursController from "../controllers/WorkHoursController";
import ServicesController from "../controllers/ServicesController";
import WorkersController from "../controllers/WorkersController";
import ClientsControllers from "../controllers/ClientsControllers";
import ScheduleController from "../controllers/ScheduleController";

const router = express.Router();

// === company ===
router.post("/company/login", CompaniesController.login);
router.post("/company", CompaniesController.create);
router.get("/company", CompaniesController.getCompanyList);
router.get("/company/filter", CompaniesController.getFilteredCompanyList);
router.get("/company/:id/:lat/:lon", CompaniesController.getCompany);
router.put("/company/:id", CompaniesController.update);
router.delete("/company/:id", CompaniesController.delete);

// === service ===
router.post("/service", ServicesController.create);
router.get("/service/:id", ServicesController.getServicesList);
router.get("/service/filter/:id", ServicesController.getFilteredServicesList);
router.put("/service/:id", ServicesController.update);
router.delete("/service/:id/:status", ServicesController.removeInactiveService);

// === files ===
router.post("/file", FilesController.delete);

// === worker ===
router.post("/worker/login", WorkersController.login);
router.post("/worker", WorkersController.create);
router.get("/worker", WorkersController.getAllWorkers);
router.get("/worker/info/:id", WorkersController.getWorker);
router.get("/worker/:company_id", WorkersController.listWorkersByCompany);
router.put("/worker/:id", WorkersController.update);
router.delete("/worker/:id", WorkersController.delete);

// === workHours ===
router.get("/work-hours", WorkHoursController.getAll);
router.post("/work-hours", WorkHoursController.create);
router.post("/work-hours/service", WorkHoursController.getWorkerHoursByService);
router.get("/work-hours/:id", WorkHoursController.getWorkHoursByCompany);
router.put("/work-hours/:id", WorkHoursController.update);
router.delete("/work-hours/:id", WorkHoursController.delete);

// === client ===
router.post("/client/login", ClientsControllers.login);
router.post("/client", ClientsControllers.create);
router.post("/client/filter", ClientsControllers.filteredClientList);
router.get("/client", ClientsControllers.getAllClients);
router.get("/client/:id", ClientsControllers.getClient);
router.put("/client/:id", ClientsControllers.update);
router.delete("/client/:id", ClientsControllers.delete);

// === schedule ===
router.post("/schedule", ScheduleController.create);
router.post("/schedule/filter", ScheduleController.filterScheduleList);
router.post(
  "/schedule/disponibility",
  ScheduleController.getScheduleDisponibility
);

export default router;
