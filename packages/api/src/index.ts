// The 'dotenv' library loads variables from a .env file into process.env
import * as dotenv from 'dotenv';
dotenv.config(); // This should be one of the first things in your application

// --- 2. Import the tools we need ---
// 'express' is the library we use to create a web server.
import express, { Request, Response } from 'express';
// 'amqplib' is the library for connecting to RabbitMQ.
import amqp from 'amqplib';

// --- 3. Set up our configuration from environment variables ---
// Read the port from the .env file, with a default of 3000 if it's not found.
const PORT = process.env.PORT || 3000;
// Read the RabbitMQ URL from the .env file.
const RABBITMQ_URL = process.env.RABBITMQ_URL;
// The name of the queue we will send messages to.
const QUEUE_NAME = process.env.QUEUE_NAME || 'log_queue';

// --- 4. The Main Application ---
const app = express(); // Create an instance of an Express application
app.use(express.json()); // This is a "middleware". It automatically parses incoming JSON requests for us.

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

// --- 5. Define our API Endpoints (The "Addresses" of our server) ---

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


// --- 6. Start the Server ---
app.listen(PORT, () => {
  console.log(`Ingestion API server started and listening on http://localhost:${PORT}`);
  // After the server starts listening for web requests, we begin the process of connecting to RabbitMQ.
  connectToRabbitMQ();
});