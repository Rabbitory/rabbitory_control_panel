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

  // const RABBITMQ_USER = "laren"; // Replace with your actual username
  // const RABBITMQ_PASSWORD = "pass123"; // Replace with your actual password

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
        `if ! sudo rabbitmq-plugins list -E | grep -q "${config.plugin}"; then sudo rabbitmq-plugins enable ${config.plugin}; fi`
      );
    }

    // Add the correct listener if it doesn’t already exist
    commands.push(
      `grep -q "${config.listenerFormat}" /etc/rabbitmq/rabbitmq.conf || echo "${config.listenerFormat}" | sudo tee -a /etc/rabbitmq/rabbitmq.conf`
    );

    // Add the correct listener (TCP or SSL) without duplicating
  //   if (config.tls) {
  //     commands.push(
  //       `[ $(grep -c "listeners.ssl.${port}" /etc/rabbitmq/rabbitmq.conf) -eq 0 ] && echo "listeners.ssl.${port} = ${port}" | sudo tee -a /etc/rabbitmq/rabbitmq.conf`
  //     );
  //     commands.push(`echo "ssl_options.cacertfile = /etc/rabbitmq/ssl/ca_certificate.pem" | sudo tee -a /etc/rabbitmq/rabbitmq.conf`);
  //     commands.push(`echo "ssl_options.certfile = /etc/rabbitmq/ssl/server_certificate.pem" | sudo tee -a /etc/rabbitmq/rabbitmq.conf`);
  //     commands.push(`echo "ssl_options.keyfile = /etc/rabbitmq/ssl/server_key.pem" | sudo tee -a /etc/rabbitmq/rabbitmq.conf`);
  //   } else {
  //     commands.push(
  //       `[ $(grep -c "listeners.tcp.${port}" /etc/rabbitmq/rabbitmq.conf) -eq 0 ] && echo "listeners.tcp.${port} = ${port}" | sudo tee -a /etc/rabbitmq/rabbitmq.conf`
  //     );
  //   }
  });

  // Apply changes and restart RabbitMQ
  commands.push(`sudo systemctl restart rabbitmq-server`);
  commands.push("echo __PORT_ADDITION_START__");
  commands.push("cat /etc/rabbitmq/rabbitmq.conf");

  const output = await runSSMCommands(instance.InstanceId, commands, region);

  const parts = output.split("__CONFIG_START__");
  const testingOutput = parts.length > 1 ? parts[1] : output;
  console.log("\nTESTING OUTPUT:", testingOutput)
}

// THIS ONE DIDNT THROW AN ERROR
// async function removeRabbitmqPorts(instanceName: string, region: string, ports: number[]): Promise<void> {
//   const ec2Client = new EC2Client({ region });
//   const instance = await fetchInstance(instanceName, ec2Client);
//   if (!instance?.InstanceId) {
//     throw new Error(`Instance with name "${instanceName}" not found.`);
//   }

//   const commands: string[] = [];

//   // Start in debug mode and capture the active ports from the config.
//   // We want the active_ports variable to reflect the current config (before removal).
//   commands.push(`
//     set -x;
//     active_ports=$(grep -oE 'listeners\\.(tcp|ssl|mqtt|stomp|stream)\\.[0-9]+' /etc/rabbitmq/rabbitmq.conf | awk -F. '{print $3}' | tr '\\n' ' ');
//     echo "Active ports: $active_ports";
//   `);

//   // Disable plugins first (if no active port exists for that plugin).
//   const pluginsToCheck = new Set(
//     ports.map(port => PORT_CONFIGS.find(c => c.port === port)?.plugin).filter(Boolean)
//   );
//   pluginsToCheck.forEach(plugin => {
//     // Here, we check whether the active_ports variable does NOT contain any port associated with that plugin.
//     // This prevents the plugin from re-adding its listener on restart.
//     commands.push(`
//       if [ $(echo "$active_ports" | grep -qE '(${PORT_CONFIGS.filter(c => c.plugin === plugin).map(c => c.port).join("|")})' && echo 1 || echo 0) -eq 0 ]; then
//         sudo rabbitmq-plugins disable ${plugin};
//         echo "Disabled plugin: ${plugin}";
//       else
//         echo "Plugin ${plugin} is still in use.";
//       fi
//     `);
//   });

//   // Now remove the listener configurations from rabbitmq.conf.
//   ports.forEach(port => {
//     const config = PORT_CONFIGS.find(c => c.port === port);
//     if (!config) {
//       console.warn(`No configuration found for port ${port}`);
//       return;
//     }
//     // Escape any special characters in the listenerFormat so that sed interprets it literally.
//     const escapedListenerFormat = config.listenerFormat.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
//     commands.push(`
//       if grep -q "${escapedListenerFormat}" /etc/rabbitmq/rabbitmq.conf; then
//         sudo sed -i "/${escapedListenerFormat}/d" /etc/rabbitmq/rabbitmq.conf;
//         echo "Removed listener: ${escapedListenerFormat}";
//       else
//         echo "Listener ${escapedListenerFormat} not found.";
//       fi
//     `);
//   });

//   // Restart RabbitMQ after making changes
//   commands.push("sudo systemctl restart rabbitmq-server");

//   // Run all commands in a single SSM command so the active_ports variable persists.
//   const output = await runSSMCommands(instance.InstanceId, commands, region);

//   // Check if output is empty.
//   if (!output.trim()) {
//     throw new Error('No output from the command. Please check the command logs for potential errors.');
//   }

//   console.log('SSM Command Output:\n', output);
// }

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

  // Disable plugins directly
  const pluginsToDisable = new Set(
    ports.map(port => PORT_CONFIGS.find(c => c.port === port)?.plugin).filter(Boolean)
  );
  pluginsToDisable.forEach(plugin => {
    commands.push(`sudo rabbitmq-plugins disable ${plugin};`);
    commands.push(`echo "Disabled plugin: ${plugin}";`);
  });

  // Remove the listener configurations from rabbitmq.conf.
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

  // Restart RabbitMQ after making changes
  commands.push("sudo systemctl restart rabbitmq-server");

  // Run all commands in a single SSM command
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

    // If `error` is an object, print it properly
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Stack Trace:", error.stack);
    } else {
      console.error("Raw Error:", JSON.stringify(error, null, 2));
    }

    throw new Error(`Failed to update RabbitMQ ports: ${JSON.stringify(error, null, 2)}`);
  }
}
