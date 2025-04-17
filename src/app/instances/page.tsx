"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNotificationsContext } from "../NotificationContext";
import SubmissionSpinner from "./components/SubmissionSpinner";
import CreateNewInstanceButton from "./components/CreateNewInstanceButton";
import InstancesTable from "./components/InstancesTable";
import { Instance } from "./types/Instance";

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

    addNotification({
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
      <CreateNewInstanceButton isGlowing={!isLoading && instances.length === 0} />
      <InstancesTable
        isLoading={isLoading}
        instances={instances}
        openDeleteModal={openDeleteModal}
      />

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
