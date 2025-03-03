"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Form } from "@remix-run/react";
import {
  Building2,
  Package,
  Upload,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
  X,
  ChevronRight,
  Home,
  Bell,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const mainNavLinks: NavLink[] = [
  { to: "/companies", label: "Companies", icon: <Building2 size={20} /> },
  { to: "/lager", label: "Lager", icon: <Package size={20} /> },
  { to: "/ladda-upp", label: "Ladda upp", icon: <Upload size={20} /> },
  { to: "/the-rest", label: "Övriga", icon: <FileText size={20} /> },
];

const utilityNavLinks: NavLink[] = [
  { to: "/settings", label: "Inställningar", icon: <Settings size={18} /> },
  { to: "/support", label: "Hjälp & Support", icon: <HelpCircle size={18} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check if screen size changed
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Add a class to body to prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen && isSmallScreen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, isSmallScreen]);

  // Variants for animations
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  };

  const overlayVariants = {
    open: { opacity: 1, transition: { duration: 0.3 } },
    closed: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && isSmallScreen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={cn(
          "fixed top-0 left-0 h-screen bg-white z-50 shadow-lg",
          "w-72 border-r border-gray-100 flex flex-col",
          isSmallScreen ? "lg:hidden" : "block"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center h-16 px-5 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white font-bold text-xl">
              N
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Nedcgroup
            </span>
          </div>

          {isSmallScreen && (
            <button
              onClick={onClose}
              className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className="border-b border-gray-100 pt-4 pb-5 px-5">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <User size={22} className="text-blue-700" />
            </div>
            <div className="ml-auto relative">
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500"></span>
              <Bell size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <div className="mb-2 px-2">
            <p className="text-xs uppercase font-medium text-gray-400 mb-1 tracking-wider">
              Navigation
            </p>
          </div>

          {mainNavLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={isSmallScreen ? onClose : undefined}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-md transition-all",
                  "group relative",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "mr-3 p-1.5 rounded-md transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}
                  >
                    {link.icon}
                  </div>
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isActive ? "font-semibold" : ""
                    )}
                  >
                    {link.label}
                  </span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                )}

                <ChevronRight
                  size={16}
                  className={cn(
                    "text-gray-400 opacity-0 transition-opacity",
                    isActive ? "opacity-100" : "group-hover:opacity-100"
                  )}
                />
              </Link>
            );
          })}

          <div className="mt-6 mb-2 px-2">
            <p className="text-xs uppercase font-medium text-gray-400 mb-1 tracking-wider">
              Settings
            </p>
          </div>

          {utilityNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={isSmallScreen ? onClose : undefined}
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-all mb-1 group",
                location.pathname === link.to
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <div
                className={cn(
                  "mr-3 text-gray-500 group-hover:text-gray-700",
                  location.pathname === link.to ? "text-gray-900" : ""
                )}
              >
                {link.icon}
              </div>
              <span className="text-sm">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-100 p-4">
          <Form method="post" action="/logout">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              <span className="text-sm font-medium">Logga ut</span>
            </button>
          </Form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
              <span className="text-xs text-gray-400">v1.2.4</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
