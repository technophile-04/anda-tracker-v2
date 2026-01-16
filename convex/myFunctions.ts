import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const TRAY_SIZE = 30;

function formatTrayLabel(date: Date) {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

async function createTray(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  userId: Id<"users">,
  label?: string,
) {
  const createdAt = Date.now();
  const trayLabel = label?.trim() || formatTrayLabel(new Date(createdAt));
  const trayId = await ctx.db.insert("trays", {
    roomId,
    label: trayLabel,
    createdBy: userId,
    createdAt,
  });

  await Promise.all(
    Array.from({ length: TRAY_SIZE }, (_, position) =>
      ctx.db.insert("eggs", {
        trayId,
        position,
        eatenBy: null,
        eatenAt: null,
      }),
    ),
  );

  return trayId;
}

export const createUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.name.trim();
    if (!trimmed) {
      throw new Error("Please enter a name.");
    }

    const userId = await ctx.db.insert("users", {
      name: trimmed,
    });

    return userId;
  },
});

export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const listRooms = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const rooms = await Promise.all(
      memberships.map(async (membership) => {
        const room = await ctx.db.get(membership.roomId);
        if (!room) {
          return null;
        }
        const memberCount = await ctx.db
          .query("roomMembers")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect();
        return {
          id: room._id,
          name: room.name,
          activeTrayId: room.activeTrayId,
          memberCount: memberCount.length,
        };
      }),
    );

    return rooms.filter(Boolean) as Array<{
      id: Id<"rooms">;
      name: string;
      activeTrayId: Id<"trays"> | null;
      memberCount: number;
    }>;
  },
});

export const createRoom = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const trimmed = args.name.trim();
    if (!trimmed) {
      throw new Error("Room name is required.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const roomId = await ctx.db.insert("rooms", {
      name: trimmed,
      createdBy: args.userId,
      activeTrayId: null,
    });

    await ctx.db.insert("roomMembers", {
      roomId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    const trayId = await createTray(ctx, roomId, args.userId, undefined);
    await ctx.db.patch(roomId, { activeTrayId: trayId });

    return roomId;
  },
});

export const joinRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const existing = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("roomMembers", {
        roomId: args.roomId,
        userId: args.userId,
        joinedAt: Date.now(),
      });
    }

    return { joined: !existing };
  },
});

export const createTrayForRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .unique();

    if (!membership) {
      throw new Error("Join the room first.");
    }

    const trayId = await createTray(ctx, args.roomId, args.userId, args.label);
    await ctx.db.patch(args.roomId, { activeTrayId: trayId });

    return trayId;
  },
});

export const toggleEgg = mutation({
  args: {
    eggId: v.id("eggs"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const egg = await ctx.db.get(args.eggId);
    if (!egg) {
      throw new Error("Egg not found.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const tray = await ctx.db.get(egg.trayId);
    if (!tray) {
      throw new Error("Tray not found.");
    }

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", tray.roomId).eq("userId", args.userId),
      )
      .unique();

    if (!membership) {
      throw new Error("Join the room first.");
    }

    if (egg.eatenBy && egg.eatenBy !== args.userId) {
      throw new Error("Egg already claimed by someone else.");
    }

    const claimed = egg.eatenBy === args.userId;
    await ctx.db.patch(args.eggId, {
      eatenBy: claimed ? null : args.userId,
      eatenAt: claimed ? null : Date.now(),
    });

    return { claimed: !claimed };
  },
});

export const getRoomSummary = query({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      return null;
    }

    const currentUser = await ctx.db.get(args.userId);

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId),
      )
      .unique();

    const memberEntries = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const members = (
      await Promise.all(
        memberEntries.map(async (entry) => {
          const user = await ctx.db.get(entry.userId);
          if (!user) {
            return null;
          }
          return {
            userId: user._id,
            name: user.name,
            joinedAt: entry.joinedAt,
          };
        }),
      )
    ).filter(Boolean) as Array<{
      userId: Id<"users">;
      name: string;
      joinedAt: number;
    }>;

    let tray: Doc<"trays"> | null = null;
    let eggs: Doc<"eggs">[] = [];

    if (room.activeTrayId) {
      tray = await ctx.db.get(room.activeTrayId);
      if (tray) {
        const trayId = tray._id;
        eggs = await ctx.db
          .query("eggs")
          .withIndex("by_tray", (q) => q.eq("trayId", trayId))
          .collect();
      }
    }

    eggs.sort((a, b) => a.position - b.position);

    const counts: Record<string, number> = {};
    for (const egg of eggs) {
      if (egg.eatenBy) {
        const key = egg.eatenBy.toString();
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }

    return {
      room,
      currentUser,
      isMember: Boolean(membership),
      members,
      tray,
      eggs,
      counts,
    };
  },
});
