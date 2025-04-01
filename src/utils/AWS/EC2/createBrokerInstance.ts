import {
  EC2Client,
  RunInstancesCommand,
  // DescribeInstancesCommand,
  RunInstancesCommandInput,
  // waitUntilInstanceRunning,
  _InstanceType,
} from "@aws-sdk/client-ec2";
import getUbuntuAmiId from "../AMI/AMI";
// import generateName from "@/utils/randomNameGenerator";
import getInstanceProfileByName from "../IAM/getprofileId";
import {
  createSecurityGroup,
  getDefaultVpcId,
} from "../Security-Groups/createBrokerSG";

// async function getInstanceDetails(
//   instanceId: string | undefined,
//   ec2Client: EC2Client,
// ) {
//   const describeCommand = new DescribeInstancesCommand({
//     InstanceIds: instanceId ? [instanceId] : undefined,
//   });
//   const describeResponse = await ec2Client.send(describeCommand);

//   if (
//     !describeResponse.Reservations ||
//     describeResponse.Reservations.length === 0 ||
//     !describeResponse.Reservations[0].Instances ||
//     describeResponse.Reservations[0].Instances.length === 0
//   ) {
//     throw new Error("No instance information found.");
//   }

//   const instance = describeResponse.Reservations[0].Instances[0];
//   const publicDns = instance.PublicDnsName || "N/A";
//   const publicIp = instance.PublicIpAddress || "N/A";

//   return { publicDns, publicIp };
// }

// # Create Dead-Letter Queue
// /usr/local/bin/rabbitmqadmin declare queue name=${dlqName} durable=true
// # Build JSON arguments for the main queue using the provided dead-letter queue name
// json_args="{\\"x-dead-letter-exchange\\": \\"\\", \\"x-dead-letter-routing-key\\": \\"${dlqName}\\"}"

// # Create Main Queue with DLQ settings (dead-letter exchange is the default exchange "")
// /usr/local/bin/rabbitmqadmin declare queue name=${mainQueueName} durable=true arguments="$json_args"

