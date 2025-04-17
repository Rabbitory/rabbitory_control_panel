import { Instance } from "./Instance";

export interface InstancesTableProps {
  isLoading: boolean;
  instances: Instance[];
  openDeleteModal: (instance: Instance) => void;
}

export interface InstanceRowProps {
  instance: Instance;
  openDeleteModal: (instance: Instance) => void;
}


