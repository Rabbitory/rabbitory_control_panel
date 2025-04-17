import Link from "next/link";

export default function CreateNewInstanceButton({ isGlowing }: { isGlowing: boolean }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="font-heading1 text-2xl text-headertext1">Instances</h1>
      <Link href="/instances/new">
        <button
          className={`
              font-heading1 font-semibold py-2 px-6 bg-btn1
              text-mainpage1 rounded-sm hover:bg-btnhover1 transition-all duration-200
              text-md
              hover:shadow-[0_0_8px_3px_rgba(135,217,218,0.5)]
              ${isGlowing ? "pulse-glow" : ""}
            `}
        >
          + Create New Instance
        </button>
      </Link>
    </div>
  )
}
