"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";

interface Instance {
  name: string;
  id: string;
  region: string;
}

export default function Home() {
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
          <button 
            className="font-heading py-2 px-6 bg-btn1
             text-mainpage1 rounded-sm hover:bg-btnhover1 
             focus:outline-none focus:ring-2 focus:ring-green-500 text-lg">
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
              className="flex justify-between items-center p-4 border-gray-700 bg-card hover:bg-icywhite text-icywhite hover:text-mainbg1"
            >
              <Link href={`/instances/${instance.name}?region=${instance.region}`}>
                {instance.name} | {instance.id} | {instance.region}
              </Link>
              <Link 
              href={`/instances/${instance.name}/edit/delete?region=${instance.region}`}
              className="font-text1 m-3 border border-btn1 rounded-sm p-1"

              >
                delete
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
