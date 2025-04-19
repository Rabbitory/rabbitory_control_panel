export default function BackupsDescription() {
  return (
    <>
      <h1 className="font-heading1 text-headertext1 text-2xl mb-6">Backups</h1>
      <p className="font-text1 text-sm mb-4">
        A “definition” in RabbitMQ is a snapshot of your server’s configuration
        — including exchanges, queues, users, and permissions. We refer to these
        as “backups”. See{" "}
        <a
          href="https://www.rabbitmq.com/docs/definitions"
          className="underline hover:text-headertext1"
          target="_blank"
          rel="noopener noreferrer"
        >
          RabbitMQ documentation
        </a>{" "}
        for more details.
      </p>
      <p className="font-text1 text-sm mb-10">
        Below, you can manually create and download backups for safekeeping or
        migration. All backups are also securely stored in the cloud, so they’ll
        be available anytime you return to this page.
      </p>
    </>
  )
}
