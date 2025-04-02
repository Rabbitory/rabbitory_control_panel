import { EC2Client } from "@aws-sdk/client-ec2";
import { NextRequest, NextResponse } from "next/server";
import { fetchInstance } from "@/utils/AWS/EC2/fetchInstance";
import axios from "axios";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get("region");
  const id = searchParams.get("id");
  const { name: instanceName } = await params;

  if (!region || !id || !instanceName) {
    return NextResponse.json(
      { message: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    // I HAVE NO IDEA HOW TO DO THIS! GOOD LUCK JACQUELINE!!
    // I have passed the id of the alarm to be resolved and the type is not needed
    // i think?
    // and i assume we dont need to call rabbitmq instance for this
    // so i did not include the username and password
    // maybe all we need is id?
    //Feel free to add stuff
    console.log("Alarm ID to resolve:", id);
    return NextResponse.json({ message: "Alarm resolved" });
  } catch (error) {
    console.error("Error fetching alarms:", error);
    return NextResponse.json(
      { message: "Error fetching alarms", error: String(error) },
      { status: 500 }
    );
  }
}
