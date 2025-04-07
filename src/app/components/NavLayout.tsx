import Link from "next/link";
import { useInstanceContext } from "../instances/[name]/InstanceContext";

interface NavLayoutProps {
  name: string;
}

export default function NavLayout({ name }: NavLayoutProps) {
  const { instance } = useInstanceContext();

  return (
    <nav className="w-60 bg-navbar1 p-4 min-h-screen pl-10 pr-10 h-full">
      <button
        className="text py-2 px-6 bg-gray-500 text-white rounded-sm hover:bg-btnhover1 focus:outline-none focus:ring-2 focus:ring-green-500"
        onClick={(e) => {
          e.preventDefault();
          window.open(`http://${instance?.publicDns}:15672`);
        }}
      >
        To RabbitMQ Manager
      </button>
      <h1 className="font-text1 text-xl font-semibold mt-8 mb-8 text-navbartext1 hover:text-header1">
        <Link href={`/instances/${name}?region=${instance?.region}`}>
          Overview
        </Link>
      </h1>
      <ul >
        <li className="mb-6">
          <Link
            href={`/instances/${name}/plugins?region=${instance?.region}`}
            className="font-text1 text-lg text-navbartext1 hover:text-header1"
          >
            Plugins
          </Link>
        </li>
        <li className="mb-6">
          <Link
            href={`/instances/${name}/versions?region=${instance?.region}`}
            className="font-text1 text-lg text-navbartext1 hover:text-header1"
          >
            Versions
          </Link>
        </li>
        <li className="mb-6">
          <Link
            href={`/instances/${name}/configuration?region=${instance?.region}`}
            className="font-text1 text-lg text-navbartext1 hover:text-header1"
          >
            Configuration
          </Link>
        </li>
        <li className="mb-6">
          <Link
            href={`/instances/${name}/hardware?region=${instance?.region}`}
            className="font-text1 text-lg text-navbartext1 hover:text-header1"
          >
            Hardware
          </Link>
        </li>
        <li className="mb-6">
          <Link
            href={`/instances/${name}/definitions?region=${instance?.region}`}
            className="font-text1 text-lg text-navbartext1 hover:text-header1"
          >
            Definitions
          </Link>
        </li>
        <li className="mb-6">
          <Link
            href={`/instances/${name}/logs?region=${instance?.region}`}
            className="font-text1 text-lg text-navbartext1 hover:text-header1"
          >
            Logs
          </Link>
        </li>
        <li className="mb-6">
          <Link 
            href={`/instances/${name}/firewall?region=${instance?.region}`} 
            className="font-text1 text-lg text-navbartext1 hover:text-header1">
            Firewall
          </Link>
        </li>

      </ul>
    </nav>
  );
}
