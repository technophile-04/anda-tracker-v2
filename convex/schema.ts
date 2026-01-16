import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),
  rooms: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
    activeTrayId: v.union(v.id("trays"), v.null()),
  }).index("by_creator", ["createdBy"]),
  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_user", ["roomId", "userId"]),
  trays: defineTable({
    roomId: v.id("rooms"),
    label: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),
  eggs: defineTable({
    trayId: v.id("trays"),
    position: v.number(),
    eatenBy: v.union(v.id("users"), v.null()),
    eatenAt: v.union(v.number(), v.null()),
  }).index("by_tray", ["trayId"]),
});
