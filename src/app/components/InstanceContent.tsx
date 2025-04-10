// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import NavLayout from "@/app/components/NavLayout";
// import { useInstanceContext } from "../instances/[name]/InstanceContext";
// import axios from "axios";
// import { Instance } from "@/types/instance";

// export function InstanceContent({
//   children,
//   name,
// }: {
//   children: React.ReactNode;
//   name: string;
// }) {
//   const { setInstance } = useInstanceContext();
//   const [isFetching, setIsFetching] = useState(true);
//   const searchParams = useSearchParams();
//   const region = searchParams.get("region");

//   useEffect(() => {
//     const fetchInstance = async () => {
//       setIsFetching(true);
//       try {
//         const response = await axios.get<Instance>(
//           `/api/instances/${name}?region=${region}`,
//         );
//         setInstance(response.data);
//       } catch (error) {
//         console.error("Error fetching instance:", error);
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchInstance();
//   }, [name, setInstance, region]);

//   if (isFetching) {
//     return <div>Loading...</div>;
//   }

// return (
//   <div className="h-screen flex overflow-hidden">
//     {/* Sticky sidebar */}
//     <div className="w-[200px] sticky top-0 h-full bg-mainbg1 border-r-[0.5px] border-border1">
//       <NavLayout name={name} />
//     </div>

//     {/* Main content (this will scroll) */}
//     <div className="flex-1 overflow-y-auto">
//       <section className="p-4">
//         {children}
//       </section>
//     </div>
//   </div>
// );

// }

"use client";  // Ensure this component runs on the client side

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavLayout from "@/app/components/NavLayout";
import { useInstanceContext } from "../instances/[name]/InstanceContext"; // Client-side context hook
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
    <div className="h-screen flex overflow-hidden">
      {/* Sticky sidebar (Nav) */}
      <div className="w-[200px] sticky top-0 h-full bg-mainbg1 border-r-[0.5px] border-border1 z-10">
        <NavLayout name={name} />
      </div>

      {/* Main content (scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <section className="p-4 h-full">
          {children}
        </section>
      </div>
    </div>
  );
}
