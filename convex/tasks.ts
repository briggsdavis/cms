import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    assignee: v.union(v.literal("Max"), v.literal("Nate")),
    task: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("tasks", args);
  },
});
