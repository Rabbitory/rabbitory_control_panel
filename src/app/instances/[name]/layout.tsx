import { ReactNode } from "react";
import { InstanceProvider } from "./InstanceContext";
import { InstanceContent } from "@/app/components/InstanceContent";

interface InstanceLayoutProps {
  children: ReactNode;
  params: Promise<{ name: string }>;
}

export default async function InstanceLayout({
  children,
  params,
}: InstanceLayoutProps) {
  const { name } = await params;

  return (
    <InstanceProvider>
      <InstanceContent name={name}>{children}</InstanceContent>
    </InstanceProvider>
  );
}
