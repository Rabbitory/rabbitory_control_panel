"use client";

import Link from "next/link";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Instance {
  state: string;
  name: string;
  id: string;
  region: string;
}

export default function Home() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstances = async () => {
      const fetchedInstances = await axios.get("/api/instances");
      setInstances(fetchedInstances.data);
      setIsLoading(false);
    };

    fetchInstances();
  }, []);

  return (
    <div className="mt-15 ml-20 mr-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading1 text-2xl text-headertext1">Instances</h1>
        <Link href="/instances/newForm">
  <button
    className={`
      font-heading1 font-semibold py-2 px-6 bg-btn1
      text-mainpage1 rounded-sm hover:bg-btnhover1 transition-all duration-200
      text-md
      hover:shadow-[0_0_8px_3px_rgba(135,217,218,0.5)] /* Softer glow */
      ${!isLoading && instances.length === 0 ? 'pulse-glow' : ''}
    `}
  >
    + Create New Instance
  </button>
</Link>



      </div>

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

        <tbody className={isLoading ? "" : "animate-fade-in"}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="bg-card border border-gray-500/30 animate-pulse">
                <td className="px-4 py-3">
                  <div className="w-full h-4 bg-gray-600 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-full h-4 bg-gray-600 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-full h-4 bg-gray-600 rounded"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-full h-4 bg-gray-600 rounded"></div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="w-5 h-4 bg-gray-600 rounded ml-auto"></div>
                </td>
              </tr>
            ))
          ) : (
            instances.map((instance) => (
              <tr key={instance.name} className="bg-card border border-gray-500/30">
                <td className="px-4 py-3 relative">
                  {instance.state === "pending" ? (
                    <span className="text-pagetext1 truncate block group cursor-not-allowed">
                      {instance.name}
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 p-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-nowrap">
                        Your instance is still initializing.
                      </div>
                    </span>
                  ) : (
                    <Link
                      href={`/instances/${instance.name}?region=${instance.region}`}
                      className="text-pagetext1 hover:text-btnhover1 truncate block"
                    >
                      {instance.name}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3 text-pagetext1 truncate">{instance.id}</td>
                <td className="px-4 py-3 text-pagetext1">{instance.region}</td>
                <td
                  className={`px-4 py-3 ${
                    instance.state === "running"
                      ? "text-btnhover1"
                      : instance.state === "pending" || instance.state === "initializing"
                      ? "text-btn1"
                      : instance.state === "stopped" || instance.state === "stopping"
                      ? "text-red-300"
                      : instance.state === "shutting-down"
                      ? "text-pagetext1 italic"
                      : ""
                  }`}
                >
                  {instance.state}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/instances/${instance.name}/edit/delete?region=${instance.region}`}
                    className="text-gray-400 hover:text-btnhover1 hover:shadow-btnhover1"
                    aria-label="Delete instance"
                  >
                    <Trash2 size={20} />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {!isLoading && instances.length === 0 && (
        <p className="font-text1 text-lg text-pagetext1 mt-10 text-center">
          No instances yet. Let’s spin one up!
        </p>
      )}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(135, 217, 218, 0);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 15px 3px rgba(135, 217, 218, 0.5);
          }
        }

        .pulse-glow {
          animation: pulse-glow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
    
  );
}


