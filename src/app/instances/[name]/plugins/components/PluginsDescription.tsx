export default function PluginsDescription() {
  return (
    <>
      <h1 className="font-heading1 text-2xl text-headertext1 mb-10">Plugins</h1>
      <p className="font-text1 text-sm text-pagetext1 mb-6">
        Below is a list of RabbitMQ plugins that you can enable or disable.
        Toggling a plugin will immediately update its status on this page and
        within your RabbitMQ instance. For more detailed information on RabbitMQ
        plugins and their management, refer to the{" "}
        <a
          href="https://www.rabbitmq.com/docs/plugins"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-pagetext1 hover:text-headertext1"
        >
          RabbitMQ Plugins Guide
        </a>
        .
      </p>
    </>
  )
}
