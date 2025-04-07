import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { Alarm } from "@/types/alarms";
import { startMetricsMonitoring } from "@/utils/RabbitMQ/monitorMetrics";
import { decrypt } from "@/utils/encrypt";
import { stopMetricsMonitoring } from "@/utils/RabbitMQ/monitorMetrics";
import {
  appendAlarmsSettings,
  deleteAlarmFromDynamoDB,
  fetchFromDynamoDB,
} from "@/utils/dynamoDBUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 }
    );
  }

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }

  try {
    const response = await fetchFromDynamoDB("rabbitory-instances-metadata", {
      instanceId: instance.InstanceId,
    });

    if (!response || !response.Item) {
      return NextResponse.json({
        memory: [],
        storage: []
      });
    }

    const alarms = response.Item.alarms;

    return NextResponse.json(alarms);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching alarms settings" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;

  if (!region) {
    return NextResponse.json(
      { message: "Missing region parameter" },
      { status: 400 }
    );
  }

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }

  const alarmData = await request.json();

  try {
    const response = await appendAlarmsSettings(instance.InstanceId, alarmData);

    const metadata = await fetchFromDynamoDB("RabbitoryInstancesMetadata", {
      instanceId: instance.InstanceId,
    });

    const encryptedUsername = metadata.Item?.encryptedUsername;
    const encryptedPassword = metadata.Item?.encryptedPassword;
    const publicDns = instance.PublicDnsName;
    const type = alarmData.type;

    if (!encryptedUsername || !encryptedPassword || !publicDns) {
      return NextResponse.json(
        { message: "RabbitMQ credentials not found" },
        { status: 500 }
      );
    }

    const username = decrypt(encryptedUsername);
    const password = decrypt(encryptedPassword);
    const alarms = response.Attributes?.alarms;
    // we append the newest alarm, so order is maintained
    const newAlarm: Alarm = alarms[type]?.slice(-1)[0];

    await startMetricsMonitoring(
      publicDns,
      username,
      password,
      newAlarm,
      alarmData.type,
    );

    return NextResponse.json({
      message: "Alarm added and monitoring started",
      alarms: response.Attributes?.alarms
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error adding alarm and starting monitoring" },
      { status: 500 }
    );
  }
}

// import { startMetricsMonitoring } from '@/utils/RabbitMQ/monitorMetrics';
//
// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ name: string }> }
// ) {
//   // ... existing code ...
//
//   try {
//     const response = await axios.get(rabbitmqUrl, {
//       auth: { username, password }
//     });
//
//     // Start the monitoring cron job
//     await startMetricsMonitoring(
//       publicDns,
//       username,
//       password,
// [alarms], // Pass the alarm settings
// type as 'memory' | 'storage'
//     );
//
//     return NextResponse.json({ message: "Monitoring started successfully" });
//   } catch (error) {
//     console.error("Error starting monitoring:", error);
//     return NextResponse.json(
//       { message: "Error starting monitoring" },
//       { status: 500 }
//     );
//   }
// }
// }

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const type = searchParams.get("type");
  const alarmId = searchParams.get("id");
  const { name: instanceName } = await params;

  if (!region || !type || !alarmId) {
    return NextResponse.json({ message: "Missing parameter" }, { status: 400 });
  }

  const client = new EC2Client({ region });
  const instance = await fetchInstance(instanceName, client);

  if (!instance || !instance.InstanceId) {
    return NextResponse.json(
      { message: `No instance found with name: ${instanceName}` },
      { status: 404 }
    );
  }
  try {
    stopMetricsMonitoring(alarmId);
    await deleteAlarmFromDynamoDB(instance.InstanceId, type, alarmId);
    return NextResponse.json({ message: "Alarm deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching alarms settings" },
      { status: 500 }
    );
  }
}

// Error fetching item, item not found ResourceNotFoundException: Requested resource not found
//     at <unknown> (ResourceNotFoundException: Requested resource not found)
//     at async fetchFromDynamoDB (src/utils/dynamoDBUtils.ts:58:21)
//     at async GET (src/app/api/instances/[name]/alarms/route.ts:40:21)
//   56 |       Key: partitionKey,
//   57 |     });
// > 58 |     const response = await docClient.send(command);
//      |                     ^
//   59 |     console.log("Item fetched successfully!");
//   60 |     return response;
//   61 |   } catch (err) { {
//   '$fault': 'client',
//   '$metadata': [Object],
//   __type: 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException'
// }
// Error: Failed to fetch data from DynamoDB
//     at fetchFromDynamoDB (src/utils/dynamoDBUtils.ts:63:10)
//     at async GET (src/app/api/instances/[name]/alarms/route.ts:40:21)
//   61 |   } catch (err) {
//   62 |     console.error("Error fetching item, item not found", err);
// > 63 |     throw new Error("Failed to fetch data from DynamoDB");
//      |          ^
//   64 |   }
//   65 | };
//   66 |
// GET /api/instances/peach-retail-crawdad/alarms?region=us-east-1 500 in 2569ms
// Error fetching item, item not found ResourceNotFoundException: Requested resource not found
//     at <unknown> (ResourceNotFoundException: Requested resource not found)
//     at async fetchFromDynamoDB (src/utils/dynamoDBUtils.ts:58:21)
//     at async GET (src/app/api/instances/[name]/alarms/route.ts:40:21)
//   56 |       Key: partitionKey,
//   57 |     });
// > 58 |     const response = await docClient.send(command);
//      |                     ^
//   59 |     console.log("Item fetched successfully!");
//   60 |     return response;
//   61 |   } catch (err) { {
//   '$fault': 'client',
//   '$metadata': [Object],
//   __type: 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException'
// }
// Error: Failed to fetch data from DynamoDB
//     at fetchFromDynamoDB (src/utils/dynamoDBUtils.ts:63:10)
//     at async GET (src/app/api/instances/[name]/alarms/route.ts:40:21)
//   61 |   } catch (err) {
//   62 |     console.error("Error fetching item, item not found", err);
// > 63 |     throw new Error("Failed to fetch data from DynamoDB");
//      |          ^
//   64 |   }
//   65 | };
//   66 |
//  GET /api/instances/peach-retail-crawdad/alarms?region=us-east-1 500 in 2721ms
