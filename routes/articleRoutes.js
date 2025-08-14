// backend/routes/articleRoutes.js
import { Router } from 'express';
import { getArticles } from '../controllers/articleController.js';
const router = Router();

router.get('/', getArticles);

export default router;
