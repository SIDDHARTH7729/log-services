
const net = require('net');
const host = 'kafka';
const port = 9092;

const waitForKafka = () => {
  const socket = new net.Socket();
  socket.setTimeout(1000);
  socket.on('error', () => retry());
  socket.on('timeout', () => retry());

  socket.connect(port, host, () => {
    console.log('✅ Kafka is ready.');
    process.exit(0);
  });

  const retry = () => {
    console.log('⏳ Waiting for Kafka...');
    setTimeout(waitForKafka, 2000);
  };
};

waitForKafka();
