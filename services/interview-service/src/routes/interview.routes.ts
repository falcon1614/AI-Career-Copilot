import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller';

const router = Router();

router.post('/',                       interviewController.createSession);
router.get('/',                        interviewController.listSessions);
router.get('/:id',                     interviewController.getSession);
router.post('/:id/answer',             interviewController.submitAnswer);
router.put('/:id/complete',            interviewController.completeSession);
router.delete('/:id',                  interviewController.deleteSession);

export default router;
