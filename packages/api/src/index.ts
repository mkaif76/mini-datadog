import cors from 'cors'; // Import the CORS library to handle Cross-Origin Resource Sharing
// The 'dotenv' library loads variables from a .env file into process.env
import * as dotenv from 'dotenv';
dotenv.config(); // This should be one of the first things in your application

// --- 2. Import the tools we need ---
// 'express' is the library we use to create a web server.
import express, { Request, Response } from 'express';
// 'amqplib' is the library for connecting to RabbitMQ.
import amqp from 'amqplib';
// Import the Elasticsearch client
import { Client } from '@elastic/elasticsearch';

// --- 3. Set up our configuration from environment variables ---
// Read the port from the .env file, with a default of 3000 if it's not found.
const PORT = process.env.PORT || 3000;
// Read the RabbitMQ URL from the .env file.
const RABBITMQ_URL = process.env.RABBITMQ_URL;
// The name of the queue we will send messages to.
const QUEUE_NAME = process.env.QUEUE_NAME || 'log_queue';
// Read the Elasticsearch URL from the .env file.
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;

// --- 4. The Main Application ---
const app = express(); // Create an instance of an Express application
app.use(express.json()); // This is a "middleware". It automatically parses incoming JSON requests for us.

app.use(cors()); // Enable CORS so our API can be accessed from different origins (like a web app)
// ---: 5. Elasticsearch Client Setup ---
let esClient: Client;
if (ELASTICSEARCH_URL) {
  esClient = new Client({ node: ELASTICSEARCH_URL });
} else {
  console.error("Elasticsearch URL is not defined. Please check your .env file.");
  process.exit(1);
}

// This variable will hold our connection to RabbitMQ. We declare it here so it can be accessed by all parts of our app.
let channel: amqp.Channel | null = null;

/**
 * This function connects to RabbitMQ.
 * It's designed to be resilient and will keep trying to reconnect if it fails.
 * This is important because our API might start up before the RabbitMQ container is fully ready.
 */
async function connectToRabbitMQ() {
  // Check if the URL is defined. If not, we can't connect.
  if (!RABBITMQ_URL) {
    console.error('RabbitMQ URL is not defined. Please check your .env file.');
    return;
  }

  try {
    console.log('Attempting to connect to RabbitMQ...');
    // Try to establish a connection.
    const connection = await amqp.connect(RABBITMQ_URL);
    console.log('Successfully connected to RabbitMQ.');

    // Once connected, create a "channel". A channel is like a specific pathway for our messages.
    channel = await connection.createChannel();
    console.log('Channel created.');

    // "Assert" a queue. This command will create the queue if it doesn't exist, or do nothing if it does.
    // 'durable: true' means the queue will survive even if RabbitMQ restarts.
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`Queue '${QUEUE_NAME}' is ready.`);

    // Set up listeners for connection errors. If the connection drops, we'll try to reconnect.
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error', err);
      channel = null;
      setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
    });
    connection.on('close', () => {
      console.error('RabbitMQ connection closed. Reconnecting...');
      channel = null;
      setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
    });

  } catch (error) {
     const err = error as Error;
    console.error('Failed to connect to RabbitMQ:', err.message);
    // If we fail to connect, we log the error and try again after a delay.
    channel = null;
    console.error('Retrying connection to RabbitMQ in 5 seconds...');
    setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
  }
}

// --- 6. Define our API Endpoints (The "Addresses" of our server) ---

/**
 * A simple "health check" endpoint.
 * We can visit this address in a browser to see if our server is running.
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running!', rabbitMqConnected: !!channel });
});

/**
 * This is our main ingestion endpoint.
 * It listens for POST requests at the '/ingest' address.
 */
