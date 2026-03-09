import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useState } from "react"

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
  const removeTask = useMutation(api.tasks.remove)
  const removeProject = useMutation(api.projects.remove)
  const navigate = useNavigate()
  const [assignee, setAssignee] = useState<"Max" | "Nate">("Nate")
  const [task, setTask] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!project)
    return <main className="max-w-xl mx-auto p-8">Project not found</main>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!task.trim()) return
    await createTask({ projectId: project!._id, assignee, task })
    setTask("")
  }

  return (
    <main className="max-w-xl mx-auto p-8 flex flex-col gap-8">
      <h1 className="text-xl font-semibold">{project.name}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select
          className="border rounded px-3 py-2 text-sm"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value as "Max" | "Nate")}
        >
          <option value="Nate">Nate</option>
          <option value="Max">Max</option>
        </select>
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />
        <button
          type="submit"
          className="self-start bg-gray-900 text-white text-sm px-4 py-2 rounded"
        >
          Add task
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {tasks?.map((t) => (
          <li
            key={t._id}
            className="flex items-center gap-3 border rounded px-3 py-2 text-sm"
          >
            <span className="text-gray-400 shrink-0">{t.assignee}</span>
            <span className="flex-1">{t.task}</span>
            <button
              onClick={() => removeTask({ id: t._id })}
              className="text-gray-300 hover:text-red-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setConfirmDelete(true)}
        className="self-start text-sm text-red-500"
      >
        Delete project
      </button>

      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm">Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true)
                  await removeProject({ id: project!._id })
                  navigate({ to: "/" })
                }}
                className="text-sm px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
