"use client";

import { useInstanceContext } from "../InstanceContext";
// import { useEffect, useState } from "react";
// import axios from "axios";
import { useRouter } from "next/navigation";

export default function AlarmsPage() {
  const { instance } = useInstanceContext();
  const router = useRouter();
  // const [isFetching, setIsFetching] = useState(false);
  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          router.push(
            `/instances/${instance?.name}/alarms/new?region=${instance?.region}`,
          );
        }}
      >
        Create Alarm
      </button>
    </>
  );
}
