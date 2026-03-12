import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { useState } from "react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { Column, type Assignee, type Task } from "../components/TaskBoard"

export const Route = createFileRoute("/")({
  component: Dashboard,
})

function Dashboard() {
  const { data: tasks } = useSuspenseQuery(convexQuery(api.tasks.listAll, {}))
  const setAssignee = useMutation(api.tasks.setAssignee)
  const [draggingId, setDraggingId] = useState<Id<"tasks"> | null>(null)

  const nateTasks = tasks.filter((t) => t.assignee === "Nate") as Task[]
  const maxTasks = tasks.filter((t) => t.assignee === "Max") as Task[]

  async function handleDrop(targetAssignee: Assignee) {
    if (!draggingId) return
    const t = tasks.find((t) => t._id === draggingId)
    if (t && t.assignee !== targetAssignee) {
      await setAssignee({ id: draggingId, assignee: targetAssignee })
    }
    setDraggingId(null)
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
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
    </div>
  )
}
