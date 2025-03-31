import { runSSMCommands } from '@/utils/AWS/SSM/runSSMCommands';
import { COMMON_PORTS } from '@/utils/firewallConstants';
import { EC2Client } from '@aws-sdk/client-ec2';
import { fetchInstance } from '../AWS/EC2/fetchInstance';

interface PortConfig {
  port: number;
  protocol: string;
  plugin?: string | null;
  tls: boolean;
}

export const PORT_CONFIGS: PortConfig[] = COMMON_PORTS.map(({ name, port }) => ({
  port,
  protocol: name,
  plugin: name.includes("STOMP") ? "rabbitmq_stomp" :
          name.includes("STREAM") ? "rabbitmq_stream" :
          name.includes("MQTT") ? "rabbitmq_mqtt" : null,
  tls: name.includes("S") || name.includes("SSL"),
}));

async function addRabbitmqPorts(instanceName: string, region: string, ports: number[]): Promise<void> {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance?.InstanceId) {
    throw new Error(`Instance with name "${instanceName}" not found.`);
  }

  const commands: string[] = [];

  ports.forEach(port => {
    const config = PORT_CONFIGS.find(c => c.port === port);
    if (!config) {
      console.warn(`No configuration found for port ${port}`);
      return;
    }

    // Enable the plugin if it's not already enabled
    if (config.plugin) {
      commands.push(
        `[ $(rabbitmq-plugins list -E | grep -c "${config.plugin}") -eq 0 ] && rabbitmq-plugins enable ${config.plugin}`
      );
    }

    // Add the correct listener (TCP or SSL) without duplicating
    if (config.tls) {
      commands.push(
        `[ $(grep -c "listeners.ssl.${port}" /etc/rabbitmq/rabbitmq.conf) -eq 0 ] && echo "listeners.ssl.${port} = ${port}" >> /etc/rabbitmq/rabbitmq.conf`
      );
      commands.push(`echo "ssl_options.cacertfile = /etc/rabbitmq/ssl/ca_certificate.pem" >> /etc/rabbitmq/rabbitmq.conf`);
      commands.push(`echo "ssl_options.certfile = /etc/rabbitmq/ssl/server_certificate.pem" >> /etc/rabbitmq/rabbitmq.conf`);
      commands.push(`echo "ssl_options.keyfile = /etc/rabbitmq/ssl/server_key.pem" >> /etc/rabbitmq/rabbitmq.conf`);
    } else {
      commands.push(
        `[ $(grep -c "listeners.tcp.${port}" /etc/rabbitmq/rabbitmq.conf) -eq 0 ] && echo "listeners.tcp.${port} = ${port}" >> /etc/rabbitmq/rabbitmq.conf`
      );
    }
  });

  // Restart RabbitMQ to apply the changes
  commands.push("systemctl restart rabbitmq-server");

  await runSSMCommands(instance.InstanceId, commands, region);
}

async function removeRabbitmqPorts(instanceName: string, region: string, ports: number[]): Promise<void> {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance?.InstanceId) {
    throw new Error(`Instance with name "${instanceName}" not found.`);
  }

  const commands: string[] = [];

  // Get the list of currently active ports before making changes
  commands.push("active_ports=$(grep -oE 'listeners\\.(tcp|ssl)\\.[0-9]+' /etc/rabbitmq/rabbitmq.conf | awk -F. '{print $3}' | tr '\\n' ' ')");

  ports.forEach(port => {
    const config = PORT_CONFIGS.find(c => c.port === port);
    if (!config) {
      console.warn(`No configuration found for port ${port}`);
      return;
    }

    // Remove the listener configuration from rabbitmq.conf
    if (config.tls) {
      commands.push(`sed -i '/listeners.ssl.${port} = ${port}/d' /etc/rabbitmq/rabbitmq.conf`);
    } else {
      commands.push(`sed -i '/listeners.tcp.${port} = ${port}/d' /etc/rabbitmq/rabbitmq.conf`);
    }
  });

  // Ensure we only disable plugins if no active ports are using them
  const pluginsToCheck = new Set(ports.map(port => PORT_CONFIGS.find(c => c.port === port)?.plugin).filter(Boolean));
  pluginsToCheck.forEach(plugin => {
    commands.push(
      `[ $(echo \"$active_ports\" | grep -qE '(${PORT_CONFIGS.filter(c => c.plugin === plugin).map(c => c.port).join("|")})' && echo 1 || echo 0) -eq 0 ] && rabbitmq-plugins disable ${plugin}`
    );
  });

  // Restart RabbitMQ to apply the changes
  commands.push("systemctl restart rabbitmq-server");

  await runSSMCommands(instance.InstanceId, commands, region);
}

export async function updateRabbitmqPorts(
  instanceName: string,
  region: string,
  portsToAdd: number[],
  portsToRemove: number[]
): Promise<void> {
  try {
    if (portsToRemove.length > 0) {
      await removeRabbitmqPorts(instanceName, region, portsToRemove);
    }

    if (portsToAdd.length > 0) {
      await addRabbitmqPorts(instanceName, region, portsToAdd);
    }
  } catch (error) {
    console.error(`Error updating RabbitMQ ports for instance ${instanceName}:`, error);
    throw new Error(`Failed to update RabbitMQ ports: ${error}`);
  }
}
