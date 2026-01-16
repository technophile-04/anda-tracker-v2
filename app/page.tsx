"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Id } from "../convex/_generated/dataModel";

const STORAGE_KEY = "eggtracker:userId";

const cardBaseClass =
  "rounded-3xl border-2 border-slate-900 p-6 shadow-[0_6px_0_0_rgba(15,23,42,0.25)]";
const primaryButtonClass =
  "rounded-full border-2 border-slate-900 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_0_0_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-amber-300 active:translate-y-0.5 active:shadow-none";
const secondaryButtonClass =
  "rounded-full border-2 border-slate-900 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_0_0_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none";
const inputClass =
  "w-full rounded-full border-2 border-slate-900 bg-white px-4 py-2 text-sm shadow-[inset_0_2px_0_0_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-amber-400";

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

function parseRoomId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const roomIndex = parts.indexOf("room");
    if (roomIndex >= 0 && parts[roomIndex + 1]) {
      return parts[roomIndex + 1];
    }
  } catch {
    const match = trimmed.match(/room\/([A-Za-z0-9_-]+)/);
    if (match) {
      return match[1];
    }
  }

  return trimmed;
}

export default function Home() {
  const router = useRouter();
  const { userId, setUserId, clearUserId } = useStoredUserId();
  const user = useQuery(api.myFunctions.getUser, userId ? { userId } : "skip");
  const rooms = useQuery(
    api.myFunctions.listRooms,
    userId ? { userId } : "skip",
  );
  const createUser = useMutation(api.myFunctions.createUser);
  const createRoom = useMutation(api.myFunctions.createRoom);

  const [nameInput, setNameInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      return;
    }
    setError(null);
    try {
      const newRoomId = await createRoom({ name: roomName, userId });
      setRoomName("");
      router.push(`/room/${newRoomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room.");
    }
  };

  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const roomId = parseRoomId(joinInput);
    if (!roomId) {
      setError("Paste a room link or id to join.");
      return;
    }
    setJoinInput("");
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="min-h-screen text-slate-900">
      <div className="max-w-4xl mx-auto p-6 flex flex-col gap-10">
        <header className={`${cardBaseClass} bg-amber-100`}>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">
            Egg Crate Tracker
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Share a tray, mark your eggs, stay even.
          </h1>
          <p className="text-slate-700">
            Create a room, invite your friend, and track who eats each of the 30
            eggs in the crate.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl border-2 border-red-500 bg-red-100 px-4 py-3 text-sm text-red-700 shadow-[0_4px_0_0_rgba(185,28,28,0.3)]">
            {error}
          </div>
        ) : null}

        {!userId ? (
          <section className={`${cardBaseClass} bg-white`}>
            <h2 className="text-xl font-semibold">Sign in with a name</h2>
            <p className="text-sm text-slate-600 mt-1">
              We keep it lightweight. Your name is saved locally for quick
              access.
            </p>
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
        ) : user === undefined ? (
          <div className="text-sm text-slate-700">Loading your profile...</div>
        ) : (
          <section className="flex flex-col gap-6">
            <div className={`${cardBaseClass} bg-white flex flex-col gap-3`}>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Signed in as
                </p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              <button onClick={clearUserId} className={secondaryButtonClass}>
                Sign out
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className={`${cardBaseClass} bg-white`}>
                <h3 className="text-lg font-semibold">Your rooms</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Jump back into a tray you already share.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {rooms === undefined ? (
                    <p className="text-sm text-slate-600">Loading rooms...</p>
                  ) : rooms.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      No rooms yet. Create one to get started.
                    </p>
                  ) : (
                    rooms.map((room) => (
                      <Link
                        key={room.id}
                        href={`/room/${room.id}`}
                        className="rounded-2xl border-2 border-slate-900 bg-white px-4 py-3 shadow-[0_4px_0_0_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-amber-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{room.name}</p>
                            <p className="text-xs text-slate-500">
                              {room.memberCount} member
                              {room.memberCount === 1 ? "" : "s"}
                            </p>
                          </div>
                          <span className="text-sm text-slate-600">Open →</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className={`${cardBaseClass} bg-white flex flex-col gap-6`}>
                <div>
                  <h3 className="text-lg font-semibold">Create a room</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Start a new tray and invite your partner.
                  </p>
                  <form
                    className="mt-4 flex flex-col gap-3"
                    onSubmit={handleCreateRoom}
                  >
                    <input
                      value={roomName}
                      onChange={(event) => setRoomName(event.target.value)}
                      placeholder="Room name"
                      className={inputClass}
                    />
                    <button type="submit" className={primaryButtonClass}>
                      Create room
                    </button>
                  </form>
                </div>

                <div className="border-t-2 border-dashed border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold">Join with a link</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Paste an invite link or room id to join quickly.
                  </p>
                  <form
                    className="mt-4 flex flex-col gap-3"
                    onSubmit={handleJoin}
                  >
                    <input
                      value={joinInput}
                      onChange={(event) => setJoinInput(event.target.value)}
                      placeholder="https://.../room/abc123"
                      className={inputClass}
                    />
                    <button type="submit" className={secondaryButtonClass}>
                      Join room
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
