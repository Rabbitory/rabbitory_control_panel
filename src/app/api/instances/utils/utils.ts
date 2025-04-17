import type { InstanceWithRegion, FormattedInstance } from "../types";

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
