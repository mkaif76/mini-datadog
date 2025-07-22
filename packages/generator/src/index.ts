// packages/generator/src/index.ts

// --- 1. Load Environment Variables ---
import * as dotenv from 'dotenv';
dotenv.config();

// --- 2. Import Libraries ---
import axios from 'axios'; // For making HTTP requests
import { randomUUID } from 'crypto'; // For generating unique IDs

// --- 3. Configuration ---
const INGESTION_API_URL = process.env.INGESTION_API_URL;

// --- 4. Sample Data for Random Generation ---
const services = ['payment-service', 'user-service', 'api-gateway', 'frontend-app', 'db-replicator'
    , 'auth-service', 'notification-service', 'analytics-service', 'cache-service', 'search-service',
    'logging-service', 'file-storage-service', 'email-service', 'sms-service', 'webhook-service'
    , 'reporting-service', 'billing-service', 'inventory-service', 'order-service', 'shipping-service', 'support-service'
    , 'monitoring-service', 'alerting-service', 'backup-service', 'cdn-service', 'load-balancer-service', 'proxy-service', 'scheduler-service', 'api-v2-service', 'legacy-service'
    , 'mobile-app', 'desktop-app', 'third-party-integration', 'data-pipeline-service', 'streaming-service', 'real-time-service', 'batch-processing-service', 'ml-model-service', 'data-warehouse-service', 'data-lake-service'
    , 'search-engine-service', 'content-delivery-service', 'user-analytics-service', 'ad-service'
];
const levels = ['info', 'warn', 'error', 'debug'];
const messages = [
    'User logged in successfully',
    'Payment processed for order #',
    'Database connection timed out',
    'Failed to fetch user profile',
    'API rate limit exceeded',
    'New user signed up',
    'Cache cleared for user #',
    'Replication lag is above threshold',
    'GET /api/v1/users/ - 200 OK',
    'POST /api/v1/orders/ - 201 Created',
    'User password reset request',
    'Service discovery updated',
    'JWT token expired',
    'Session invalidated for user #',
    'Order status updated to shipped',
    'Inventory out of stock for item #',
    'Email sent to user #',
    'SMS delivery failed for user #',
    'Webhook received from partner',
    'Third-party API timeout',
    'Circuit breaker opened for service',
    'Retrying failed request',
    'Background job started',
    'Background job completed',
    'Health check failed for dependency',
    'Configuration reloaded',
    'Feature flag toggled',
    'User permissions updated',
    'Resource not found: /api/v1/resource/',
    'Rate limiter triggered for IP',
    'Request queued for processing',
    'Cache miss for key',
    'Cache hit for key',
    'File uploaded successfully',
    'File download failed',
    'Database migration completed',
    'Database migration failed',
    'Service restarted',
    'Graceful shutdown initiated',
    'Node joined cluster',
    'Node left cluster',
    'Metrics pushed to monitoring service',
    'Alert triggered: high memory usage',
    'Backup completed successfully',
    'Backup failed',
    'User session expired',
    'Invalid API key provided',
    'Dependency unavailable',
    'Request payload validation error',
    'Response time exceeded threshold'
];

// --- 5. Helper function to get a random item from an array ---
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- 6. The Main Log Generation Function ---
async function generateAndSendLog() {
  if (!INGESTION_API_URL) {
    console.error('INGESTION_API_URL is not defined. Please check your .env file.');
    // We use process.exit() to stop the script if the configuration is missing.
    process.exit(1); 
  }

  // Create a random log object
  const log = {
    level: getRandomElement(levels),
    message: `${getRandomElement(messages)} ${Math.floor(Math.random() * 1000)}`,
    service: getRandomElement(services),
    metadata: {
      requestId: randomUUID(), // Generate a unique ID for each request
      userId: `user-${Math.floor(Math.random() * 500)}`,
    },
  };

  try {
    // Send the log to our Ingestion API using an HTTP POST request
    await axios.post(INGESTION_API_URL, log, {
        headers: { 'Content-Type': 'application/json' }
    });
    console.log(`[+] Sent log: [${log.level.toUpperCase()}] - ${log.message}`);
  } catch (error) {
    // Handle errors (e.g., if the API server is down)
    if (axios.isAxiosError(error)) {
      console.error(`[!] Error sending log: ${error.message} (Is the API server running?)`);
    } else {
      console.error('[!] An unknown error occurred while sending the log.');
    }
  }
}

// --- 7. Start the Generator ---
function startGenerator() {
    if (!INGESTION_API_URL) {
        console.error('Cannot start generator: INGESTION_API_URL is not defined.');
        return;
    }
    console.log('Log generator started. Press CTRL+C to stop.');
    console.log(`Sending logs to: ${INGESTION_API_URL}`);

    // Set an interval to run the generateAndSendLog function every 2 seconds (2000 milliseconds)
    setInterval(generateAndSendLog, 2000);
}

startGenerator();