app.post('/ingest', async (req: Request, res: Response) => {
  // First, check if we are connected to RabbitMQ. If not, we can't accept the log.
  if (!channel) {
    return res.status(503).json({ error: 'Service unavailable: Message queue is not ready.' });
  }

  // 'req.body' contains the JSON data sent by the client application.
  const logData = req.body;

  // Perform a very basic check to make sure the data looks like a log.
  if (!logData || typeof logData.message !== 'string') {
    return res.status(400).json({ error: 'Invalid log data. A "message" field is required.' });
  }

  try {
    // Convert the JSON log data into a "Buffer". RabbitMQ works with buffers, which are just raw data.
    const logBuffer = Buffer.from(JSON.stringify(logData));
    
    // Send the message to our queue.
    // 'persistent: true' tells RabbitMQ to save the message to disk, so it won't be lost if RabbitMQ crashes.
    channel.sendToQueue(QUEUE_NAME, logBuffer, { persistent: true });

    // IMPORTANT: We don't wait for the message to be processed.
    // We immediately respond with "202 Accepted" to tell the client we've received their log and will process it.
    // This makes our API very fast.
    return res.status(202).json({ status: 'Log accepted.' });

  } catch (error) {
    console.error('Failed to send log to queue:', error);
    return res.status(500).json({ error: 'Internal server error while queueing log.' });
  }
});

// --- NEW: 7. The Search Endpoint ---
app.get('/search', async (req: Request, res: Response) => {
  try {
    // NEW: Get page and limit from query, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // Load 50 logs per page
    const from = (page - 1) * limit;

    const { q, service, level, requestId, startTime, endTime } = req.query;
    const mustClauses: any[] = [];

    // ... (all the if-clauses for filters remain the same)
    if (q && typeof q === 'string') { mustClauses.push({ match: { message: q } }); }
    if (service && typeof service === 'string') { mustClauses.push({ match: { service: service } }); }
    if (level && typeof level === 'string') { mustClauses.push({ match: { level: level } }); }
    if (requestId && typeof requestId === 'string') { mustClauses.push({ match: { 'metadata.requestId': requestId } }); }
    if (startTime || endTime) { mustClauses.push({ range: { '@timestamp': { gte: startTime, lte: endTime } } }); }

    const result = await esClient.search({
      index: 'logs-*',
      body: {
        // NEW: Add 'from' and 'size' for pagination
        from: from,
        size: limit,
        query: {
          bool: {
            must: mustClauses.length > 0 ? mustClauses : { match_all: {} },
          },
        },
        sort: [
          { '@timestamp': { order: 'desc' } }
        ],
      },
    });

    const logs = result.hits.hits.map(hit => hit._source);
    const totalLogs = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;
    
    // NEW: Return logs along with pagination metadata
    res.status(200).json({
      logs,
      total: totalLogs,
      page,
      limit,
      hasMore: from + logs.length < totalLogs,
    });

  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ error: 'Internal server error while searching logs.' });
  }
});

// Add this new endpoint to your packages/api/src/index.ts file

app.get('/metrics', async (req: Request, res: Response) => {
  try {
    // We can add a time filter later, e.g., ?range=24h
    const timeRange = (req.query.range as string) || '24h';

    const result = await esClient.search({
      index: 'logs-*',
      body: {
        size: 0, // We don't need the actual log documents, just the calculations.
        query: {
          range: {
            '@timestamp': {
              gte: `now-${timeRange}`, // e.g., "now-24h"
              lt: 'now',
            },
          },
        },
        // This is the aggregation section where we define our calculations
        aggs: {
          // Calculation 1: Group by log level
          logs_by_level: {
            terms: {
              field: 'level', // Group by the exact level string
            },
          },
          // Calculation 2: Group by service
          logs_by_service: {
            terms: {
              field: 'service', // Group by the exact service string
              size: 10, // Get the top 10 services
            },
          },
          // Calculation 3: Group by time
          logs_over_time: {
            date_histogram: {
              field: '@timestamp',
              fixed_interval: '1h', // Create one bucket per hour
              min_doc_count: 0, // Show hours even if they have 0 logs
            },
          },
        },
      },
    });

    res.status(200).json(result.aggregations);

  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error while fetching metrics.' });
  }
});

// --- 8. Start the Server ---
app.listen(PORT, () => {
  console.log(`Ingestion API server started and listening on http://localhost:${PORT}`);
  // After the server starts listening for web requests, we begin the process of connecting to RabbitMQ.
  connectToRabbitMQ();
});