"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearAuth, getStoredUser, getToken } from "@/lib/api";
import type { DashboardStats, Priority, Task, User } from "@/lib/api";
import TaskFormModal from "@/components/TaskFormModal";
import TaskItem from "@/components/TaskItem";
import Dashboard from "@/components/Dashboard";

type StatusFilter = "all" | "done" | "notdone";
type PriorityFilter = "all" | Priority;

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);

  const refresh = useCallback(
    async (sf: StatusFilter, pf: PriorityFilter) => {
      try {
        const [list, dash] = await Promise.all([
          api.listTasks({
            status: sf === "all" ? undefined : sf,
            priority: pf === "all" ? undefined : pf,
          }),
          api.dashboard(),
        ]);
        setTasks(list);
        setStats(dash);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Chyba načítání";
        setError(msg);
        if (msg.toLowerCase().includes("neplatné") || msg.includes("401")) {
          clearAuth();
          router.replace("/login");
        }
      }
    },
    [router],
  );

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());
    refresh(statusFilter, priorityFilter).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    refresh(statusFilter, priorityFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditTarget(task);
    setModalOpen(true);
  }

  async function handleToggle(id: number) {
    // optimistic update for snappy UI
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t)),
    );
    try {
      await api.toggleTask(id);
      refresh(statusFilter, priorityFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba");
      refresh(statusFilter, priorityFilter);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Opravdu smazat tento úkol?")) return;
    try {
      await api.deleteTask(id);
      refresh(statusFilter, priorityFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba");
    }
  }

  async function handleSubmitTask(data: {
    title: string;
    description: string | null;
    due_date: string | null;
    priority: Priority;
  }) {
    if (editTarget) {
      await api.updateTask(editTarget.id, data);
    } else {
      await api.createTask(data);
    }
    refresh(statusFilter, priorityFilter);
  }

  return (
    <>
      <header className="navbar">
        <h1>Task Manager</h1>
        <div className="nav-right">
          {user && <span>Přihlášen jako <strong>{user.username}</strong></span>}
          <button className="btn btn-ghost" onClick={handleLogout}>
            Odhlásit
          </button>
        </div>
      </header>

      <main className="container">
        {loading ? (
          <div className="loading">Načítám...</div>
        ) : (
          <>
            {error && <div className="error">{error}</div>}

            <Dashboard stats={stats} />

            <div className="section-title">
              <h2>Vaše úkoly</h2>
              <button className="btn btn-primary" onClick={openCreate}>
                + Nový úkol
              </button>
            </div>

            <div className="filter-bar">
              {([
                ["all", "Vše"],
                ["notdone", "Nehotové"],
                ["done", "Hotové"],
              ] as Array<[StatusFilter, string]>).map(([key, label]) => (
                <button
                  key={key}
                  className={`filter-pill ${statusFilter === key ? "active" : ""}`}
                  onClick={() => setStatusFilter(key)}
                >
                  {label}
                </button>
              ))}
              <span style={{ width: 1, background: "var(--border)" }} />
              {([
                ["all", "Všechny priority"],
                ["Vysoká", "Vysoká"],
                ["Střední", "Střední"],
                ["Nízká", "Nízká"],
              ] as Array<[PriorityFilter, string]>).map(([key, label]) => (
                <button
                  key={key}
                  className={`filter-pill ${priorityFilter === key ? "active" : ""}`}
                  onClick={() => setPriorityFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tasks.length === 0 ? (
              <div className="empty">Žádné úkoly k zobrazení. Přidejte si první!</div>
            ) : (
              <div className="task-list">
                {tasks.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onToggle={handleToggle}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <TaskFormModal
        open={modalOpen}
        initial={editTarget}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTask}
      />
    </>
  );
}
