import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.post('/',           uploadMiddleware.single('resume'), resumeController.upload);
router.get('/',            resumeController.list);
router.get('/:id',         resumeController.getOne);
router.delete('/:id',      resumeController.deleteOne);
router.post('/:id/analyze', resumeController.reanalyze);

export default router;
