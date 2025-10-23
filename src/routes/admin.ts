import { Router } from "express";
import * as ctrl from "../controllers/adminController.js";

const router = Router();

router.get("/", ctrl.dashboard);
router.get("/mahasiswa", ctrl.mahasiswaIndex);
router.get("/mahasiswa/create", ctrl.mahasiswaCreate);
router.post("/mahasiswa", ctrl.mahasiswaStore);
router.get("/mahasiswa/:id/edit", ctrl.mahasiswaEdit);
router.post("/mahasiswa/:id", ctrl.mahasiswaUpdate);
router.post("/mahasiswa/:id/delete", ctrl.mahasiswaDelete);

export default router;
