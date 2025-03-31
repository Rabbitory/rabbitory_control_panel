export const COMMON_PORTS = [
  { name: "AMQP", port: 5672, desc: "Used for messaging between applications." },
  { name: "AMQPS", port: 5671, desc: "Secure version of AMQP." },
  { name: "MQTT", port: 1883, desc: "Lightweight messaging protocol for IoT." },
  { name: "MQTTS", port: 8883, desc: "Secure version of MQTT." },
  { name: "STOMP", port: 61613, desc: "Protocol for simple message queuing." },
  { name: "STOMPS", port: 61614, desc: "Text-oriented messaging protocol." },
  { name: "HTTPS", port: 443, desc: "Required for RabbitMQ Management UI." },
  { name: "STREAM", port: 5552, desc: "Data streaming protocol." },
  { name: "STREAM_SSL", port: 5551, desc: "SSL-secured streaming." },
];