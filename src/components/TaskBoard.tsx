import { Link } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { useState } from "react"
import { Pencil, Check, Trash2 } from "lucide-react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

export type Assignee = "Nate" | "Max"

export type Task = {
  _id: Id<"tasks">
  task: string
  assignee: Assignee
  completed?: boolean
  projectName?: string
  projectSlug?: string
}

export function TaskCard({
  t,
  onDragStart,
}: {
  t: Task
  onDragStart: (id: Id<"tasks">) => void
}) {
  const setCompleted = useMutation(api.tasks.setCompleted)
  const updateText = useMutation(api.tasks.updateText)
  const removeTask = useMutation(api.tasks.remove)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(t.task)

  async function saveEdit() {
    if (draft.trim() && draft !== t.task)
      await updateText({ id: t._id, task: draft.trim() })
    setEditing(false)
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(t._id)}
      className="flex items-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-3 text-sm cursor-grab active:cursor-grabbing select-none"
    >
      <button
        onClick={() => setCompleted({ id: t._id, completed: !t.completed })}
        className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${t.completed ? "bg-gray-900 border-gray-900 dark:bg-gray-100 dark:border-gray-100" : "border-gray-300 dark:border-gray-600"}`}
      >
        {t.completed && (
          <Check
            size={10}
            strokeWidth={3}
            className="text-white dark:text-gray-900"
          />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            className="w-full border-b outline-none text-sm bg-transparent dark:border-gray-600"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit()
              if (e.key === "Escape") setEditing(false)
            }}
          />
        ) : (
          <span
            className={`block ${t.completed ? "line-through text-gray-400 dark:text-gray-500" : ""}`}
          >
            {t.task}
          </span>
        )}
        {t.projectName && t.projectSlug && (
          <Link
            to="/$slug"
            params={{ slug: t.projectSlug }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {t.projectName}
          </Link>
        )}
      </div>

      <button
        onClick={() => {
          setEditing(true)
          setDraft(t.task)
        }}
        className="shrink-0 text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={() => removeTask({ id: t._id })}
        className="shrink-0 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export function Column({
  label,
  assignee,
  tasks,
  draggingId,
  onDragStart,
  onDrop,
}: {
  label: string
  assignee: Assignee
  tasks: Task[]
  draggingId: Id<"tasks"> | null
  onDragStart: (id: Id<"tasks">) => void
  onDrop: (assignee: Assignee) => void
}) {
  const [over, setOver] = useState(false)

  return (
    <div
      className="flex-1 flex flex-col gap-3"
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={() => {
        setOver(false)
        onDrop(assignee)
      }}
    >
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </h2>
      <div
        className={`flex flex-col gap-2 min-h-24 rounded-lg p-2 transition-colors ${over && draggingId ? "bg-gray-100 dark:bg-gray-800" : ""}`}
      >
        {tasks.map((t) => (
          <TaskCard key={t._id} t={t} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  )
}
