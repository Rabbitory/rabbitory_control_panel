export default function VersionsDescription() {
  return (
    <>
      <h1 className="font-heading1 text-headertext1 text-2xl mb-10">
        Versions
      </h1>
      <p className="text-pagetext1 text-sm mb-6">
        Currently, this interface does not support upgrading RabbitMQ versions.
        For detailed instructions on how to manually upgrade RabbitMQ, please
        refer to the official RabbitMQ upgrade guide:{" "}
        <a
          href="https://www.rabbitmq.com/upgrade.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-headertext1"
        >
          RabbitMQ Upgrade Guide
        </a>
        .
      </p>
    </>
  )
}
