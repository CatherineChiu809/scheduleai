"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const basePath = pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : "/";
  return (
    <div className="min-h-screen bg-[#c6dbd5] flex flex-col items-center font-sans relative">
      {/* header bar */}
      <header className="w-full bg-[#7aaa9d] shadow-sm py-4 px-6 flex flex-col items-center relative">
        {/* nav buttons*/}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-3">
          {pathname !== "/script" && (
            <Link href="/script">
              <button className="bg-[#CED3BA] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#c6ccaf]">
                info
              </button>
            </Link>
          )}
          {basePath !== "/schedule" && (
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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Synapse
          </h1>
          <p className="text-gray-600 font-medium mt-1">
            Organizing Student Success
          </p>
        </div>
      </header>
      <div className="flex justify-center w-full px-4 mt-8">
        <div className="w-full max-w-md">
          <main className="w-full flex flex-col items-center flex-grow p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
