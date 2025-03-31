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
    <div className="p-6">
      {/* Heading and button on the same line */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-semibold text-gray-900">Instances</h1>
        <Link href="/instances/newForm">
          <button className="py-2 px-6 bg-green-400 text-white rounded-md hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500">
            Create New Instance
          </button>
        </Link>
      </div>

      {/* Check if there are instances */}
      {instances.length === 0 ? (
        <p className="text-lg text-gray-600 mb-6">No instances yet.</p>
      ) : (
        <ul className="space-y-4">
          {instances.map((instance) => (
            <li
              key={instance.name}
              className="flex justify-between items-center p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50"
            >
              <Link
                href={`/instances/${instance.name}?region=${instance.region}`}
                className="text-xl text-blue-600 hover:underline"
              >
                {instance.name} | {instance.id} | {instance.region}
              </Link>
              <Dropdown
                label="edit"
                options={{
                  delete: () =>
                    router.push(`/instances/${instance.name}/edit/delete`),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
