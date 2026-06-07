"use client";

import type { Task } from "@/lib/api";

interface Props {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dueBadge(iso: string | null, isDone: boolean): React.ReactNode {
  if (!iso || isDone) return null;
  const due = new Date(iso).getTime();
  const now = Date.now();
  const diffH = (due - now) / (1000 * 60 * 60);
  if (diffH < 0) return <span className="badge badge-overdue">Po termínu</span>;
  if (diffH <= 24 * 3) return <span className="badge badge-soon">Brzy</span>;
  return null;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: Props) {
  const priClass =
    task.priority === "Vysoká"
      ? "badge-vysoka"
      : task.priority === "Střední"
        ? "badge-stredni"
        : "badge-nizka";

  const formatted = formatDate(task.due_date);

  return (
    <div className={`task-item ${task.is_done ? "is-done" : ""}`}>
      <button
        className="check"
        aria-label={task.is_done ? "Označit jako nehotové" : "Označit jako hotové"}
        onClick={() => onToggle(task.id)}
      >
        {task.is_done ? "✓" : ""}
      </button>

      <div className="body">
        <div className="title-row">
          <span className="title">{task.title}</span>
          <span className={`badge ${priClass}`}>{task.priority}</span>
          {dueBadge(task.due_date, task.is_done)}
        </div>
        {task.description && <div className="desc">{task.description}</div>}
        {formatted && (
          <div className="meta">
            <span>Termín: {formatted}</span>
          </div>
        )}
      </div>

      <div className="actions">
        <button className="btn btn-ghost" onClick={() => onEdit(task)}>
          Upravit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
          Smazat
        </button>
      </div>
    </div>
  );
}
