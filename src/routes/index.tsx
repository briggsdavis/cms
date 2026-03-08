import { createFileRoute, Link } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "../../convex/_generated/api"
import { useState } from "react"
import slugify from "@sindresorhus/slugify"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { Id } from "../../convex/_generated/dataModel"

export const Route = createFileRoute("/")({
  component: Home,
})

function ProjectRow({
  project,
}: {
  project: { _id: Id<"projects">; name: string; slug: string }
}) {
  const [open, setOpen] = useState(false)
  const { data: tasks } = useSuspenseQuery(
    convexQuery(api.tasks.listByProject, { projectId: project._id }),
  )

  return (
    <li className="border rounded text-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3 py-2 text-left"
      >
        <Link
          to="/$slug"
          params={{ slug: project.slug }}
          className="hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {project.name}
        </Link>
        <span className="text-gray-400">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {open && tasks.length > 0 && (
        <ul className="border-t px-3 py-2 flex flex-col gap-1">
          {tasks.map((t) => (
            <li key={t._id} className="flex gap-3 text-gray-600">
              <span className="text-gray-400 shrink-0">{t.assignee}</span>
              <span>{t.task}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function Home() {
  const { data: projects } = useSuspenseQuery(
    convexQuery(api.projects.list, {}),
  )
  const create = useMutation(api.projects.create)
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    try {
      await create({ name, slug: slugify(name) })
      setName("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8 flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Projects</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="self-start bg-gray-900 text-white text-sm px-4 py-2 rounded"
        >
          Create project
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {projects.map((p) => (
          <ProjectRow key={p._id} project={p} />
        ))}
      </ul>
    </main>
  )
}
