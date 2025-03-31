import { runSSMCommands } from '@/utils/AWS/SSM/runSSMCommands';
import { COMMON_PORTS } from '@/utils/firewallConstants';

interface PortConfig {
  port: number;
  protocol: string;
  plugin?: string | null;
  tls: boolean;
}

// Define port-specific configuration based on your requirements.
const PORT_CONFIGS: Record<number, PortConfig> = COMMON_PORTS.reduce((acc, { name, port }) => {
  acc[port] = {
    port,
    protocol: name,
    plugin: name.includes("STOMP") ? "rabbitmq_stomp" :
            name.includes("STREAM") ? "rabbitmq_stream" :
            name.includes("MQTT") ? "rabbitmq_mqtt" : null, // Now correctly handles MQTT
    tls: name.includes("S") || name.includes("SSL"), // Handles AMQPS, MQTTS, STOMPS, STREAM_SSL
  };
  return acc;
}, {} as Record<number, PortConfig>);


async function addRabbitmqPorts(instanceId: string, region: string, ports: number[]): Promise<void> {
  const commands: string[] = [];

  ports.forEach(port => {
    const config = PORT_CONFIGS[port];
    if (!config) {
      console.warn(`No configuration found for port ${port}`);
      return;
    }

    // If a plugin is required, enable it.
    if (config.plugin) {
      commands.push(`rabbitmq-plugins enable ${config.plugin}`);
    }

    // Append configuration for the listener based on whether TLS is required.
    if (config.tls) {
      // For TLS-enabled ports, add an SSL listener entry.
      commands.push(`echo "listeners.ssl.${port} = ${port}" >> /etc/rabbitmq/rabbitmq.conf`);
      // Append TLS configuration options.
      commands.push(`echo "ssl_options.cacertfile = /etc/rabbitmq/ssl/ca_certificate.pem" >> /etc/rabbitmq/rabbitmq.conf`);
      commands.push(`echo "ssl_options.certfile = /etc/rabbitmq/ssl/server_certificate.pem" >> /etc/rabbitmq/rabbitmq.conf`);
      commands.push(`echo "ssl_options.keyfile = /etc/rabbitmq/ssl/server_key.pem" >> /etc/rabbitmq/rabbitmq.conf`);
    } else {
      // For non-TLS ports, add a plain TCP listener.
      commands.push(`echo "listeners.tcp.${port} = ${port}" >> /etc/rabbitmq/rabbitmq.conf`);
    }
  });

  // Restart RabbitMQ to apply the configuration changes.
  commands.push('systemctl restart rabbitmq-server');

  await runSSMCommands(instanceId, commands, region);
}

async function removeRabbitmqPorts(instanceId: string, region: string, ports: number[]): Promise<void> {
  const commands: string[] = [];

  ports.forEach(port => {
    const config = PORT_CONFIGS[port];
    if (!config) {
      console.warn(`No configuration found for port ${port}`);
      return;
    }

    // Remove the corresponding listener configuration from rabbitmq.conf.
    if (config.tls) {
      commands.push(`sed -i '/listeners.ssl.${port} = ${port}/d' /etc/rabbitmq/rabbitmq.conf`);
    } else {
      commands.push(`sed -i '/listeners.tcp.${port} = ${port}/d' /etc/rabbitmq/rabbitmq.conf`);
    }

    // Optionally, disable the plugin if no other port is using it.
    if (config.plugin) {
      commands.push(`rabbitmq-plugins disable ${config.plugin}`);
    }
  });

  // Restart RabbitMQ to apply the changes.
  commands.push('systemctl restart rabbitmq-server');

  await runSSMCommands(instanceId, commands, region);
}

/**
 * Updates the RabbitMQ server configuration by adding and/or removing ports.
 *
 * @param instanceId - The EC2 instance ID where RabbitMQ is running.
 * @param region - The AWS region of the EC2 instance.
 * @param portsToAdd - Array of port numbers to add.
 * @param portsToRemove - Array of port numbers to remove.
 */
export async function updateRabbitmqPorts(
  instanceId: string,
  region: string,
  portsToAdd: number[],
  portsToRemove: number[]
): Promise<void> {
  // Remove ports first if specified.
  if (portsToRemove.length > 0) {
    await removeRabbitmqPorts(instanceId, region, portsToRemove);
  }

  // Add ports next if specified.
  if (portsToAdd.length > 0) {
    await addRabbitmqPorts(instanceId, region, portsToAdd);
  }
}