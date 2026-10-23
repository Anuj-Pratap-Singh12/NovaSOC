import React from "react";

export default function TableCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#071520] p-6 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-cyan-700/30 backdrop-blur-sm">
      {title && <h3 className="text-cyan-300 font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
}
