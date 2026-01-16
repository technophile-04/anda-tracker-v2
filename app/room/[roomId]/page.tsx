"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

const STORAGE_KEY = "eggtracker:userId";
const TARGET_PER_PERSON = 15;
const TRAY_SIZE = 30;
const MEMBER_COLORS = [
  "bg-amber-200 border-amber-500 text-amber-900",
  "bg-emerald-200 border-emerald-500 text-emerald-900",
  "bg-sky-200 border-sky-500 text-sky-900",
  "bg-violet-200 border-violet-500 text-violet-900",
  "bg-rose-200 border-rose-500 text-rose-900",
  "bg-lime-200 border-lime-500 text-lime-900",
];

const cardBaseClass =
  "rounded-3xl border-2 border-slate-900 p-6 shadow-[0_6px_0_0_rgba(15,23,42,0.25)]";
const primaryButtonClass =
  "rounded-full border-2 border-slate-900 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_0_0_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-amber-300 active:translate-y-0.5 active:shadow-none";
const secondaryButtonClass =
  "rounded-full border-2 border-slate-900 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_0_0_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none";
const inputClass =
  "w-full rounded-full border-2 border-slate-900 bg-white px-4 py-2 text-sm shadow-[inset_0_2px_0_0_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-amber-400";
const eggBaseClass =
  "h-12 w-12 rounded-full border-2 text-xs font-semibold shadow-[0_4px_0_0_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none";
const unclaimedEggClass = "border-slate-900 bg-amber-50 text-slate-800";
const colorDotClass =
  "h-3 w-3 rounded-full border-2 shadow-[0_2px_0_0_rgba(15,23,42,0.2)]";

