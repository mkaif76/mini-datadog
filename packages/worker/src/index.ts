// packages/worker/src/index.ts

import * as dotenv from 'dotenv';
dotenv.config();

import amqp from 'amqplib';
import { Client } from '@elastic/elasticsearch';

// --- Configuration ---
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME || 'log_queue';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;

// --- Elasticsearch Client Setup ---
let esClient: Client;
if (ELASTICSEARCH_URL) {
  esClient = new Client({ node: ELASTICSEARCH_URL });
} else {
  console.error("Elasticsearch URL is not defined. Please check your .env file.");
  process.exit(1);
}

// --- Function to set up ILM Policy and Index Template ---
async function setupILMPolicy() {
  const policyName = 'logs_deletion_policy';
  const templateName = 'logs_template';

  try {
    console.log('[ILM] Checking for existing ILM policy...');
    // 1. Create the Index Lifecycle Management (ILM) Policy
    await esClient.ilm.putLifecycle({
      name: policyName,
      body: {
        policy: {
          phases: {
            hot: {
              min_age: '0ms',
              actions: {
                set_priority: {
                  priority: 100,
                }
              },
            },
            delete: {
              min_age: '30d', // Wait 30 days from index creation
              actions: {
                delete: {}, // Then, perform the delete action
              },
            },
          },
        },
      },
    });
    console.log(`[ILM] Policy '${policyName}' created or updated successfully.`);

    // 2. Create an Index Template
    await esClient.indices.putTemplate({
      name: templateName,
      body: {
        index_patterns: ['logs-*'],
        settings: {
          'index.lifecycle.name': policyName,
        },
      },
    });
    console.log(`[ILM] Index template '${templateName}' created or updated successfully.`);

  } catch (error) {
    console.error('[ILM] Error setting up ILM policy and template:', error);
  }
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

  await setupILMPolicy();

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