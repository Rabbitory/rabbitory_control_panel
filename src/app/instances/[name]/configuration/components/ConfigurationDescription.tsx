export default function ConfigurationDescription() {
  return (
    <>
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        Configuration
      </h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        Below are the RabbitMQ server configurations. For detailed explanations
        of each setting, refer to the{" "}
        <a
          href="https://www.rabbitmq.com/docs/configure"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pagetext1 hover:text-headertext1"
        >
          RabbitMQ Configuration Guide
        </a>
        .
      </p>
    </>
  )
}
