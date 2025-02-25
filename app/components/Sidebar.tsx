"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate, Form } from "@remix-run/react";
import {
  Building2,
  Package,
  Upload,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navLinks: NavLink[] = [
  { to: "/companies", label: "Företagar", icon: <Building2 size={25} /> },
  { to: "/lager", label: "Lager", icon: <Package size={25} /> },
  { to: "/ladda-upp", label: "Ladda upp", icon: <Upload size={25} /> },
  { to: "/the-rest", label: "Övriga", icon: <FileText size={25} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onToggle();
      }
    },
    [isOpen, onToggle]
  );

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [checkMobile, handleClickOutside]);

  const sidebarClasses = cn(
    "fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
    "z-[9999]", // Highest z-index
    isMobile
      ? isOpen
        ? "w-64 translate-x-0"
        : "w-64 -translate-x-full"
      : isOpen
      ? "w-64"
      : "w-20"
  );

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={onToggle}
        ></div>
      )}
      <aside className={sidebarClasses} ref={sidebarRef}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {(isOpen || isMobile) && (
              <span className="text-xl font-semibold text-gray-800">
                Nedcgroup
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
          <nav className="flex-1 overflow-y-auto py-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center px-4 py-4 my-4 text-sm transition-colors duration-200",
                  location.pathname === link.to
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className={cn(isOpen || isMobile ? "mr-3" : "mx-auto")}>
                  {link.icon}
                </span>
                {(isOpen || isMobile) && <span>{link.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/settings")}
            >
              <Settings
                size={20}
                className={cn(isOpen || isMobile ? "mr-3" : "mx-auto")}
              />
              {(isOpen || isMobile) && <span>Inställningar</span>}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100 mt-2"
              onClick={() => navigate("/support")}
            >
              <HelpCircle
                size={20}
                className={cn(isOpen || isMobile ? "mr-3" : "mx-auto")}
              />
              {(isOpen || isMobile) && <span>Hjälp & Support</span>}
            </Button>
            <Form method="post" action="/logout">
              <Button
                variant="ghost"
                type="submit"
                className="w-full justify-start text-gray-700 hover:bg-gray-100 mt-2"
              >
                <LogOut
                  size={20}
                  className={cn(isOpen || isMobile ? "mr-3" : "mx-auto")}
                />
                {(isOpen || isMobile) && <span>Logga ut</span>}
              </Button>
            </Form>
          </div>
        </div>
      </aside>
      {!isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className={cn(
            "fixed top-4 left-4 z-[10000] transition-all duration-300 ease-in-out",
            isOpen ? "left-[260px]" : "left-4"
          )}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      )}
    </>
  );
};

export default Sidebar;
