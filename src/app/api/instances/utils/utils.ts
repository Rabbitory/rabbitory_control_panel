import type { InstanceWithRegion, FormattedInstance } from "../types";
import listInstances from "./listInstances";

export function formattedInstances(
  instances: InstanceWithRegion[]
): Array<FormattedInstance | null> {
  return instances
    .map((instance) => {
      if (!instance || !instance.Tags) {
        console.error("Instance or tags not found");
        return null;
      }
      const name = instance.Tags.find((tag) => tag.Key === "Name")?.Value || "";
      return {
        name,
        id: instance.InstanceId,
        region: instance.region,
        state: instance.State?.Name,
      };
    })
    .filter(Boolean);
}

export async function isInstanceNameUnique(
  instanceName: string,
  region: string
): Promise<boolean> {
  const instances = await listInstances();
  return !instances.some(
    (instance) =>
      instance.Tags?.some(
        (tag) => tag.Key === "Name" && tag.Value === instanceName
      ) && instance.region === region
  );
}

export function validBody(
  instanceName: string,
  region: string,
  instanceType: string,
  username: string,
  password: string,
  storageSize: number
): boolean {
  return (
    /^[a-z0-9-_]{3,64}$/i.test(instanceName) &&
    region.length > 0 &&
    instanceType.length > 0 &&
    username.length >= 6 &&
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password) &&
    storageSize >= 8 &&
    storageSize <= 16000
  );
}
