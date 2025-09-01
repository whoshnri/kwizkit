
import Sidebar from "./components/Navbar";
import Header from "./components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex min-h-screen theme-bg-subtle p-1 gap-1">
        {/* Sidebar Navigation */}
        <aside className="w-fit h-full">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 space-y-1">
          <Header />
          <div
            className="flex-1 overflow-y-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {children}
          </div>
        </main>
      </div>
  );
}