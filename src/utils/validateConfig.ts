export interface ValidationResult {
  valid: boolean;
  errors: { [key: string]: string };
}

export function validateConfiguration(
  config: Record<string, string>
): ValidationResult {
  const errors: Record<string, string> = {};
  if (config["log.exchange"] !== undefined) {
    if (config["log.exchange"].trim() !== "true") {
      errors["log.exchange"] = "Log Exchange must always be 'true'.";
    }
  }

  if (config.heartbeat !== undefined) {
    const heartbeat = Number(config.heartbeat);
    if (isNaN(heartbeat) || !Number.isInteger(heartbeat) || heartbeat <= 0) {
      errors.heartbeat = "Heartbeat must be a positive integer (in seconds).";
    }
  }

  if (config.channel_max !== undefined) {
    const channelMax = Number(config.channel_max);
    if (isNaN(channelMax) || !Number.isInteger(channelMax) || channelMax < 0) {
      errors.channel_max =
        "Channel Max must be an integer greater than or equal to 0.";
    }
  }

  if (config.consumer_timeout !== undefined) {
    const consumerTimeout = Number(config.consumer_timeout);
    if (
      isNaN(consumerTimeout) ||
      !Number.isInteger(consumerTimeout) ||
      consumerTimeout < 0 ||
      consumerTimeout > 86400000
    ) {
      errors.consumer_timeout =
        "Consumer Timeout must be a non-negative integer (ms) up to 86400000 (24h).";
    }
  }

  if (config["vm_memory_high_watermark.relative"] !== undefined) {
    const watermark = Number(config["vm_memory_high_watermark.relative"]);
    if (isNaN(watermark) || watermark < 0.4 || watermark > 0.9) {
      errors["vm_memory_high_watermark.relative"] =
        "Memory High Watermark must be between 0.40 and 0.90.";
    }
  }

  if (config.queue_index_embed_msgs_below !== undefined) {
    const queueIndex = Number(config.queue_index_embed_msgs_below);
    if (isNaN(queueIndex) || !Number.isInteger(queueIndex) || queueIndex < 0) {
      errors.queue_index_embed_msgs_below =
        "Queue Index Embed Msgs Below must be a non-negative integer.";
    }
  }

  if (config.max_message_size !== undefined) {
    const maxMessageSize = Number(config.max_message_size);
    if (
      isNaN(maxMessageSize) ||
      !Number.isInteger(maxMessageSize) ||
      maxMessageSize < 0 ||
      maxMessageSize > 536870912
    ) {
      errors.max_message_size =
        "Max Message Size must be a non-negative integer and at most 536870912.";
    }
  }

  if (config["log.exchange.level"] !== undefined) {
    const validLevels = [
      "debug",
      "info",
      "warning",
      "error",
      "critical",
      "none",
    ];
    if (!validLevels.includes(config["log.exchange.level"])) {
      errors["log.exchange.level"] =
        "Log Exchange Level must be one of " + validLevels.join(", ") + ".";
    }
  }

  if (config.cluster_partition_handling !== undefined) {
    const validOptions = ["ignore", "pause_minority", "autoheal"];
    if (!validOptions.includes(config.cluster_partition_handling)) {
      errors.cluster_partition_handling =
        "Cluster Partition Handling must be one of " +
        validOptions.join(", ") +
        ".";
    }
  }
  if (config["mqtt.exchange"] !== undefined) {
    if (
      typeof config["mqtt.exchange"] !== "string" ||
      config["mqtt.exchange"].trim() === ""
    ) {
      errors["mqtt.exchange"] = "MQTT Exchange must be a non-empty string.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
