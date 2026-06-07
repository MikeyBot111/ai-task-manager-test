"use client";

import { useEffect, useState } from "react";
import type { Priority, Task } from "@/lib/api";

interface Props {
  open: boolean;
  initial?: Task | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string | null;
    due_date: string | null;
    priority: Priority;
  }) => Promise<void>;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  // Convert ISO to "YYYY-MM-DDTHH:mm" for datetime-local input
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TaskFormModal({ open, initial, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("Střední");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setDueDate(toLocalInput(initial?.due_date ?? null));
      setPriority(initial?.priority ?? "Střední");
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const dueIso = dueDate ? new Date(dueDate).toISOString() : null;
      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        due_date: dueIso,
        priority,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při uložení");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? "Upravit úkol" : "Nový úkol"}</h3>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="t-title">Název</label>
            <input
              id="t-title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="t-desc">Popis</label>
            <textarea
              id="t-desc"
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="row">
            <div className="form-group">
              <label htmlFor="t-due">Termín</label>
              <input
                id="t-due"
                className="form-control"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="t-pri">Priorita</label>
              <select
                id="t-pri"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="Vysoká">Vysoká</option>
                <option value="Střední">Střední</option>
                <option value="Nízká">Nízká</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Zrušit
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Ukládám..." : initial ? "Uložit" : "Vytvořit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
