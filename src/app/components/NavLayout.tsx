import Link from "next/link";
// import styles from "./NavLayout.module.css"; // Optional CSS module
import { useInstanceContext } from "../instances/[name]/InstanceContext";

interface NavLayoutProps {
  name: string;
}

export default function NavLayout({ name }: NavLayoutProps) {
  const { instance } = useInstanceContext();

  return (
    <nav className="w-70 bg-gray-200 p-4 min-h-screen pl-10 pr-10">
      <h1 className="text-xl font-semibold mt-8 mb-8 hover:text-gray-700">
        <Link href={`/instances/${name}?region=${instance?.region}`}>
          Overview
        </Link>
      </h1>
      <ul>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/plugins?region=${instance?.region}`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Plugins
          </Link>
        </li>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/versions?region=${instance?.region}`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Versions
          </Link>
        </li>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/configuration?region=${instance?.region}`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Configuration
          </Link>
        </li>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/hardware?region=${instance?.region}`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Hardware
          </Link>
        </li>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/logs?region=${instance?.region}`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Logs
          </Link>
        </li>
        <li className="mb-4">
          <button
            className="py-2 px-6 bg-orange-500 text-white rounded-md hover:bg-orange-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={(e) => {
              e.preventDefault();
              window.open(`http://${instance?.publicDns}:15672`);
            }}
          >
            To RabbitMQ Manager
          </button>
        </li>
      </ul>
    </nav>
  );
}
