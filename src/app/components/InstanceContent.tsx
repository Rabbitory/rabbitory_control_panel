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
    <div className="flex">
      {/* Sidebar Nav */}
      <div className="w-[200px] h-[calc(100vh-88px)] sticky top-[88px] bg-mainbg1 border-r-[0.5px] border-border1">
        <NavLayout name={name} />
      </div>
  
      {/* Scrollable Main Content */}
      <div className="flex-1 h-[calc(100vh-88px)] overflow-y-auto">
        <section className="p-4 mb-15">
          {children}
        </section>
      </div>
    </div>
  );
  
}
