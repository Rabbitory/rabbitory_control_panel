export default interface Backup {
  timestamp: string;
  rabbitmq_version: string;
  trigger: string;
  definitions: Record<string, unknown>;
}

