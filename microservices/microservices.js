const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');
dotenv.config();

const { Kafka, Partitioners } = require('kafkajs'); // Import Kafka and Partitioners

const kafkaBrokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const kafkaLogTopic = process.env.KAFKA_LOG_TOPIC || 'logs';
const serviceName = process.env.SERVICE_NAME || 'default-service'; // Use service name for clientId

const kafka = new Kafka({
  clientId: `${serviceName}-logger`, 
  brokers: kafkaBrokers,
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  createPartitioner: Partitioners.DefaultPartitioner,
});

class LogGenerator {
  constructor() {
    if (process.env.SERVICE_NAME) {
      this.serviceNames = [process.env.SERVICE_NAME];
    } else {
      this.serviceNames = [
        'web-service',
        'auth-service',
        'user-service',
        'order-service',
        'inventory-service',
        'payment-service',
      ];
    }

    this.logLevels = ['info', 'warn', 'error'];
    this.endpoints = [
      '/api/v1/users',
      '/api/v1/orders',
      '/api/v1/products',
      '/api/v1/payments',
      '/api/v1/auth/login',
      '/api/v1/auth/register'
    ];

    this.countries = [
      'US', 'CA', 'GB', 'DE', 'FR', 'IN', 'JP', 'CN', 'BR', 'AU'
    ];
  }

  generateLog() {
    const service = this.serviceNames[Math.floor(Math.random() * this.serviceNames.length)];
    let level = this.logLevels[Math.floor(Math.random() * this.logLevels.length)];
    const endpoint = this.endpoints[Math.floor(Math.random() * this.endpoints.length)];
    const country = this.countries[Math.floor(Math.random() * this.countries.length)];

    let httpStatus;
    if (level === "error") {
      httpStatus = [500, 503, 400, 401, 403, 404][Math.floor(Math.random() * 6)];
    } else if (level === "warn") {
      httpStatus = [300, 301, 302, 304][Math.floor(Math.random() * 4)];
    } else {
      httpStatus = [200, 201, 202, 204][Math.floor(Math.random() * 4)];
    }

    // Make error logs less frequent
    if (level === 'error' && Math.random() < 0.8) {
      level = 'info';
      httpStatus = 200;
    }

    
    let responseTime;
    switch (service) {
      case 'web-service':
        responseTime = Math.floor(Math.random() * 100) + 20; // 20-120ms
        break;
      case 'auth-service':
        responseTime = Math.floor(Math.random() * 150) + 50; // 50-250ms
        break;
      case 'user-service':
        responseTime = Math.floor(Math.random() * 200) + 100; // 100-400ms
        break;
      case 'order-service':
        responseTime = Math.floor(Math.random() * 320) + 120; // 200-600ms
        break;
      case 'inventory-service':
        responseTime = Math.floor(Math.random() * 500) + 300; // 300-700ms
        break;
      case 'payment-service':
        responseTime = Math.floor(Math.random() * 600) + 400; // 400-800ms
        break;
      default:
        responseTime = Math.floor(Math.random() * 700) + 500; // 500-900ms
        break;
    }

    // make some endpoints late
    if (endpoint === "/api/v1/payments" || endpoint === "/api/v1/orders") {
      responseTime += Math.floor(Math.random() * 200) + 100; // add 100-200ms
    }

    const timestamp = new Date();
    timestamp.setSeconds(
      timestamp.getSeconds() + Math.floor(Math.random() * 5) - 2 // -2 to +2 seconds
    )

    // making sure 30 percent of logs have no user ID
    const userId = Math.random() < 0.3 ? null : faker.string.uuid();

    const logEntry = {
      "@timestamp": timestamp.toISOString(),
      service: service,
      level: level,
      message: this.generateMessage(level, endpoint, httpStatus),
      endpoint: endpoint,
      method: this.getMethodForEndpoint(endpoint),
      httpStatus: httpStatus,
      responseTime: responseTime,
      requestId: `req-${Math.floor(Math.random() * 90000) + 10000}`,
      clientIp: faker.internet.ip(),
      userId: userId,
      country: country,
      userAgent: faker.internet.userAgent(),
      environment: "production",
      version: "1.0.0",
    }

    // add context-specific fields depending upon the service
    if (service === 'payment-service') {
      logEntry.paymentProvider = ['stripe', 'paypal', 'gpay'][Math.floor(Math.random() * 3)];
      logEntry.paymentStatus = ['success', 'failed', 'pending'][Math.floor(Math.random() * 3)];
      logEntry.transactionAmount = ((Math.random() * 100000) / 10).toFixed(2); // random amount between 0 and 1000
    }

    if (service === 'auth-service') {
      logEntry.authMethod = ['password', 'oauth', 'sso'][Math.floor(Math.random() * 3)];
      logEntry.authSuccess = Math.random() < 0.5; // 50% success rate
    }

    if (level === "error") {
      logEntry.error = this.generateError();
      logEntry.syackTrace = this.generateStackTrace();
    }

    return logEntry;
  }

  getMethodForEndpoint(endpoint) {
    switch (endpoint) {
      case '/api/v1/users':
        return 'GET';
      case '/api/v1/orders':
        return 'POST';
      case '/api/v1/products':
        return 'GET';
      case '/api/v1/payments':
        return 'POST';
      default:
        return 'GET';
    }
  }

  generateMessage(level, endpoint, httpStatus) {
    let message;
    switch (level) {
      case 'info':
        message = `Request to ${endpoint} completed successfully with status ${httpStatus}`;
        break;
      case 'warn':
        message = `Request to ${endpoint} completed with warning status ${httpStatus}`;
        break;
      case 'error':
        message = `Request to ${endpoint} failed with error status ${httpStatus}`;
        break;
      default:
        message = `Request to ${endpoint} completed successfully with status ${httpStatus}`;
        break;
    }
    return message;
  }

  generateError() {
    return {
      name: faker.word.noun(),
      message: faker.word.noun(),
      stack: this.generateStackTrace(),
    }
  }

  generateStackTrace() {
    const stack = [];
    const stackSize = Math.floor(Math.random() * 5) + 3; // stack trace size between 3 and 7
    for (let i = 0; i < stackSize; i++) {
      stack.push(`${faker.word.noun()} at ${faker.word.noun()} (${faker.system.filePath()}:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 10) + 1})`);
    }
    return stack;
  }

  async startTimer(interval = 200) {
    setInterval(async () => {
      const log = this.generateLog(); 

      try {
       
        await producer.send({
          topic: kafkaLogTopic,
          messages: [{key:log.service, value: JSON.stringify(log) }],
        });
        console.log(`[${serviceName}] Successfully sent log to Kafka:`, log.message);
      } catch (error) {
        console.error(`[${serviceName}] Error sending log to Kafka:`, error);
      }
    }, interval);
  }
}

async function main() {
  
  try {
    await producer.connect();
    console.log(`[${serviceName}] Kafka producer connected for ${serviceName}`);
  } catch (error) {
    console.error(`[${serviceName}] Error connecting Kafka producer for ${serviceName}:`, error);
    process.exit(1);
  }

  // Handle producer disconnects
  producer.on('producer.disconnect', () => {
    console.warn(`[${serviceName}] Kafka producer for ${serviceName} disconnected.`);
  });

  const logGenerator = new LogGenerator();
  await logGenerator.startTimer(200);
}

main();
