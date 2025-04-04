import { runSSMCommands } from '@/utils/AWS/SSM/runSSMCommands';
import { COMMON_PORTS } from '@/utils/firewallConstants';
import { EC2Client } from '@aws-sdk/client-ec2';
import { fetchInstance } from '../AWS/EC2/fetchInstance';

interface PortConfig {
  listenerFormat: string;
  port: number;
  protocol: string;
  plugin?: string | null;
  // tls: boolean;
}

export const PORT_CONFIGS: PortConfig[] = COMMON_PORTS.map(({ name, port }) => ({
  port,
  protocol: name,
  plugin: name.includes("STOMP") ? "rabbitmq_stomp" :
          name.includes("STREAM") ? "rabbitmq_stream" :
          name.includes("MQTT") ? "rabbitmq_mqtt" : null,
  listenerFormat: name.includes("STOMP") ? `stomp.listeners.tcp.${port} = ${port}` :
                 name.includes("STREAM") ? `stream.listeners.tcp.${port} = ${port}` :
                 name.includes("MQTT") ? `mqtt.listeners.tcp.${port} = ${port}` :
                 `listeners.tcp.${port} = ${port}`, // Default to AMQP
}));

// tls: name.includes("S") || name.includes("SSL"),

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

    if (config.plugin) {
      commands.push(
        `if ! sudo rabbitmq-plugins list -E | grep -q "${config.plugin}"; then sudo rabbitmq-plugins enable ${config.plugin}; fi`
      );
    }

    commands.push(
      `grep -q "${config.listenerFormat}" /etc/rabbitmq/rabbitmq.conf || echo "${config.listenerFormat}" | sudo tee -a /etc/rabbitmq/rabbitmq.conf`
    );
  });

  commands.push(`sudo systemctl restart rabbitmq-server`);
  commands.push("echo __PORT_ADDITION_START__");
  commands.push("cat /etc/rabbitmq/rabbitmq.conf");

  const output = await runSSMCommands(instance.InstanceId, commands, region);

  const parts = output.split("__CONFIG_START__");
  const testingOutput = parts.length > 1 ? parts[1] : output;
  console.log("\nTESTING OUTPUT:", testingOutput)
}


async function removeRabbitmqPorts(instanceName: string, region: string, ports: number[]): Promise<void> {
  const ec2Client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance?.InstanceId) {
    throw new Error(`Instance with name "${instanceName}" not found.`);
  }

  const commands: string[] = [];

  commands.push(`
    set -x;
    echo "Removing ports: ${ports.join(', ')}";
  `);

  const pluginsToDisable = new Set(
    ports.map(port => PORT_CONFIGS.find(c => c.port === port)?.plugin).filter(Boolean)
  );
  pluginsToDisable.forEach(plugin => {
    commands.push(`sudo rabbitmq-plugins disable ${plugin};`);
    commands.push(`echo "Disabled plugin: ${plugin}";`);
  });

  ports.forEach(port => {
    const config = PORT_CONFIGS.find(c => c.port === port);
    if (!config) {
      console.warn(`No configuration found for port ${port}`);
      return;
    }
    const escapedListenerFormat = config.listenerFormat.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
    commands.push(`
      sudo sed -i "/${escapedListenerFormat}/d" /etc/rabbitmq/rabbitmq.conf;
      echo "Removed listener: ${escapedListenerFormat}";
    `);
  });

  commands.push("sudo systemctl restart rabbitmq-server");

  const output = await runSSMCommands(instance.InstanceId, commands, region);

  if (!output.trim()) {
    throw new Error('No output from the command. Please check the command logs for potential errors.');
  }

  console.log('SSM Command Output:\n', output);
}

export async function updateRabbitmqPorts(
  instanceName: string,
  region: string,
  portsToAdd: number[],
  portsToRemove: number[]
): Promise<void> {
  try {
    console.log(`Updating RabbitMQ ports for instance ${instanceName} in ${region}`);
    console.log(`Ports to Add: ${portsToAdd.length > 0 ? portsToAdd.join(", ") : "None"}`);
    console.log(`Ports to Remove: ${portsToRemove.length > 0 ? portsToRemove.join(", ") : "None"}`);

    if (portsToRemove.length > 0) {
      await removeRabbitmqPorts(instanceName, region, portsToRemove);
    }

    if (portsToAdd.length > 0) {
      await addRabbitmqPorts(instanceName, region, portsToAdd);
    }

    console.log(`Successfully updated RabbitMQ ports for ${instanceName}`);
  } catch (error) {
    console.error(`Error updating RabbitMQ ports for instance ${instanceName}:`, error);

    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Stack Trace:", error.stack);
    } else {
      console.error("Raw Error:", JSON.stringify(error, null, 2));
    }

    throw new Error(`Failed to update RabbitMQ ports: ${JSON.stringify(error, null, 2)}`);
  }
}
