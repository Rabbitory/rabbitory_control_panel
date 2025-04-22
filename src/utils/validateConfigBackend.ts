export type ValidationFunction = (value: string | undefined) => string | null;

export function validateLogExchange(value: string | undefined): string | null {
  if (value !== "true") {
    return "Log Exchange must always be set to true.";
  }
  return null;
}

export function validateHeartbeat(value: string | undefined): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num <= 0)
  ) {
    return "Heartbeat must be a positive integer greater than 0 (in seconds).";
  }
  return null;
}

export function validateChannelMax(value: string | undefined): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num < 0)
  ) {
    return "Channel Max must be an integer greater than or equal to 0.";
  }
  return null;
}

export function validateConsumerTimeout(
  value: string | undefined
): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num < 60000)
  ) {
    return "Consumer Timeout must be an integer greater than or equal to 60000 (1 minute).";
  }
  return null;
}

export function validateDiskFreeLimit(
  value: string | undefined
): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || num < 50000)) {
    return "Disk Free Limit must be a number greater than or equal to 50000.";
  }
  return null;
}

export function validateVMHighWatermark(
  value: string | undefined
): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || num < 0.4 || num > 0.9)) {
    return "VM Memory High Watermark must be a number between 0.4 and 0.9.";
  }
  return null;
}

export function validateQueueIndexEmbedMsgsBelow(
  value: string | undefined
): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 10000)
  ) {
    return "Queue Index Embed Msgs Below must be an integer between 0 and 10000.";
  }
  return null;
}

export function validateLogExchangeLevel(
  value: string | undefined
): string | null {
  const allowed = ["debug", "info", "warn", "error", "critical", "none"];
  if (value === undefined || !allowed.includes(value.toLowerCase())) {
    return `Log Exchange Level must be one of: ${allowed.join(", ")}.`;
  }
  return null;
}

export function validateClusterPartitionHandling(
  value: string | undefined
): string | null {
  const allowed = ["autoheal", "pause_minority", "ignore"];
  if (!value || !allowed.includes(value.toLowerCase())) {
    return `Cluster Partition Handling must be either "autoheal" or "pause_minority".`;
  }
  return null;
}

export function validateMaxMessageSize(
  value: string | undefined
): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num <= 0 || num > 536870912)
  ) {
    return "Max Message Size must be a positive integer.";
  }
  return null;
}

export function validateMqttExchange(value: string | undefined): string | null {
  // For MQTT exchange, simply ensure a non-empty string is provided.
  if (!value || value.trim() === "") {
    return "MQTT Exchange must be a topic exchange name.";
  }
  return null;
}

export function validateConfiguration(config: Record<string, string>): {
  valid: boolean;
  errors: string[];
} {
  const validators: Record<string, ValidationFunction> = {
    "log.exchange": validateLogExchange,
    "log.exchange.level": validateLogExchangeLevel,
    heartbeat: validateHeartbeat,
    channel_max: validateChannelMax,
    consumer_timeout: validateConsumerTimeout,
    disk_free_limit: validateDiskFreeLimit,
    "vm_memory_high_watermark.relative": validateVMHighWatermark,
    queue_index_embed_msgs_below: validateQueueIndexEmbedMsgsBelow,
    cluster_partition_handling: validateClusterPartitionHandling,
    max_message_size: validateMaxMessageSize,
    "mqtt.exchange": validateMqttExchange,
  };

  const errors: string[] = [];

  for (const key in config) {
    const validate = validators[key];
    if (validate) {
      const value = config[key];
      const error = validate(value);
      if (error) {
        errors.push(`${key}: ${error}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
