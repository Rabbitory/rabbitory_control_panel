export type ValidationFunction = (value: string | undefined) => string | null;

export function validateLogExchange(value: string | undefined): string | null {
  if (value !== "true") {
    return "Log Exchange must always be set to true.";
  }
  return null;
}

export function validateHeartbeat(value: string | undefined): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || !Number.isInteger(num) || num <= 0)) {
    return "Heartbeat must be a positive integer greater than 0 (in seconds).";
  }
  return null;
}

export function validateChannelMax(value: string | undefined): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || !Number.isInteger(num) || num < 0)) {
    return "Channel Max must be an integer greater than or equal to 0.";
  }
  return null;
}

export function validateConnectionMax(value: string | undefined): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || !Number.isInteger(num) || num < 0)) {
    return "Connection Max must be an integer greater than or equal to 0.";
  }
  return null;
}

export function validateConsumerTimeout(value: string | undefined): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || !Number.isInteger(num) || num < 0)) {
    return "Consumer Timeout must be an integer greater than or equal to 0.";
  }
  return null;
}

export function validateFrameMax(value: string | undefined): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num < 4096 || num > 131072)
  ) {
    return "Frame Max must be an integer between 4096 and 131072.";
  }
  return null;
}

export function validatePrefetchCount(value: string | undefined): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num <= 0 || num > 1000)
  ) {
    return "Prefetch Count must be an integer between 1 and 1000.";
  }
  return null;
}

export function validateDiskFreeLimit(value: string | undefined): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || num < 50000)) {
    return "Disk Free Limit must be a number greater than or equal to 50000.";
  }
  return null;
}

export function validateVMHighWatermark(value: string | undefined): string | null {
  const num = Number(value);
  if (value !== undefined && (isNaN(num) || num < 0.1 || num > 0.9)) {
    return "VM Memory High Watermark must be a number between 0.1 and 0.9.";
  }
  return null;
}

export function validateQueueIndexEmbedMsgsBelow(value: string | undefined): string | null {
  const num = Number(value);
  if (
    value !== undefined &&
    (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 10000)
  ) {
    return "Queue Index Embed Msgs Below must be an integer between 0 and 10000.";
  }
  return null;
}

export function validateConfiguration(config: Record<string, string>): { valid: boolean; errors: string[] } {
  const validators: Record<string, ValidationFunction> = {
    "log.exchange": validateLogExchange,
    heartbeat: validateHeartbeat,
    channel_max: validateChannelMax,
    connection_max: validateConnectionMax,
    consumer_timeout: validateConsumerTimeout,
    frame_max: validateFrameMax,
    prefetch_count: validatePrefetchCount,
    disk_free_limit: validateDiskFreeLimit,
    vm_memory_high_watermark: validateVMHighWatermark,
    queue_index_embed_msgs_below: validateQueueIndexEmbedMsgsBelow,
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