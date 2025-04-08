"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavLayout from "@/app/components/NavLayout";
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
  const searchParams = useSearchParams();
  const region = searchParams.get("region");

  useEffect(() => {
    const fetchInstance = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get<Instance>(
          `/api/instances/${name}?region=${region}`,
        );
        setInstance(response.data);
      } catch (error) {
        console.error("Error fetching instance:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInstance();
  }, [name, setInstance, region]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-[200px_1fr] gap-10 items-start">
      <NavLayout name={name} />
      <section >
        {children}
      </section>
    </div>
  );
}
