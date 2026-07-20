import { Router } from 'express';
import { codingController } from '../controllers/coding.controller';

const router = Router();
router.get('/problems',           codingController.listProblems);
router.get('/problems/:id',       codingController.getProblem);
router.post('/submit',            codingController.submit);
router.get('/submissions',        codingController.listSubmissions);
router.get('/submissions/:id',    codingController.getSubmission);

export default router;
