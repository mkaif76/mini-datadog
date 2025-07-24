// packages/worker/src/index.ts

import * as dotenv from 'dotenv';
dotenv.config();

import amqp from 'amqplib';
import { Client } from '@elastic/elasticsearch';
import { setupILMPolicy } from './setupILMPolicy'; // Assuming you have a separate file for ILM setup

// --- Configuration ---
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME || 'log_queue';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;

// --- Elasticsearch Client Setup ---
let esClient: Client;
if (ELASTICSEARCH_URL) {
  esClient = new Client({
      node: ELASTICSEARCH_URL,
      tls: {
      rejectUnauthorized: false,
      },
    });
} else {
  console.error("Elasticsearch URL is not defined. Please check your .env file.");
  process.exit(1);
}

/**
 * The main function that starts the worker.
 */
async function startWorker() {
  console.log('Worker starting...');

  if (!RABBITMQ_URL) {
    console.error('RabbitMQ URL is not defined. Please check your .env file.');
    return;
  }

  // --- Function to set up ILM Policy and Index Template ---
  try {
    await setupILMPolicy(esClient);
  } catch (error) {
    console.error('Failed to set up ILM policy:', error);
    return;
  }

  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);
    console.log(`[*] Waiting for logs in queue: ${QUEUE_NAME}. To exit press CTRL+C`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const logDataString = msg.content.toString();
          const logData = JSON.parse(logDataString);
          console.log(`[x] Received log: ${logData.message}`);

          const processedLog = {
            ...logData,
            '@timestamp': new Date().toISOString(),
          };

          const indexName = `logs-${new Date().toISOString().slice(0, 10)}`;

          await esClient.index({
            index: indexName,
            body: processedLog,
          });

          console.log(`[+] Log indexed into Elasticsearch index: ${indexName}`);
          channel.ack(msg);

        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, true);
        }
      }
    }, {
      noAck: false
    });

  } catch (error) {
    console.error('Failed to start worker:', error);
    setTimeout(startWorker, 5000);
  }
}

// Start the application
startWorker();