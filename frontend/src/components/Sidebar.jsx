import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdOutlineSecurity } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { FiUsers } from "react-icons/fi";   // 👈 NEW

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const confirmLogout = () => {
    const ok = window.confirm("Are you sure you want to logout?");
    if (ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <RxDashboard size={20} /> },
    { name: "Logs", path: "/logs", icon: <HiOutlineDocumentText size={20} /> },
    { name: "Incidents", path: "/incidents", icon: <MdOutlineSecurity size={20} /> },
    // 👇 NEW ADMIN ITEM
    { name: "Admin", path: "/admin", icon: <FiUsers size={20} /> },
  ];

  return (
    <>
      {/* Hamburger Button (Mobile Only) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-cyan-600 rounded-md text-white"
        onClick={() => setOpen(!open)}
      >
        <HiOutlineMenuAlt3 size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-56 h-full bg-[#050B16] shadow-lg border-r border-cyan-500/20
          flex flex-col p-6 z-40 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <h3 className="text-cyan-400 text-xl font-extrabold mb-10 tracking-wide">
          NovaSOC
        </h3>

        {/* Menu */}
        <ul className="space-y-5">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 text-md font-medium transition-all
                ${
                  location.pathname === item.path
                    ? "text-cyan-400 translate-x-1"
                    : "text-gray-300 hover:text-cyan-300"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.icon} {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Threat Map (kept as you had it) */}
        <ul className="space-y-5 mt-6">
          <li>
            <Link
              to="/threat-map"
              className={`flex gap-3 text-md font-medium transition-all
              ${
                location.pathname === "/threat-map"
                  ? "text-cyan-400 translate-x-1"
                  : "text-gray-300 hover:text-cyan-300"
              }`}
              onClick={() => setOpen(false)}
            >
              🌍 Threat Map
            </Link>
          </li>
        </ul>

        {/* Logout */}
        <button
          onClick={confirmLogout}
          className="mt-auto flex items-center gap-3 text-red-400
          font-semibold hover:text-red-300 hover:translate-x-1
          transition-all duration-200"
        >
          <FiLogOut size={20} /> Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
