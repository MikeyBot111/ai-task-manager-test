"use client";

import type { DashboardStats } from "@/lib/api";

export default function Dashboard({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;
  return (
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="label">Celkem úkolů</div>
        <div className="value">{stats.total}</div>
      </div>
      <div className="stat-card">
        <div className="label">Hotové</div>
        <div className="value" style={{ color: "var(--success)" }}>
          {stats.done}
        </div>
      </div>
      <div className="stat-card">
        <div className="label">Nehotové</div>
        <div className="value">{stats.not_done}</div>
      </div>
      <div className="stat-card">
        <div className="label">Blížící se termín</div>
        <div className="value" style={{ color: "var(--warning)" }}>
          {stats.upcoming}
        </div>
      </div>
      <div className="stat-card priority-row">
        <div className="label">Podle priority</div>
        <div className="pri-line">
          <span className="name">Vysoká</span>
          <span>{stats.by_priority.Vysoká}</span>
        </div>
        <div className="pri-line">
          <span className="name">Střední</span>
          <span>{stats.by_priority.Střední}</span>
        </div>
        <div className="pri-line">
          <span className="name">Nízká</span>
          <span>{stats.by_priority.Nízká}</span>
        </div>
      </div>
    </div>
  );
}
