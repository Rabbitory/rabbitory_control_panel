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

const PORT_CONFIGS: Record<number, PortConfig> = COMMON_PORTS.reduce((acc, { name, port }) => {
  acc[port] = {
    port,
    protocol: name,
    plugin: name.includes("STOMP") ? "rabbitmq_stomp" :
            name.includes("STREAM") ? "rabbitmq_stream" :
            name.includes("MQTT") ? "rabbitmq_mqtt" : null,
    tls: name.includes("S") || name.includes("SSL"),
  };
  return acc;
}, {} as Record<number, PortConfig>);

async function addRabbitmqPorts(instanceName: string, region: string, ports: number[]): Promise<void> {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance?.InstanceId) {
    throw new Error(`Instance with name "${instanceName}" not found.`);
  }

  const commands: string[] = [];

  ports.forEach(port => {
    const config = PORT_CONFIGS[port];
    if (!config) {
      console.warn(`No configuration found for port ${port}`);
      return;
    }

    if (config.plugin) {
      commands.push(`rabbitmq-plugins enable ${config.plugin}`);
    }

    if (config.tls) {
      commands.push(`echo "listeners.ssl.${port} = ${port}" >> /etc/rabbitmq/rabbitmq.conf`);
      commands.push(`echo "ssl_options.cacertfile = /etc/rabbitmq/ssl/ca_certificate.pem" >> /etc/rabbitmq/rabbitmq.conf`);
      commands.push(`echo "ssl_options.certfile = /etc/rabbitmq/ssl/server_certificate.pem" >> /etc/rabbitmq/rabbitmq.conf`);
      commands.push(`echo "ssl_options.keyfile = /etc/rabbitmq/ssl/server_key.pem" >> /etc/rabbitmq/rabbitmq.conf`);
    } else {
      commands.push(`echo "listeners.tcp.${port} = ${port}" >> /etc/rabbitmq/rabbitmq.conf`);
    }
  });

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

  ports.forEach(port => {
    const config = PORT_CONFIGS[port];
    if (!config) {
      console.warn(`No configuration found for port ${port}`);
      return;
    }

    if (config.tls) {
      commands.push(`sed -i '/listeners.ssl.${port} = ${port}/d' /etc/rabbitmq/rabbitmq.conf`);
    } else {
      commands.push(`sed -i '/listeners.tcp.${port} = ${port}/d' /etc/rabbitmq/rabbitmq.conf`);
    }

    if (config.plugin) {
      commands.push(`rabbitmq-plugins disable ${config.plugin}`);
    }
  });

  commands.push("systemctl restart rabbitmq-server");

  await runSSMCommands(instance.InstanceId, commands, region);
}

export async function updateRabbitmqPorts(
  instanceName: string,
  region: string,
  portsToAdd: number[],
  portsToRemove: number[]
): Promise<void> {

  if (portsToRemove.length > 0) {
    await removeRabbitmqPorts(instanceName, region, portsToRemove);
  }

  if (portsToAdd.length > 0) {
    await addRabbitmqPorts(instanceName, region, portsToAdd);
  }
}