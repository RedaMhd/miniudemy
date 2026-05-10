const amqp = require('amqplib');

let connection = null;
let channel = null;

const connectRabbitMQ = async (url) => {
  let retries = 5;
  while (retries) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();
      console.log('RabbitMQ connected successfully');
      
      // Handle connection closures
      connection.on('error', (err) => {
        console.error('RabbitMQ connection error', err);
        setTimeout(() => connectRabbitMQ(url), 5000);
      });
      connection.on('close', () => {
        console.error('RabbitMQ connection closed. Reconnecting...');
        setTimeout(() => connectRabbitMQ(url), 5000);
      });

      return { connection, channel };
    } catch (error) {
      console.error(`RabbitMQ connection failed. Retries left: ${retries - 1}`, error);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  throw new Error('Could not connect to RabbitMQ after multiple retries');
};

const publishEvent = async (exchange, routingKey, eventData) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  
  await channel.assertExchange(exchange, 'topic', { durable: true });
  const message = Buffer.from(JSON.stringify(eventData));
  channel.publish(exchange, routingKey, message, { persistent: true });
  console.log(`Event published to exchange ${exchange} with key ${routingKey}:`, eventData);
};

const subscribeEvent = async (exchange, queueName, routingKey, onMessage) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');

  await channel.assertExchange(exchange, 'topic', { durable: true });
  const q = await channel.assertQueue(queueName, { durable: true });
  
  await channel.bindQueue(q.queue, exchange, routingKey);
  console.log(`Subscribed to queue ${queueName} waiting for ${routingKey}`);

  channel.consume(q.queue, (msg) => {
    if (msg !== null) {
      const eventData = JSON.parse(msg.content.toString());
      onMessage(eventData);
      channel.ack(msg);
    }
  });
};

module.exports = {
  connectRabbitMQ,
  publishEvent,
  subscribeEvent
};
