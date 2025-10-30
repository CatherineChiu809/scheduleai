import type { Metadata } from "next";
import { Imperial_Script, Nunito_Sans } from "next/font/google";
import { TaskProvider } from "../context/TaskContext";
import "./globals.css";


// Fonts
const imperial_script = Imperial_Script({
  variable: "--font-imperial-script",
  subsets: ["latin"],
  weight: "400"
});

const nunito_sans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "AI Study Scheduler",
  description: "Smart study planner with task tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${imperial_script.variable} antialiased`}
      >
        <TaskProvider>
          {children}
        </TaskProvider>
      </body>
    </html>
  );
}