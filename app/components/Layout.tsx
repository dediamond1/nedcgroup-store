"use client";

import { useState } from "react";
import { Outlet } from "@remix-run/react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-1 ml-4 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 md:hidden"
          >
            <Menu size={24} />
          </button>
        </header>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
