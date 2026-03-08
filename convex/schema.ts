import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),
  tasks: defineTable({
    projectId: v.id("projects"),
    assignee: v.union(v.literal("Max"), v.literal("Nate")),
    task: v.string(),
  }).index("by_project", ["projectId"]),
});
