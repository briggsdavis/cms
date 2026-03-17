import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.optional(v.string()),
    archived: v.optional(v.boolean()),
    color: v.optional(v.string()),
  }).index("by_slug", ["slug"]),
  tasks: defineTable({
    projectId: v.id("projects"),
    assignee: v.union(v.literal("Max"), v.literal("Nate")),
    task: v.string(),
    completed: v.optional(v.boolean()),
  }).index("by_project", ["projectId"]),
})
