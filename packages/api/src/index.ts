// packages/api/src/index.ts

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors'; // <-- FIX #2: Import cors
import amqp from 'amqplib';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

import logRoutes from './routes/logRoutes';
import { initializeIngestDependencies } from './controllers/ingestController';
import { initializeSearchDependencies } from './controllers/searchController';
import { initializeMetricsDependencies } from './controllers/metricsController';

const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;

// --- FIX #1: A robust function to connect to services with retries ---
const connectWithRetry = async (connectFn: () => Promise<any>, serviceName: string, maxRetries = 15, delay = 5000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log("Waiting for 5 seconds before attempting to connect...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log(`Attempting to connect to ${serviceName}... (Attempt ${i + 1}/${maxRetries})`);
      const connection = await connectFn();
      console.log(`Successfully connected to ${serviceName}.`);
      return connection; // Return the connection object on success
    } catch (error) {
      const err = error as Error;
      console.error(`Failed to connect to ${serviceName}. Retrying in ${delay / 1000}s...`);
      console.log(`Error details: ${err.message}`);
      if (i === maxRetries - 1) {
        throw new Error(`Could not connect to ${serviceName} after ${maxRetries} attempts.`);
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error(`Could not connect to ${serviceName}.`);
};


async function startServer() {
  if (!RABBITMQ_URL || !ELASTICSEARCH_URL) {
    console.error("Missing required environment variables for RabbitMQ or Elasticsearch.");
    process.exit(1);
  }
  
  try {
    // --- Establish Connections FIRST, before starting the server ---
    const rabbitMQConnection = await connectWithRetry(() => amqp.connect(RABBITMQ_URL), 'RabbitMQ');
    const rabbitMQChannel = await rabbitMQConnection.createChannel();

    const esClient = new ElasticsearchClient({
      node: ELASTICSEARCH_URL
    });
    await connectWithRetry(() => esClient.ping(), 'Elasticsearch');

    // --- If connections are successful, THEN start the Express app ---
    const app = express();
    app.use(cors()); // <-- FIX #2: Enable CORS for all requests
    app.use(express.json());

    // --- Dependency Injection ---
    initializeIngestDependencies(rabbitMQChannel);
    initializeSearchDependencies(esClient);
    initializeMetricsDependencies(esClient);

    // --- Mount Routes ---
    app.use('/', logRoutes);

    // --- Start Server ---
    app.listen(PORT, () => {
      console.log(`API server started and listening on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("FATAL: Could not connect to dependent services. Exiting.", error);
    process.exit(1);
  }
}

startServer();