// packages/api/src/index.ts

// --- 1. Imports ---
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import amqp from 'amqplib';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

// Import our new router and controller initializers
import logRoutes from './routes/logRoutes';
import { initializeIngestDependencies } from './controllers/ingestController';
import { initializeSearchDependencies } from './controllers/searchController';
import { initializeMetricsDependencies } from './controllers/metricsController';

// --- 2. Configuration ---
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;

// --- 3. Main Application Setup ---
async function startServer() {
  if (!RABBITMQ_URL || !ELASTICSEARCH_URL) {
    console.error("Missing required environment variables for RabbitMQ or Elasticsearch.");
    process.exit(1);
  }

  // --- 4. Initialize Express App ---
  const app = express();
  app.use(cors());
  app.use(express.json());

  try {
    // --- 5. Establish External Connections ---
    // Connect to RabbitMQ
    console.log('Connecting to RabbitMQ...');
    const rabbitMQConnection = await amqp.connect(RABBITMQ_URL);
    const rabbitMQChannel = await rabbitMQConnection.createChannel();
    console.log('Successfully connected to RabbitMQ.');

    // Connect to Elasticsearch
    console.log('Connecting to Elasticsearch...');
    const esClient = new ElasticsearchClient({ node: ELASTICSEARCH_URL });
    await esClient.ping(); // Verify connection
    console.log('Successfully connected to Elasticsearch.');

    // --- 6. Dependency Injection ---
    // Pass the established connections to our controllers
    initializeIngestDependencies(rabbitMQChannel);
    initializeSearchDependencies(esClient);
    initializeMetricsDependencies(esClient);

    // --- 7. Mount Routes ---
    // Tell our Express app to use the logRoutes for any path that starts with '/'.
    app.use('/', logRoutes);

    // --- 8. Start Server ---
    app.listen(PORT, () => {
      console.log(`API server started and listening on http://localhost:${PORT}`);
    });

  } catch (error) {
    const err = error as Error;
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();