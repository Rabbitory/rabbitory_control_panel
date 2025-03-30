interface ConfigItem {
  key: string;
  description: string;
  type: "text" | "number" | "dropdown";
  options?: string[];
  readOnly?: boolean;
}

export const configItems: ConfigItem[] = [
  {
    key: "log.exchange",
    description: "Enable log exchange. (Uneditable)",
    type: "text",
    readOnly: true,
  },
  {
    key: "heartbeat",
    description:
      "Set the server AMQP 0-9-1 heartbeat timeout in seconds. (Only affects new connections)",
    type: "number",
  },
  {
    key: "channel_max",
    description:
      'Set the maximum permissible number of channels per connection (0 means "no limit").',
    type: "number",
  },
  {
    key: "consumer_timeout",
    description:
      "Set the consumer timeout in milliseconds. A consumer that does not acknowledge within this time will be cancelled.",
    type: "number",
  },
  {
    key: "vm_memory_high_watermark.relative",
    description:
      "Set the memory-based flow-control watermark as a fraction of total memory (Allowed values: 0.40 - 0.90).",
    type: "number",
  },
  {
    key: "queue_index_embed_msgs_below",
    description:
      "Size in bytes below which messages are embedded in the queue index. (0 disables payload embedding)",
    type: "number",
  },
  {
    key: "max_message_size",
    description:
      "The largest allowed message payload size in bytes. Messages larger than this are rejected.",
    type: "number",
  },
  {
    key: "log.exchange.level",
    description:
      "Log level for the logger used for log integrations (does not affect file logger).",
    type: "dropdown",
    options: ["debug", "info", "warning", "error", "critical", "none"],
  },
  {
    key: "mqtt.exchange",
    description:
      "The exchange that messages from MQTT clients are published to (expected to be a topic exchange).",
    type: "text",
  },
  {
    key: "cluster_partition_handling",
    description:
      "Set how the cluster should handle network partitions. Recommended: 'autoheal' for clusters with 1-2 nodes, 'pause_minority' for clusters with 3 or more nodes.",
    type: "dropdown",
    options: ["ignore", "pause_minority", "autoheal"],
  },
];
