import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first()
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("projects").order("desc").collect()
  },
})

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect()
    await Promise.all(tasks.map((t) => ctx.db.delete(t._id)))
    await ctx.db.delete(id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, { name, slug }) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first()
    if (existing) throw new Error(`Slug "${slug}" is already taken`)
    return ctx.db.insert("projects", { name, slug })
  },
})
