// packages/worker/src/index.ts

// --- 1. Load Environment Variables ---
import * as dotenv from 'dotenv';
dotenv.config();

// --- 2. Import Libraries ---
import amqp from 'amqplib';
import { Client } from '@elastic/elasticsearch';

// --- 3. Configuration from .env file ---
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME || 'log_queue';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;

// --- 4. Elasticsearch Client Setup ---
// We create a new client instance to connect to our Elasticsearch container.
let esClient: Client;
if (ELASTICSEARCH_URL) {
  esClient = new Client({ node: ELASTICSEARCH_URL });
} else {
  console.error("Elasticsearch URL is not defined. Please check your .env file.");
  process.exit(1); // Exit the process if the URL isn't found.
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

  try {
    // --- 5. Connect to RabbitMQ ---
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // This tells RabbitMQ to only give us one message at a time.
    // This way, if our worker crashes while processing a message, it won't lose other messages.
    channel.prefetch(1);

    console.log(`[*] Waiting for logs in queue: ${QUEUE_NAME}. To exit press CTRL+C`);

    // --- 6. Start Consuming Messages ---
    // This starts the listener. The callback function will be executed for each message.
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          // --- 7. Process the Message ---
          const logDataString = msg.content.toString();
          const logData = JSON.parse(logDataString);
          
          console.log(`[x] Received log: ${logData.message}`);

          // Add a timestamp to the log data. This is a crucial piece of information.
          const processedLog = {
            ...logData,
            '@timestamp': new Date().toISOString(),
          };

          // --- 8. Save to Elasticsearch ---
          // We create a dynamic index name based on the current date, e.g., "logs-2025-07-21"
          // This is a common pattern to keep indices small and manageable.
          const indexName = `logs-${new Date().toISOString().slice(0, 10)}`;

          await esClient.index({
            index: indexName,
            body: processedLog,
          });

          console.log(`[+] Log indexed into Elasticsearch index: ${indexName}`);

          // --- 9. Acknowledge the message ---
          // This tells RabbitMQ that we have successfully processed the message and it can be safely deleted from the queue.
          channel.ack(msg);

        } catch (error) {
          console.error('Error processing message:', error);
          // In case of an error, we do not acknowledge the message.
          // RabbitMQ will requeue it to be processed again later.
          // Note: In a real production system, you might want a more sophisticated error handling strategy.
          channel.nack(msg, false, true);
        }
      }
    }, {
      // 'noAck: false' is very important. It means we will manually acknowledge messages.
      noAck: false
    });

  } catch (error) {
    console.error('Failed to start worker:', error);
    // If we can't connect, we'll exit and let a process manager restart us.
    setTimeout(startWorker, 5000);
  }
}

// --- 10. Start the application ---
startWorker();
