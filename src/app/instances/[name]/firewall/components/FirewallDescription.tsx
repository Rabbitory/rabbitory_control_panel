export default function FirewallDescription() {
  return (
    <>
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        Firewall Settings
      </h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        Configuring firewall rules allows you to manage access to both your AWS
        EC2 instance and the RabbitMQ server. Adjusting these settings updates
        AWS security groups and configures the necessary plugins and ports on
        the RabbitMQ server.
      </p>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        The Common Ports section offers a list of protocols that can be enabled
        with a click, while the Custom Ports section allows specifying
        additional ports as a comma-separated list. Please note that only IPv4
        is supported for the Source IP at this time.
      </p>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        For more details on supported protocols, refer to the{" "}
        <a
          href="https://www.rabbitmq.com/docs/protocols"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pagetext1 hover:text-headertext1"
        >
          RabbitMQ Supported Protocols
        </a>
        .
      </p>
    </>
  )
}
