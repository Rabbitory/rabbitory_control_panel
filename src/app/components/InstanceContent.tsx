"use client";

import { useEffect, useState } from "react";
import NavLayout from "@/app/components/NavLayout";
import styles from "../instances/[name]/InstanceLayout.module.css";
import { useInstanceContext } from "../instances/[name]/InstanceContext";
import axios from "axios";
import { Instance } from "@/types/instance";

export function InstanceContent({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const { setInstance } = useInstanceContext();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchInstance = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get<Instance>(`/api/instances/${name}`);
        setInstance(response.data);
      } catch (error) {
        console.error("Error fetching instance:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInstance();
  }, [name, setInstance]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <NavLayout name={name} />
      <section className="flex-1 max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
        {children}
      </section>
    </div>
  );
}