export default async function createInstance(
  region: string,
  instanceName: string,
  instanceType: _InstanceType = "t2.micro",
  username: string = "admin",
  password: string = "password",
  storageSize: number = 8,
) {
  const userDataScript = `#!/bin/bash
# Update package lists and install RabbitMQ server and wget
apt-get install curl gnupg apt-transport-https -y

## Team RabbitMQ's main signing key
curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | sudo gpg --dearmor | sudo tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
## Community mirror of Cloudsmith: modern Erlang repository
curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-erlang.E495BB49CC4BBE5B.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg > /dev/null
## Community mirror of Cloudsmith: RabbitMQ repository
curl -1sLf https://github.com/rabbitmq/signing-keys/releases/download/3.0/cloudsmith.rabbitmq-server.9F4587F226208342.key | sudo gpg --dearmor | sudo tee /usr/share/keyrings/rabbitmq.9F4587F226208342.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
tee /etc/apt/sources.list.d/rabbitmq.list <<'EOF'
## Provides modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa1.rabbitmq.com/rabbitmq/rabbitmq-erlang/deb/ubuntu noble main
deb-src [signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa1.rabbitmq.com/rabbitmq/rabbitmq-erlang/deb/ubuntu noble main

# another mirror for redundancy
deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa2.rabbitmq.com/rabbitmq/rabbitmq-erlang/deb/ubuntu noble main
deb-src [signed-by=/usr/share/keyrings/rabbitmq.E495BB49CC4BBE5B.gpg] https://ppa2.rabbitmq.com/rabbitmq/rabbitmq-erlang/deb/ubuntu noble main

## Provides RabbitMQ
##
deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa1.rabbitmq.com/rabbitmq/rabbitmq-server/deb/ubuntu noble main
deb-src [signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa1.rabbitmq.com/rabbitmq/rabbitmq-server/deb/ubuntu noble main

# another mirror for redundancy
deb [arch=amd64 signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa2.rabbitmq.com/rabbitmq/rabbitmq-server/deb/ubuntu noble main
deb-src [signed-by=/usr/share/keyrings/rabbitmq.9F4587F226208342.gpg] https://ppa2.rabbitmq.com/rabbitmq/rabbitmq-server/deb/ubuntu noble main
EOF

## Update package indices
apt-get update -y

## Install Erlang packages
apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

## Install rabbitmq-server and its dependencies
apt-get install rabbitmq-server wget -y --fix-missing

# Stop RabbitMQ service if running
systemctl stop rabbitmq-server

# Enable plugins offline (this writes directly to the enabled_plugins file)
rabbitmq-plugins --offline enable rabbitmq_management rabbitmq_management_agent rabbitmq_web_dispatch

# Write the configuration file to enable the log exchange
tee /etc/rabbitmq/rabbitmq.conf <<'EOF'
log.exchange = true
heartbeat = 120
channel_max = 0
consumer_timeout = 7200000
vm_memory_high_watermark.relative = 0.81
queue_index_embed_msgs_below = 4096
max_message_size = 134217728
log.exchange.level = error
mqtt.exchange = amq.topic
cluster_partition_handling = autoheal
EOF

# Start RabbitMQ service
systemctl start rabbitmq-server
systemctl enable rabbitmq-server

# Create admin user for the management UI
rabbitmqctl add_user ${username} ${password}
rabbitmqctl set_user_tags ${username} administrator
rabbitmqctl set_permissions -p / ${username} ".*" ".*" ".*"

# Wait for the management interface to be available
# Poll the RabbitMQ management endpoint until it's available.
# Set maximum wait time (in seconds) and polling interval.
max_wait=120
interval=5
elapsed=0

echo "Waiting for RabbitMQ management interface to become available..."
while true; do
  # Send a GET request to the health check endpoint using curl.
  response=$(curl -s -u "${username}:${password}" http://localhost:15672/api/health/checks/port-listener/15672)

  # Check if the response contains "status":"ok"
  if echo "$response" | grep -q '"status":"ok"'; then
    echo "RabbitMQ management interface is up."
    break
  fi

  # Wait for the specified interval before checking again.
  sleep \$interval
  elapsed=\$((elapsed + interval))

  # If the maximum wait time is exceeded, exit with an error.
  if [ \$elapsed -ge \$max_wait ]; then
    echo "Timeout waiting for RabbitMQ management interface."
    exit 1
  fi
done

# Download rabbitmqadmin (the RabbitMQ CLI tool) from the local management interface
wget -O /usr/local/bin/rabbitmqadmin http://localhost:15672/cli/rabbitmqadmin
chmod +x /usr/local/bin/rabbitmqadmin

# Declare a durable queue named 'logstream' with a maximum length of 1000 messages.
rabbitmqadmin declare queue name=logstream durable=true arguments='{"x-max-length":1000}'

# Bind the logstream queue to the log exchange.
rabbitmqadmin declare binding source="amq.rabbitmq.log" destination="logstream" destination_type="queue" routing_key="#"
`;
  const ec2Client = new EC2Client({ region });
  const amiId = await getUbuntuAmiId(region); // Changed from getAmiId to getUbuntuAmiId

  const vpcId = await getDefaultVpcId(ec2Client);
  const IPN = await getInstanceProfileByName(
    "RMQBrokerInstanceProfile",
    region,
  );

  if (!IPN) return false;

  const securityGroupId = await createSecurityGroup(ec2Client, vpcId);

  // Data must be base64 encoded
  const encodedUserData = Buffer.from(userDataScript).toString("base64");

  // const instanceName = generateName();
  const params: RunInstancesCommandInput = {
    ImageId: amiId, // AMI (OS) id (Ubuntu in this example) - region specific
    InstanceType: instanceType, // Instance hardware
    MinCount: 1, // 1 instance made
    MaxCount: 1, // 1 instance made
    SecurityGroupIds: securityGroupId ? [securityGroupId] : undefined, // Security group id
    UserData: encodedUserData,
    IamInstanceProfile: {
      Name: IPN,
    },
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [
          {
            Key: "Name",
            Value: instanceName,
          },
          {
            Key: "Publisher",
            Value: "Rabbitory",
          },
        ],
      },
    ],
    BlockDeviceMappings: [
      {
        DeviceName: "/dev/sda1",
        Ebs: {
          VolumeSize: storageSize,
          VolumeType: "gp3",
          DeleteOnTermination: true,
        },
      },
    ],
  };

  try {
    const data = await ec2Client.send(new RunInstancesCommand(params));
    if (!data.Instances) throw new Error("No instances found");
    const instanceId = data.Instances[0].InstanceId;

    // console.log("Instance created:", instanceId);

    // await waitUntilInstanceRunning(
    //   { client: ec2Client, maxWaitTime: 3000 },
    //   { InstanceIds: instanceId ? [instanceId] : undefined }
    // );
    // console.log(`Instance ${instanceId} is now running.`);

    // Retrieve instance details to get its public DNS or IP
    // const { publicDns, publicIp } = await getInstanceDetails(
    //   instanceId,
    //   ec2Client
    // );

    // Construct an AMQP endpoint URL for the main queue (RabbitMQ listens on port 5672)

    // const endpointUrl = `amqp://${username}:${password}@${
    //   publicDns || publicIp
    // }:5672`;
    // console.log(`Main queue endpoint URL: ${endpointUrl}`);

    return { instanceId, instanceName };
  } catch (err) {
    console.error("Error creating instance:", err);
    return false;
  }
}
