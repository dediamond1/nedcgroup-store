"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Link, redirect, useLocation, useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users2,
  FileText,
  Package,
  Upload,
  Settings,
  LogOut,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface SettingsItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

const navLinks: NavLink[] = [
  { to: "/companies", label: "Companies", icon: <Building2 size={20} /> },
  { to: "/accounts", label: "Accounts", icon: <Users2 size={20} /> },
  { to: "/invoices", label: "Invoices", icon: <FileText size={20} /> },
  { to: "/lager", label: "Inventory", icon: <Package size={20} /> },
  { to: "/ladda-upp", label: "Upload", icon: <Upload size={20} /> },
];

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  isOpen,
  onClose,
  onToggle,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const settingsRef = useRef<HTMLDivElement>(null);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const settingsItems: SettingsItem[] = [
    {
      label: "Settings",
      icon: <Settings size={18} />,
      action: () => navigate("/settings"),
    },
    {
      label: "Help & Support",
      icon: <HelpCircle size={18} />,
      action: () => navigate("/support"),
    },
    {
      label: "Logout",
      icon: <LogOut size={18} />,
      action: () => navigate("/logout"),
    },
  ];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-semibold text-gray-800 overflow-hidden whitespace-nowrap"
            >
              Nedcgroup
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={isMobile ? onClose : onToggle}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {isMobile ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              location.pathname === link.to
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={isMobile ? onClose : undefined}
          >
            {link.icon}
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 overflow-hidden whitespace-nowrap"
                >
                  {link.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200" ref={settingsRef}>
        <div className="relative">
          <button
            onClick={toggleSettings}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              isSettingsOpen
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings size={20} />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 flex-1 text-left overflow-hidden whitespace-nowrap"
                >
                  More options
                </motion.span>
              )}
            </AnimatePresence>
            {isOpen && (
              <ChevronRight
                size={16}
                className={`transition-transform duration-200 ${
                  isSettingsOpen ? "rotate-90" : ""
                }`}
              />
            )}
          </button>
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`absolute ${
                  isOpen ? "bottom-full left-0 mb-2" : "bottom-0 left-full ml-2"
                } w-48 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200`}
              >
                {settingsItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsSettingsOpen(false);
                      if (isMobile) onClose();
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onClose}
            />
          )}
        </AnimatePresence>
        <motion.div
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg"
          initial={{ x: "-100%" }}
          animate={{ x: isOpen ? 0 : "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {sidebarContent}
        </motion.div>
      </>
    );
  }

  return (
    <motion.div
      className="flex bg-white border-r border-gray-200 shadow-sm"
      initial={false}
      animate={{ width: isOpen ? "240px" : "72px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {sidebarContent}
    </motion.div>
  );
};

export default Sidebar;
