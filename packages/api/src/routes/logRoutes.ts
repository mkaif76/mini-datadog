import {Router} from 'express';
import { ingestLog } from '../controllers/ingestController';
import { searchLogs } from '../controllers/searchController';
import { getMetrics } from '../controllers/metricsController';

const router = Router();

// Define the /ingest endpoint for log ingestion
router.post('/ingest', ingestLog);
// Define the /search endpoint for searching logs
router.get('/search', searchLogs);
// Define the /metrics endpoint for fetching metrics
router.get('/metrics', getMetrics);

export default router;
