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

export const setArchived = mutation({
  args: { id: v.id("projects"), archived: v.boolean() },
  handler: async (ctx, { id, archived }) => {
    await ctx.db.patch(id, { archived })
  },
})

export const updateStatus = mutation({
  args: { id: v.id("projects"), status: v.string() },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status })
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
    return ctx.db.insert("projects", { name, slug, archived: false })
  },
})
