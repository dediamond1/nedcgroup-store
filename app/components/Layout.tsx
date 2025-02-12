"use client";

import { useState, useEffect } from "react";
import { Outlet } from "@remix-run/react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Layout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={toggleSidebar}
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 md:hidden"
          >
            <Menu size={24} />
          </button>
        </header>
        <main
          className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
            isMobile ? "" : isSidebarOpen ? "md:ml-60" : "md:ml-18"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
