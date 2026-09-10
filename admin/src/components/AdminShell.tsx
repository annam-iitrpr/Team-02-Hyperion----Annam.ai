"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdminAuthed, adminLogout } from "@/lib/adminAuth";
import { MAIN_SITE_URL } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  Activity,
  Database,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ExternalLink,
  Cpu,
  Bot,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/models", label: "Vertex AI Models", icon: Cpu },
  { href: "/copilot", label: "AI Admin Copilot", icon: Bot },
  { href: "/database", label: "Database Studio", icon: Database },
  { href: "/users", label: "Farmer Directory", icon: Users },
  { href: "/diagnostics", label: "Diagnostics", icon: Activity },
  { href: "/website", label: "Website Controls", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isAdminAuthed()) {
      router.replace("/");
    } else {
      setAuthed(true);
    }
  }, [router]);

  const handleLogout = () => {
    adminLogout();
    router.replace("/");
  };

  if (!authed) return null;

  return (
    <div className="l-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`l-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark" style={{ background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", color: "#d8f3dc" }}>
            <Shield size={14} />
          </div>
          <div>
            <div className="sidebar-logo-text">KrishYantra</div>
            <div className="sidebar-logo-sub">Admin Operations Hub</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Management</div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="sidebar-section-label" style={{ marginTop: 8 }}>Live Platform</div>
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ color: "#52b788" }}
            title={`Launch Main KrishYantra Application at ${MAIN_SITE_URL}`}
          >
            <ExternalLink size={15} />
            <span>Open Main KrishYantra ↗</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ border: "none", background: "none", width: "100%", cursor: "pointer" }}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="l-main">
        {/* Top bar */}
        <header className="l-topbar">
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: "none" }}
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--ink-subtle)",
              cursor: "pointer",
              display: "none",
              padding: "4px",
              borderRadius: "4px",
            }}
            className="mobile-menu-btn"
          >
            <Menu size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
            <span
              className="badge badge-success"
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span className="status-dot online" />
              Admin Session Active
            </span>
            <span
              className="badge"
              style={{
                background: "rgba(45, 106, 79, 0.12)",
                color: "#52b788",
                border: "1px solid rgba(82, 183, 136, 0.25)",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              Sync: Connected
            </span>
          </div>

          {/* One-way Main Website Launch Button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                border: "1px solid #40916c",
                color: "#ffffff",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "12px",
                boxShadow: "0 2px 8px rgba(27,67,50,0.3)",
                transition: "all 0.2s ease",
              }}
              title={`Open live KrishYantra website (${MAIN_SITE_URL}) in a new tab`}
            >
              <ExternalLink size={13} color="#ffffff" />
              <span>Open Main KrishYantra App</span>
            </a>

            <span className="text-muted" style={{ fontSize: 12 }}>
              KrishYantra Operations · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="l-content">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
