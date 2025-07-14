// app/(dashboard)/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/Navbar";
import Header from "./components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/authorize");
  }

  return (
    <div className="flex theme-bg-subtle p-4 gap-1 overflow-hidden">
    <div className="w-auto">
      <Sidebar session={session} />
      </div>
      <div
        className="w-full h-screen overflow-y-auto space-y-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >

        <Header session={session} />
        {children}
      </div>
    </div>
  );
}

