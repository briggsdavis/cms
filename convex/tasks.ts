import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect()
    const enriched = await Promise.all(
      tasks.map(async (t) => {
        const project = await ctx.db.get(t.projectId)
        if (!project || project.archived || t.completed) return null
        return { ...t, projectName: project.name, projectSlug: project.slug }
      }),
    )
    return enriched.filter((t) => t !== null)
  },
})

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect()
  },
})

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    assignee: v.union(v.literal("Max"), v.literal("Nate")),
    task: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("tasks", { ...args, completed: false })
  },
})

export const setCompleted = mutation({
  args: { id: v.id("tasks"), completed: v.boolean() },
  handler: async (ctx, { id, completed }) => {
    await ctx.db.patch(id, { completed })
  },
})

export const setAssignee = mutation({
  args: {
    id: v.id("tasks"),
    assignee: v.union(v.literal("Max"), v.literal("Nate")),
  },
  handler: async (ctx, { id, assignee }) => {
    await ctx.db.patch(id, { assignee })
  },
})

export const updateText = mutation({
  args: { id: v.id("tasks"), task: v.string() },
  handler: async (ctx, { id, task }) => {
    await ctx.db.patch(id, { task })
  },
})
