"use client";

import Link from "next/link";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNotificationsContext } from "../NotificationContext";
import SubmissionSpinner from "../components/SubmissionSpinner";
import { StatusLegend } from "../components/statusLegend";

interface Instance {
  state: string;
  name: string;
  id: string;
  region: string;
}

export default function Home() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null
  );
  const [inputText, setInputText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    notifications,
    notificationsReady,
    addNotification,
    instanceCreating,
    instanceTerminated,
    instanceCreated,
    instanceDeleting,
  } = useNotificationsContext();
  const applyNotificationOverrides = useCallback(
    (instances: Instance[]): Instance[] => {
      return instances.map((instance) => {
        if (instanceCreating(instance.name)) {
          return { ...instance, state: "pending" };
        }
        if (instanceDeleting(instance.name)) {
          return { ...instance, state: "shutting-down" };
        }
        if (instanceTerminated(instance.name)) {
          return { ...instance, state: "terminated" };
        }
        if (instanceCreated(instance.name)) {
          return { ...instance, state: "running" };
        }

        return instance;
      });
    },
    [instanceTerminated, instanceCreated, instanceCreating, instanceDeleting]
  );

  useEffect(() => {
    if (!notificationsReady) return;
    const fetchInstances = async () => {
      setIsLoading(true);
      try {
        const fetchedInstances = await axios.get("/api/instances");
        const corrected = applyNotificationOverrides(fetchedInstances.data);

        setInstances(corrected);
      } catch (err) {
        console.error("Failed to fetch instances:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstances();
  }, [notificationsReady, applyNotificationOverrides]);

  useEffect(() => {
    setInstances((prev) => applyNotificationOverrides(prev));
  }, [notifications, applyNotificationOverrides]);

  const openDeleteModal = (instance: Instance) => {
    setSelectedInstance(instance);
    setInputText("");
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSelectedInstance(null);
    setInputText("");
  };

  const handleDelete = async () => {
    if (!selectedInstance) return;

    await addNotification({
      type: "deleteInstance",
      status: "pending",
      instanceName: selectedInstance.name,
      path: "instances",
      message: `Deleting ${selectedInstance.name}`,
    });
    setIsDeleting(true);
    setInstances((prev) =>
      prev.map((instance) =>
        instance.name === selectedInstance.name
          ? { ...instance, state: "shutting-down" }
          : instance
      )
    );
    closeDeleteModal();

    try {
      await axios.post(
        `/api/instances/${selectedInstance.name}/delete?region=${selectedInstance.region}`
      );
    } catch (err) {
      console.error("Error deleting instance:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-15 ml-20 mr-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading1 text-2xl text-headertext1">Instances</h1>
        <Link href="/instances/new">
          <button
            className={`
              font-heading1 font-semibold py-2 px-6 bg-btn1
              text-mainpage1 rounded-sm hover:bg-btnhover1 transition-all duration-200
              text-md
              hover:shadow-[0_0_8px_3px_rgba(135,217,218,0.5)]
              ${!isLoading && instances.length === 0 ? "pulse-glow" : ""}
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
            <th className="text-left w-[10%] px-4 py-2">Data Center</th>
            <th className="text-left w-[10%] px-4 py-2">
              Status <StatusLegend />
            </th>
            <th className="w-[5%]"></th>
          </tr>
        </thead>

        <tbody className={isLoading ? "" : "animate-fade-in"}>
          {isLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <tr
                  key={idx}
                  className="bg-card border border-gray-500/30 animate-pulse"
                >
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
            : instances.map((instance) => (
                <tr
                  key={instance.name}
                  className="bg-card border border-gray-500/30"
                >
                  <td className="px-4 py-3 relative">
                    {instance.state === "pending" ||
                    instance.state === "shutting-down" ||
                    instance.state === "terminated" ? (
                      <span className="text-pagetext1 truncate block group cursor-not-allowed">
                        {instance.name}
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
                  <td className="px-4 py-3 text-pagetext1 truncate">
                    {instance.id}
                  </td>
                  <td className="px-4 py-3 text-pagetext1">
                    {instance.region}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      instance.state === "running"
                        ? "text-btnhover1"
                        : instance.state === "pending" ||
                          instance.state === "initializing"
                        ? "text-btn1 italic"
                        : instance.state === "stopped" ||
                          instance.state === "stopping"
                        ? "text-red-300"
                        : instance.state === "shutting-down" ||
                          instance.state === "terminated"
                        ? "text-pagetext1 italic"
                        : ""
                    }`}
                  >
                    {instance.state}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openDeleteModal(instance)}
                      className={`
                  text-gray-400 
                  ${
                    instance.state === "pending" ||
                    instance.state === "shutting-down" ||
                    instance.state === "terminated"
                      ? "cursor-not-allowed"
                      : "hover:text-btnhover1 hover:shadow-btnhover1"
                  }
                `}
                      aria-label="Delete instance"
                      disabled={
                        instance.state === "pending" ||
                        instance.state === "shutting-down" ||
                        instance.state === "terminated"
                      }
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      {!isLoading && instances.length === 0 && (
        <p className="font-text1 text-lg text-pagetext1 mt-10 text-center">
          No instances yet. Let’s spin one up!
        </p>
      )}

      {showModal && selectedInstance && (
        <div className="fixed inset-0 backdrop-blur-xs bg-white/5 flex justify-center items-center z-50">
          <div className="bg-card text-pagetext1 p-6 rounded-md shadow-lg w-full max-w-md">
            <h2 className="font-heading1 text-xl text-headertext1 mb-4">
              Delete {selectedInstance.name}?
            </h2>
            <p className="font-text1 text-sm text-red-300 mb-6">
              Deleting this instance is permanent and will result in the loss of
              all data stored on it. This action cannot be undone.
            </p>
            <p className="font-text1 text-sm mb-2">
              Type <strong>{selectedInstance.name}</strong> to confirm deletion.
            </p>
            <input
              className="w-full p-2 border rounded-sm font-text1 text-btnhover1 border-pagetext1 focus:outline-none"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="flex justify-end mt-6 gap-4">
              <button
                className="px-4 py-2 bg-card border border-btn1 text-btn1 rounded-sm hover:shadow-[0_0_8px_#87d9da]"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-btn1 text-mainbg1 font-semibold rounded-sm hover:bg-btnhover1 hover:shadow-[0_0_10px_#87d9da]"
                onClick={handleDelete}
                disabled={inputText !== selectedInstance.name || isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <SubmissionSpinner />
                    Deleting ...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
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
