"use client";

import Link from "next/link";
import axios from "axios";
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from "react";

interface Instance {
  state: string;
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
        <h1 className="font-heading1 text-2xl text-headertext1">Instances</h1>
        <Link href="/instances/newForm">
          <button 
            className="font-heading1 font-semibold py-2 px-6 bg-btn1
              text-mainpage1 rounded-sm hover:bg-btnhover1 transition-shadow duration-200
              text-md">
            + Create New Instance
          </button>
        </Link>
      </div>
  
      {instances.length === 0 ? (
        <p className="text-lg text-gray-600 mb-6">No instances yet.</p>
      ) : (
        <>
          <table className="table-fixed w-full text-sm font-text1 border-separate border-spacing-y-3">
            <thead>
              <tr className="text-headertext1 font-text1 text-md bg-background">
                <th className="text-left w-[12%] px-4 py-2">Name</th>
                <th className="text-left w-[12%] px-4 py-2">Instance ID</th>
                <th className="text-left w-[10%] px-4 py-2">Datacenter</th>
                <th className="text-left w-[10%] px-4 py-2">Status</th>
                <th className="w-[5%]"></th>
              </tr>
            </thead>
            <tbody>
              {instances.map((instance) => (
                <tr
                  key={instance.name}
                  className="bg-card border border-gray-500/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/instances/${instance.name}?region=${instance.region}`}
                      className="text-pagetext1 hover:text-btnhover1 truncate block"
                    >
                      {instance.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-pagetext1 truncate">{instance.id}</td>
                  <td className="px-4 py-3 text-pagetext1">{instance.region}</td>
                  <td className="px-4 py-3 text-pagetext1">{instance.state}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/instances/${instance.name}/edit/delete?region=${instance.region}`}
                      className="text-gray-400 hover:text-btnhover1 hover:shadow-btnhover1"
                      aria-label="Delete instance"
                    >
                      <Trash2 size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
  
}
