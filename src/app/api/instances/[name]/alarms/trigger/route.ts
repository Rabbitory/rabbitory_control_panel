import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import { sendNotification } from "@/utils/RabbitMQ/monitorMetrics";
import axios from "axios";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const { name: instanceName } = await params;
  const username = request.headers.get("x-rabbitmq-username");
  const password = request.headers.get("x-rabbitmq-password");

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 }
    );
  }

  if (!region || !instanceName) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  const ec2Client = new EC2Client({ region });

  const instance = await fetchInstance(instanceName, ec2Client);
  if (!instance || !instance.PublicDnsName) {
    return NextResponse.json(
      { message: `Instance is not found!` },
      { status: 404 }
    );
  }
  const publicDns = instance.PublicDnsName;

  //Theses are the information you can use to get started,
  // *** feel free to freestyle anything!

  //The alarms data is sent to this route as an object:
  const alarms = await request.json();
  console.log(alarms);
  // the data is in the format:
  // {    id: string; // probably need this to identify the alarm in cron job??
  //     data: {
  //          timeThreshold: number;
  //          storageThreshold: number;
  //          reminderInterval: number;
  //          }
  //   }
  //
  // alarm type is sent as searchParams
  const type = searchParams.get("type");
  if (!type) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  // Below is the url to get the rabbitmq nodes metrics
  //To send a axios request, you will need to have this url and
  // in the headers, you will need to add the username and password
  // as basic auth
  // to access the rabbitmq api
  const rabbitmqUrl = `http://${publicDns}:15672/api/nodes`;

  try {
    const response = await axios.get(rabbitmqUrl, {
      auth: {
        username,
        password,
      },
    });
    const nodes = response.data; //This returns an array, so for us, access the first element
    //The properties we need from this response are:
    //1. mem_used (used memory)
    //2. mem_limit (allocated memory, if it goes over this, rabbitmq will trigger its internal alarms,
    // this is not the same as the alarms we are setting in our app)
    //3. disk_free (available disk space)
    //4. disk_free_limit (minimum free disk before rabbitmq will trigger its internal alarms)

    //for us, we can mem_used/mem_limit or mem_limit - mem_used with the threshold we set (depending on if the threshold is in % or in gb)
    // and disk_free with the threshold we set

    // the whole polling from the rabbitmq api in a interval would be in the cron job
    // and when users trigger the alarms, we send a notification to slack with the alarms
    // settings. And probably only send more notifications if the stats exceed the threshold

    console.log("Nodes:", nodes);
    sendNotification({
      alarmId: alarms.id,
      type: type,
      currentValue: 0,
      threshold: alarms.data.storageThreshold,
      instanceDns: publicDns,
    });
    return NextResponse.json({ message: "Trigger successfully" });
  } catch (error) {
    console.error("Error trigger alarms:", error);
    return NextResponse.json(
      { message: "Error trigger alarms" },
      { status: 500 }
    );
  }
}
