"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNotificationsContext } from "../NotificationContext";
import DeleteInstanceModal from "./components/DeleteInstanceModal";
import CreateNewInstanceButton from "./components/CreateNewInstanceButton";
import InstancesTable from "./components/InstancesTable";
import { Instance } from "@/types/instance";

export default function Home() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null
  );
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
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSelectedInstance(null);
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
        <DeleteInstanceModal selectedInstance={selectedInstance} onClose={closeDeleteModal} handleDelete={handleDelete} isDeleting={isDeleting} />
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
