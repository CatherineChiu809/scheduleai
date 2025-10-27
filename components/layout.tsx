"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#c6dbd5] p-6  flex flex-col items-center relative">
      {/*Navigation Buttons */}
      <div className="absolute top-6 right-6 flex gap-3">
        {pathname !== "/schedule" && (
          <Link href="/input">
            <button className="bg-[#CBC6DB] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#bbb4cf]">
              todo
            </button>
          </Link>
        )}
        {pathname !== "/" && (
          <Link href="/">
            <button className="bg-[#DBC6CC] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#cfb3bb]">
              schedule
            </button>
          </Link>
        )}
      </div>

      {/* Main Content */}
      <main className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 flex-grow mt-4">
        {children}
      </main>
    </div>
  );
}
