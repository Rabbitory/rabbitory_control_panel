"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "../components/Dropdown";

interface Instance {
  name: string;
  id: string;
  region: string;
}

export default function Home() {
  const router = useRouter();
  const [instances, setInstances] = useState<Instance[]>([]);

  useEffect(() => {
    const fetchInstances = async () => {
      const fetchedInstances = await axios.get("/api/instances");
      setInstances(fetchedInstances.data);
    };

    fetchInstances();
  }, []);

  return (
    <div className="mt-15 ml-30 mr-30">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading1 text-3xl text-pagetext1">Instances</h1>
        <Link href="/instances/newForm">
          <button className="font-heading py-2 px-6 bg-btn1 text-white rounded-md hover:bg-btnhover1 focus:outline-none focus:ring-2 focus:ring-green-500 text-xl">
            + Create New Instance
          </button>
        </Link>
      </div>

      {/* Check if there are instances */}
      {instances.length === 0 ? (
        <p className="text-lg text-gray-600 mb-6">No instances yet.</p>
      ) : (
        <ul className="font-text1 space-y-4">
          {instances.map((instance) => (
            <li
              key={instance.name}
              className="flex justify-between items-center p-4 border-gray-700 rounded-lg bg-white hover:bg-gray-100"
            >
              <Link
                href={`/instances/${instance.name}?region=${instance.region}`}
                className="text-pagetext1 hover:underline"
              >
                {instance.name} | {instance.id} | {instance.region}
              </Link>
              <Dropdown
                label="edit"
                options={{
                  delete: () =>
                    router.push(
                      `/instances/${instance.name}/edit/delete?region=${instance.region}`
                    ),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
