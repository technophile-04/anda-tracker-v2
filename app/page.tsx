"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Id } from "../convex/_generated/dataModel";

const STORAGE_KEY = "eggtracker:userId";

const cardBaseClass =
  "rounded-3xl border-2 border-slate-900 p-6 shadow-[0_6px_0_0_rgba(15,23,42,0.25)]";
const primaryButtonClass =
  "rounded-full border-2 border-slate-900 bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_0_0_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-amber-300 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none";
const secondaryButtonClass =
  "rounded-full border-2 border-slate-900 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_4px_0_0_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none";
const inputClass =
  "w-full rounded-full border-2 border-slate-900 bg-white px-4 py-2 text-sm shadow-[inset_0_2px_0_0_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-amber-400";
const spinnerClass =
  "h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent";

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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    if (userId && user === null) {
      clearUserId();
    }
  }, [userId, user, clearUserId]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSigningIn) {
      return;
    }
    setError(null);
    setIsSigningIn(true);
    try {
      const newUserId = await createUser({ name: nameInput });
      setUserId(newUserId);
      setNameInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || isCreatingRoom) {
      return;
    }
    setError(null);
    setIsCreatingRoom(true);
    try {
      const newRoomId = await createRoom({ name: roomName, userId });
      setRoomName("");
      router.push(`/room/${newRoomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isJoiningRoom) {
      return;
    }
    setError(null);
    const roomId = parseRoomId(joinInput);
    if (!roomId) {
      setError("Paste a room link or id to join.");
      return;
    }
    setIsJoiningRoom(true);
    setJoinInput("");
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="min-h-screen text-slate-900">
      <div className="max-w-4xl mx-auto p-6 flex flex-col gap-10">
        <header
          className={`${cardBaseClass} bg-amber-100 flex flex-col items-center text-center gap-6`}
        >
          <Image
            src="/logo.svg"
            alt="Anda Tacker Logo"
            width={100}
            height={100}
            className="rounded-2xl shadow-sm"
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-700">
              Anda Tacker
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Anda Tacker — ande ginne ka official audit.
            </h1>
            <p className="text-slate-700 max-w-lg mx-auto">
              Room banao, doston/flatmates ko invite karo, aur dekho kisne kitne
              ande uda liye. "Maine nahi khaya" ab data me hai.
            </p>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border-2 border-red-500 bg-red-100 px-4 py-3 text-sm text-red-700 shadow-[0_4px_0_0_rgba(185,28,28,0.3)]">
            {error}
          </div>
        ) : null}

        {!userId ? (
          <section className={`${cardBaseClass} bg-white`}>
            <h2 className="text-xl font-semibold">Naam daalo, ande ginne do</h2>
            <p className="text-sm text-slate-600 mt-1">
              Bas naam chahiye, Aadhaar nahi. Naam locally save hota hai — "main
              kaun?" ka drama band.
            </p>
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleLogin}>
              <input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
              <button
                type="submit"
                className={primaryButtonClass}
                disabled={isSigningIn}
                aria-busy={isSigningIn}
              >
                {isSigningIn ? (
                  <span className="inline-flex items-center gap-2">
                    <span className={spinnerClass} aria-hidden="true" />
                    Signing in...
                  </span>
                ) : (
                  "Continue"
                )}
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
              <p className="text-xs text-amber-700">
                Sign out karoge to account gaya — wapas nahi milega.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className={`${cardBaseClass} bg-white`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Image src="/crate.svg" alt="" width={24} height={24} />
                  </div>
                  <h3 className="text-lg font-semibold">Your rooms</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Apne anda gang me wapas ghuso.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {rooms === undefined ? (
                    <p className="text-sm text-slate-600">Loading rooms...</p>
                  ) : rooms.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      Abhi koi room nahi. Ek bana ke shuru karo.
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
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Image src="/egg.svg" alt="" width={24} height={24} />
                    </div>
                    <h3 className="text-lg font-semibold">Room banao</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Naya tray banao aur doston/flatmates ko bulao.
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
                    <button
                      type="submit"
                      className={primaryButtonClass}
                      disabled={isCreatingRoom}
                      aria-busy={isCreatingRoom}
                    >
                      {isCreatingRoom ? (
                        <span className="inline-flex items-center gap-2">
                          <span className={spinnerClass} aria-hidden="true" />
                          Creating...
                        </span>
                      ) : (
                        "Create room"
                      )}
                    </button>
                  </form>
                </div>

                <div className="border-t-2 border-dashed border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold">Link se ghuso</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Invite link ya room id chipkao, jaldi join karo.
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
                    <button
                      type="submit"
                      className={secondaryButtonClass}
                      disabled={isJoiningRoom}
                      aria-busy={isJoiningRoom}
                    >
                      {isJoiningRoom ? (
                        <span className="inline-flex items-center gap-2">
                          <span className={spinnerClass} aria-hidden="true" />
                          Joining...
                        </span>
                      ) : (
                        "Join room"
                      )}
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
