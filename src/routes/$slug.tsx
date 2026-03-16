import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { useState } from "react"
import { Column, type Assignee, type Task } from "../components/TaskBoard"
import { PROJECT_COLORS } from "~/lib/projectColors"

export const Route = createFileRoute("/$slug")({
  component: ProjectPage,
})

function ProjectPage() {
  const { slug } = Route.useParams()
  const { data: project } = useSuspenseQuery(
    convexQuery(api.projects.getBySlug, { slug }),
  )
  const { data: tasks } = useSuspenseQuery(
    convexQuery(
      api.tasks.listByProject,
      project ? { projectId: project._id } : ("skip" as any),
    ),
  )
  const createTask = useMutation(api.tasks.create)
  const setAssignee = useMutation(api.tasks.setAssignee)
  const archiveProject = useMutation(api.projects.setArchived)
  const updateStatus = useMutation(api.projects.updateStatus)
  const setColor = useMutation(api.projects.setColor)
  const navigate = useNavigate()
  const [status, setStatus] = useState(project?.status ?? "")
  const [assignee, setAssigneeInput] = useState<Assignee>("Nate")
  const [task, setTask] = useState("")
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [draggingId, setDraggingId] = useState<Id<"tasks"> | null>(null)

  if (!project) return <main className="p-8">Project not found</main>

  const nateTasks = (tasks ?? []).filter((t) => t.assignee === "Nate") as Task[]
  const maxTasks = (tasks ?? []).filter((t) => t.assignee === "Max") as Task[]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!task.trim()) return
    await createTask({ projectId: project!._id, assignee, task })
    setTask("")
  }

  async function handleDrop(targetAssignee: Assignee) {
    if (!draggingId) return
    const t = tasks?.find((t) => t._id === draggingId)
    if (t && t.assignee !== targetAssignee) {
      await setAssignee({ id: draggingId, assignee: targetAssignee })
    }
    setDraggingId(null)
  }

  return (
    <main className="p-8 flex flex-col gap-8">
      <div className="flex items-center gap-4 min-w-0">
        {project.color && (
          <span
            className="w-3 h-3 rounded-full shrink-0 border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: project.color }}
          />
        )}
        <h1 className="text-xl font-semibold">{project.name}</h1>
        <input
          className="flex-1 min-w-0 text-sm bg-transparent outline-none text-gray-400 dark:text-gray-500 placeholder-gray-300 dark:placeholder-gray-600 cursor-text"
          placeholder="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          onBlur={() => updateStatus({ id: project._id, status })}
        />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {PROJECT_COLORS.map((c) => (
          <button
            key={c.name}
            title={c.name}
            onClick={() =>
              setColor({
                id: project._id,
                color: project.color === c.hex ? "" : c.hex,
              })
            }
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c.hex,
              borderColor:
                project.color === c.hex ? "#6b7280" : "transparent",
            }}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <select
          className="border rounded px-3 py-2 text-sm bg-transparent dark:border-gray-700 dark:bg-gray-900"
          value={assignee}
          onChange={(e) => setAssigneeInput(e.target.value as Assignee)}
        >
          <option value="Nate">Nate</option>
          <option value="Max">Max</option>
        </select>
        <input
          className="border rounded px-3 py-2 text-sm flex-1 bg-transparent dark:border-gray-700 dark:placeholder-gray-500"
          placeholder="Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded shrink-0 dark:bg-gray-100 dark:text-gray-900"
        >
          Add task
        </button>
      </form>

      <div className="flex gap-6">
        <Column
          label="Nate"
          assignee="Nate"
          tasks={nateTasks}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDrop={handleDrop}
        />
        <Column
          label="Max"
          assignee="Max"
          tasks={maxTasks}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDrop={handleDrop}
        />
      </div>

      <button
        onClick={() => setConfirmArchive(true)}
        className="self-start text-sm text-gray-400 dark:text-gray-500"
      >
        Archive project
      </button>

      {confirmArchive && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setConfirmArchive(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm">Archive this project?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmArchive(false)}
                className="text-sm px-4 py-2 border rounded dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                disabled={archiving}
                onClick={async () => {
                  setArchiving(true)
                  await archiveProject({ id: project!._id, archived: true })
                  navigate({ to: "/" })
                }}
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
              >
                {archiving ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
