export interface Plugin {
  name: string;
  description: string;
}

export const plugins: Plugin[] = [
  {
    name: "rabbitmq_amqp1_0",
    description: "Deprecated no-op AMQP 1.0 plugin",
  },
  {
    name: "rabbitmq_auth_backend_cache",
    description: "RabbitMQ Authentication Backend cache",
  },
  {
    name: "rabbitmq_auth_backend_http",
    description: "RabbitMQ HTTP Authentication Backend",
  },
  {
    name: "rabbitmq_auth_backend_ldap",
    description: "RabbitMQ LDAP Authentication Backend",
  },
  {
    name: "rabbitmq_auth_backend_oauth2",
    description: "OAuth 2 and JWT-based AuthN and AuthZ backend",
  },
  {
    name: "rabbitmq_auth_mechanism_ssl",
    description: "RabbitMQ SSL authentication (SASL EXTERNAL)",
  },
  {
    name: "rabbitmq_consistent_hash_exchange",
    description: "Consistent Hash Exchange Type",
  },
  {
    name: "rabbitmq_event_exchange",
    description: "Event Exchange Type",
  },
  {
    name: "rabbitmq_federation",
    description: "RabbitMQ Federation",
  },
  {
    name: "rabbitmq_federation_management",
    description: "RabbitMQ Federation Management",
  },
  {
    name: "rabbitmq_federation_prometheus",
    description: "Exposes rabbitmq_federation metrics to Prometheus",
  },
  {
    name: "rabbitmq_jms_topic_exchange",
    description: "RabbitMQ JMS topic selector exchange plugin",
  },
  {
    name: "rabbitmq_management",
    description:
      "RabbitMQ Management Console Required. Used for health and metrics",
  },
  {
    name: "rabbitmq_management_agent",
    description: "RabbitMQ Management Agent Required. Used for node metrics",
  },
  {
    name: "rabbitmq_mqtt",
    description: "RabbitMQ MQTT Adapter",
  },
  {
    name: "rabbitmq_prometheus",
    description:
      "Prometheus metrics for RabbitMQ Required. Used for metrics, monitoring and support-debugging",
  },
  {
    name: "rabbitmq_random_exchange",
    description: "RabbitMQ Random Exchange",
  },
  {
    name: "rabbitmq_recent_history_exchange",
    description: "RabbitMQ Recent History Exchange",
  },
  {
    name: "rabbitmq_sharding",
    description: "RabbitMQ Sharding Plugin",
  },
  {
    name: "rabbitmq_shovel",
    description: "Data Shovel for RabbitMQ Recommended. Used for instance logs",
  },
  {
    name: "rabbitmq_shovel_management",
    description:
      "Management extension for the Shovel plugin Recommended. Used for instance logs",
  },
  {
    name: "rabbitmq_shovel_prometheus",
    description: "Exposes rabbitmq_shovel metrics to Prometheus",
  },
  {
    name: "rabbitmq_stomp",
    description: "RabbitMQ STOMP plugin",
  },
  {
    name: "rabbitmq_stream",
    description: "RabbitMQ Stream",
  },
  {
    name: "rabbitmq_stream_management",
    description: "RabbitMQ Stream Management",
  },
  {
    name: "rabbitmq_top",
    description: "RabbitMQ Top",
  },
  {
    name: "rabbitmq_tracing",
    description: "RabbitMQ message logging / tracing",
  },
  {
    name: "rabbitmq_trust_store",
    description: "Client X.509 certificates trust store",
  },
  {
    name: "rabbitmq_web_dispatch",
    description:
      "RabbitMQ Web Dispatcher Recommended. Used by management plugin",
  },
  {
    name: "rabbitmq_web_mqtt",
    description: "RabbitMQ MQTT-over-WebSockets adapter",
  },
  {
    name: "rabbitmq_web_stomp",
    description: "RabbitMQ STOMP-over-WebSockets support",
  },
];
