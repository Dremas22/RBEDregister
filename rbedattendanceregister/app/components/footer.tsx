"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#4361ee] py-4 text-white italic">
      <div className="mx-auto text-center">
        <p>
          Powered by{" "}
          <Link
            href="https://dremas-solutions.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-200 transition-colors"
          >
            Dremas Solutions
          </Link>
        </p>
      </div>
    </footer>
  )
}