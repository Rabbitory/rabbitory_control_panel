import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useInstanceContext } from "../instances/[name]/InstanceContext";
import { useNotificationsContext } from "../NotificationContext";

interface PageLinkProps {
  pageName: string;
  disabledOn: string;
}

interface NavLayoutProps {
  name: string;
}

export default function NavLayout({ name }: NavLayoutProps) {
  const { instance } = useInstanceContext();
  const { linkPending } = useNotificationsContext();

  function PageLink({ pageName, disabledOn }: PageLinkProps) {
    const isDisabled = linkPending(disabledOn);
    const content =
      pageName.charAt(0).toUpperCase() + pageName.toLowerCase().slice(1);

    const linkClasses =
      "block w-full px-10 py-2 font-text1 text-lg text-navbartext1 hover:bg-mainbghover hover:text-headertext1 transition-colors" +
      (isDisabled
        ? "cursor-not-allowed opacity-50"
        : "hover:bg-mainbghover hover:text-headertext1");

    return (
      <li className="mb-2">
        {isDisabled ? (
          <span className={linkClasses}>{content}</span>
        ) : (
          <Link
            href={`/instances/${name}/${pageName}?region=${instance?.region}`}
            className={linkClasses}
          >
            {content}
          </Link>
        )}
      </li>
    );
  }

  return (
    <nav className="w-50 bg-mainbg1 min-h-screen h-full border-r-[0.5] border-border1">
      <button
        className="flex m-6 bg-btn1 text-mainbg1 text-sm font-heading1 font-semibold rounded-lg hover:bg-btnhover1"
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
          className="block w-full px-10 py-2 font-text1 text-xl font-semibold text-headertext1 hover:bg-mainbghover transition-colors"
        >
          General
        </Link>
      </h1>
      <ul className="mt-8">
        <PageLink pageName="plugins" disabledOn="any" />
        <PageLink pageName="versions" disabledOn="any" />
        <PageLink pageName="configuration" disabledOn="any" />
        <PageLink pageName="hardware" disabledOn="any" />
        <PageLink pageName="definitions" disabledOn="any" />
        <PageLink pageName="logs" disabledOn="any" />
        <PageLink pageName="firewall" disabledOn="any" />
      </ul>
    </nav>
  );
}
