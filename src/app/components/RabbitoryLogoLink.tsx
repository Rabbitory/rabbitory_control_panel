'use client'

import Link from "next/link"
import Image from "next/image"
import rabbitoryLogo from '../../../public/rabbitory-logo.png'

export default function RabbitoryLogoLink() {
  return (
      <Link
      href="/"
      className="flex items-center gap-3 hover:cursor-pointer"
    >
      <Image 
        src={rabbitoryLogo}
        alt="Image of Rabbitory Logo"
        width={50}
        height={50}
      />
      <h1 className="font-heading1 font-semibold text-btn1 text-3xl hover:text-headertext2 transition-all duration-200">
        RABBITORY
      </h1>
    </Link>
  )
}