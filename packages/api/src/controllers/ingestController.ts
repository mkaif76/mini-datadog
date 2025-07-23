import amqblib from 'amqplib';
// packages/api/src/controllers/ingestController.ts

import { Request, Response } from 'express';
import { Channel } from 'amqplib';

let rabbitMQChannel: Channel | null = null;

// This function allows our main index.ts to pass the RabbitMQ channel to this controller.
export const initializeIngestDependencies = (channel: Channel) => {
  rabbitMQChannel = channel;
};

// The controller function for the /ingest endpoint.
export const ingestLog = async (req: Request, res: Response) => {
  if (!rabbitMQChannel) {
    return res.status(503).json({ error: 'Service unavailable: Message queue is not ready.' });
  }
  const logData = req.body;
  if (!logData || typeof logData.message !== 'string') {
    return res.status(400).json({ error: 'Invalid log data. A "message" field is required.' });
  }
  try {
    const logBuffer = Buffer.from(JSON.stringify(logData));
    rabbitMQChannel.sendToQueue(process.env.QUEUE_NAME || 'log_queue', logBuffer, { persistent: true });
    return res.status(202).json({ status: 'Log accepted.' });
  } catch (error) {
    console.error('Failed to send log to queue:', error);
    return res.status(500).json({ error: 'Internal server error while queueing log.' });
  }
};