import { Router } from 'express';
import * as ctrl from '../controllers/roleController.js';

const router = Router();
router.get('/', ctrl.list);
router.get('/create', ctrl.create);
router.post('/', ctrl.store);
router.get('/:id/edit', ctrl.edit);
router.post('/:id', ctrl.update);
router.post('/:id/delete', ctrl.destroy);
router.delete('/:id', ctrl.destroy);

export default router;
