import Link from "next/link";
import { ExternalLink } from 'lucide-react';
import { useInstanceContext } from "../instances/[name]/InstanceContext";

interface NavLayoutProps {
  name: string;
}

export default function NavLayout({ name }: NavLayoutProps) {
  const { instance } = useInstanceContext();

  return (
    <nav className="w-full sticky top-0 h-full bg-mainbg1 border-r-[0.5px] z-10">

      <button
        className="m-6 bg-btn1 text-sm font-heading1 px-4 py-2 hover:bg-btnhover1 text-mainbg1 font-semibold rounded-sm flex items-center justify-center hover:shadow-[0_0_10px_#87d9da] transition-all duration-200"
        onClick={(e) => {
          e.preventDefault();
          window.open(`http://${instance?.publicDns}:15672`);
        }}
      >
        <p className="p-2 pr-1">RabbitMQ Manager</p>
        <ExternalLink size={25} className="m-1" />
      </button>
      <h1>
        <Link
          href={`/instances/${name}?region=${instance?.region}`}
          className="block w-full px-10 py-2 text-xl font-heading1 text-headertext1 hover:bg-mainbghover transition-colors"
        >
          General
        </Link>
      </h1>
      <ul className="mt-8 text-sm space-y-2">

        {/* RabbitMQ Section */}
        <li className="px-10 text-headertext1 tracking-wide">RabbitMQ</li>
        <li>
          <Link
            href={`/instances/${name}/versions?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Versions
          </Link>
        </li>
        <li>
          <Link
            href={`/instances/${name}/configuration?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Configuration
          </Link>
        </li>
        <li>
          <Link
            href={`/instances/${name}/plugins?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Plugins
          </Link>
        </li>

        {/* EC2 Instance Section */}
        <li className="px-10 mt-4 text-headertext1 tracking-wide">Server Instance</li>
        <li>
          <Link
            href={`/instances/${name}/hardware?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Hardware
          </Link>
        </li>
        <li>
          <Link
            href={`/instances/${name}/backups?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Backups
          </Link>
        </li>
        <li>
          <Link
            href={`/instances/${name}/firewall?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Firewall
          </Link>
        </li>

        {/* Monitoring Section */}
        <li className="px-10 mt-4 text-headertext1 tracking-wide">Monitoring</li>
        <li>
          <Link
            href={`/instances/${name}/logs?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Logs
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href={`/instances/${name}/alarms?region=${instance?.region}`}
            className="block w-full px-14 py-2 font-text1 text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors"
          >
            Alarms
          </Link>
        </li>
      </ul>
    </nav>
  );
}