function useStoredUserId() {
  const [userId, setUserIdState] = useState<Id<"users"> | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (stored as Id<"users">) : null;
  });

  const setUserId = useCallback((id: Id<"users">) => {
    setUserIdState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const clearUserId = useCallback(() => {
    setUserIdState(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { userId, setUserId, clearUserId };
}

export default function RoomPage() {
  const params = useParams();
  const roomIdParam = params.roomId;
  const roomId = (
    Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam
  ) as Id<"rooms">;

  const { userId, setUserId, clearUserId } = useStoredUserId();
  const user = useQuery(api.myFunctions.getUser, userId ? { userId } : "skip");
  const roomData = useQuery(
    api.myFunctions.getRoomSummary,
    userId ? { roomId, userId } : "skip",
  );
  const createUser = useMutation(api.myFunctions.createUser);
  const joinRoom = useMutation(api.myFunctions.joinRoom);
  const createTray = useMutation(api.myFunctions.createTrayForRoom);
  const toggleEgg = useMutation(api.myFunctions.toggleEgg);

  const [nameInput, setNameInput] = useState("");
  const [trayLabel, setTrayLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/room/${roomId}`;
  }, [roomId]);

  useEffect(() => {
    if (userId && user === null) {
      clearUserId();
    }
  }, [userId, user, clearUserId]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const newUserId = await createUser({ name: nameInput });
      setUserId(newUserId);
      setNameInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
    }
  };

  const handleJoinRoom = async () => {
    if (!userId) {
      return;
    }
    setError(null);
    try {
      await joinRoom({ roomId, userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join room.");
    }
  };

  const handleCreateTray = async () => {
    if (!userId) {
      return;
    }
    setError(null);
    try {
      await createTray({ roomId, userId, label: trayLabel || undefined });
      setTrayLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start a tray.");
    }
  };

  const handleToggleEgg = async (eggId: Id<"eggs">) => {
    if (!userId) {
      return;
    }
    setError(null);
    try {
      await toggleEgg({ eggId, userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark egg.");
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) {
      return;
    }
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!userId) {
    return (
      <main className="min-h-screen text-slate-900">
        <div className="max-w-xl mx-auto p-6 flex flex-col gap-6">
          <Link href="/" className="text-sm text-slate-700">
            ← Back to rooms
          </Link>
          <section className={`${cardBaseClass} bg-white`}>
            <h1 className="text-2xl font-semibold">Join the tray</h1>
            <p className="text-sm text-slate-600">
              Enter your name to join this room and start tracking eggs.
            </p>
            {error ? (
              <div className="mt-4 rounded-2xl border-2 border-red-500 bg-red-100 px-4 py-3 text-sm text-red-700 shadow-[0_4px_0_0_rgba(185,28,28,0.3)]">
                {error}
              </div>
            ) : null}
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleLogin}>
              <input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
              <button type="submit" className={primaryButtonClass}>
                Continue
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  if (roomData === undefined) {
    return (
      <main className="min-h-screen text-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-sm text-slate-700">Loading room...</p>
        </div>
      </main>
    );
  }

  if (roomData === null) {
    return (
      <main className="min-h-screen text-slate-900">
        <div className="max-w-4xl mx-auto p-6 flex flex-col gap-4">
          <Link href="/" className="text-sm text-slate-700">
            ← Back to rooms
          </Link>
          <section className={`${cardBaseClass} bg-white`}>
            <h1 className="text-2xl font-semibold">Room not found</h1>
            <p className="text-sm text-slate-600">
              This invite link may be expired or incorrect.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const members = [...roomData.members].sort((a, b) => a.joinedAt - b.joinedAt);
  const memberColorMap = new Map(
    members.map((member, index) => [
      member.userId.toString(),
      MEMBER_COLORS[index % MEMBER_COLORS.length],
    ]),
  );
  const counts = roomData.counts;
  const totalEaten = roomData.eggs.filter((egg) => egg.eatenBy).length;

  return (
    <main className="min-h-screen text-slate-900">
      <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8">
        <header className={`${cardBaseClass} bg-amber-100 flex flex-col gap-3`}>
          <Link href="/" className="text-sm text-slate-700">
            ← Back to rooms
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-700">
                Room
              </p>
              <h1 className="text-3xl font-semibold">{roomData.room.name}</h1>
              <p className="text-sm text-slate-700">
                Signed in as {user?.name}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3">
              <button onClick={clearUserId} className={secondaryButtonClass}>
                Sign out
              </button>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="w-56 rounded-full border-2 border-slate-900 bg-white px-3 py-1.5 text-xs"
                />
                <button
                  onClick={handleCopyInvite}
                  className="rounded-full border-2 border-slate-900 bg-pink-300 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_3px_0_0_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-pink-200 active:translate-y-0.5 active:shadow-none"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-slate-600">Invite link</p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border-2 border-red-500 bg-red-100 px-4 py-3 text-sm text-red-700 shadow-[0_4px_0_0_rgba(185,28,28,0.3)]">
            {error}
          </div>
        ) : null}

        {!roomData.isMember ? (
          <section className={`${cardBaseClass} bg-white`}>
            <h2 className="text-xl font-semibold">Join this room</h2>
            <p className="text-sm text-slate-600 mt-1">
              You are not part of this tray yet. Join to start marking eggs.
            </p>
            <button
              onClick={handleJoinRoom}
              className={`mt-4 ${primaryButtonClass}`}
            >
              Join room
            </button>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className={`${cardBaseClass} bg-white flex flex-col gap-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Tray
                  </p>
                  <h2 className="text-2xl font-semibold">
                    {roomData.tray?.label ?? "No active tray"}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {totalEaten} of {TRAY_SIZE} eggs eaten
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    value={trayLabel}
                    onChange={(event) => setTrayLabel(event.target.value)}
                    placeholder="Tray label (optional)"
                    className={inputClass}
                  />
                  <button
                    onClick={handleCreateTray}
                    className={secondaryButtonClass}
                  >
                    Start new tray
                  </button>
                </div>
              </div>

              {roomData.tray ? (
                <div className="grid grid-cols-6 gap-3">
                  {roomData.eggs.map((egg) => {
                    const ownerKey = egg.eatenBy?.toString() ?? "";
                    const ownerColor = memberColorMap.get(ownerKey) ?? "";
                    const owner = members.find(
                      (member) => member.userId.toString() === ownerKey,
                    );
                    return (
                      <button
                        key={egg._id}
                        onClick={() => handleToggleEgg(egg._id)}
                        className={`${eggBaseClass} ${ownerColor || unclaimedEggClass}`}
                        title={owner ? `Eaten by ${owner.name}` : "Unclaimed"}
                      >
                        {egg.position + 1}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Start a tray to generate the 30 egg slots.
                </p>
              )}
            </div>

            <div className={`${cardBaseClass} bg-white flex flex-col gap-4`}>
              <h3 className="text-lg font-semibold">Share split</h3>
              <p className="text-sm text-slate-600">
                Each person aims for {TARGET_PER_PERSON} eggs.
              </p>
              <div className="flex flex-col gap-3">
                {members.map((member, index) => {
                  const count = counts[member.userId.toString()] ?? 0;
                  const remaining = Math.max(TARGET_PER_PERSON - count, 0);
                  const color = MEMBER_COLORS[index % MEMBER_COLORS.length];
                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-2xl border-2 border-slate-900 px-3 py-2 shadow-[0_3px_0_0_rgba(15,23,42,0.18)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`${colorDotClass} ${color}`}></span>
                        <span className="text-sm font-medium">
                          {member.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{count} eaten</p>
                        <p className="text-xs text-slate-600">
                          {remaining} remaining
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
