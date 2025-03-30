import Link from "next/link";
// import styles from "./NavLayout.module.css"; // Optional CSS module

interface NavLayoutProps {
  name: string;
}

export default function NavLayout({ name }: NavLayoutProps) {
  return (
    <nav className="w-70 bg-gray-200 p-4 min-h-screen pl-10 pr-10">
      <h1 className="text-xl font-semibold mt-8 mb-8 hover:text-gray-700">
        <Link href={`/instances/${name}`}>Overview</Link>
      </h1>
      <ul>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/plugins`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Plugins
          </Link>
        </li>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/versions`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Versions
          </Link>
        </li>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/configuration`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Configuration
          </Link>
        </li>
        <li className="mb-4">
          <Link
            href={`/instances/${name}/hardware`}
            className="text-gray-700 text-xl hover:text-black"
          >
            Hardware
          </Link>
        </li>
        <li className="mb-4">
          <Link href={`/instances/${name}/firewall`} className="text-gray-700 text-xl hover:text-black">
            Firewall
          </Link>
        </li>
      </ul>
    </nav>
  );
}
