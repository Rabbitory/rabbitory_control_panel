"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavLayout from "@/app/components/NavLayout";
import { useInstanceContext } from "../instances/[name]/InstanceContext";
import axios from "axios";
import { Instance } from "@/types/instance";

export default function PageSkeleton() {
  return (
    <div className="flex">
      {/* Sidebar Skeleton */}
      <div className="w-[200px] h-[calc(100vh-88px)] sticky top-[88px] bg-mainbg1 border-r-[0.5px] border-border1 p-4 space-y-4">
          <div className="h-150 bg-gray-600 rounded-md animate-pulse"
          />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 h-[calc(100vh-88px)] overflow-y-auto">
        <section className="p-4 mb-15">
          <div className="h-142 text-pagetext1 flex-1 max-w-7xl mx-auto p-6 bg-card rounded-sm shadow-md mt-8 space-y-4">
            <div className="h-8 bg-gray-600 rounded-md w-1/3 animate-pulse mb-15" />

            <div className="h-5 bg-gray-600 rounded-md w-1/3 animate-pulse mb-4" />
            <div className="h-20 bg-gray-600 rounded-md w-full animate-pulse mb-10" />

            <div className="h-5 bg-gray-600 rounded-md w-1/3 animate-pulse mb-4" />
            <div className="h-20 bg-gray-600 rounded-md w-full animate-pulse" />

          </div>
        </section>
      </div>
    </div>
  )
}

export function InstanceContent({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const { setInstance } = useInstanceContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const region = searchParams.get("region");

  useEffect(() => {
    const fetchInstance = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Instance>(
          `/api/instances/${name}?region=${region}`,
        );
        setInstance(response.data);
      } catch (error) {
        console.error("Error fetching instance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstance();
  }, [name, setInstance, region]);

  return isLoading ? (
    <PageSkeleton />
  ) : (
    <div className="flex">
      {/* Sidebar Nav */}
      <div className="w-[200px] h-[calc(100vh-88px)] sticky top-[88px] bg-mainbg1 border-r-[0.5px] border-border1">
        <NavLayout name={name} />
      </div>
  
      {/* Scrollable Main Content */}
      <div className="flex-1 h-[calc(100vh-88px)] overflow-y-auto">
        <section className="p-4 mb-15">{children}</section>
      </div>
    </div>
  );
  
  
}
