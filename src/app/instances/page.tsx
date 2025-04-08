"use client";

import Link from "next/link";
import axios from "axios";
import { Trash } from 'lucide-react';
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
    <div className="mt-15 ml-20 mr-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading1 text-2xl text-pagetext1">Instances</h1>
        <Link href="/instances/newForm">
          <button 
            className="font-heading py-2 px-6 bg-btn1
             text-mainpage1 rounded-sm hover:bg-btnhover1 transition-shadow duration-200
             text-md">
            + Create New Instance
          </button>
        </Link>
      </div>

      {instances.length === 0 ? (
        <p className="text-lg text-gray-600 mb-6">No instances yet.</p>
      ) : (
        <ul className="font-text1 space-y-4">
          {instances.map((instance) => (
            <li
              key={instance.name}
              className="flex justify-between items-center p-4 border-gray-700 bg-card"
            >
              <Link 
                href={`/instances/${instance.name}?region=${instance.region}`}
                className="text-sm text-gray-400 hover:text-btnhover1"   
              >
                {instance.name} | {instance.id} | {instance.region}
              </Link>
              <Link
                href={`/instances/${instance.name}/edit/delete?region=${instance.region}`}
                className="text-gray-400 hover:text-btnhover1 hover:shadow-btnhover1"
                aria-label="Delete instance"
              >
                <Trash size={20} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
