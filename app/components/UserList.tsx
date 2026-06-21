"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import UserCard from "./UserCard";
import { InstagramUser } from "../lib/instagram";

interface UserListProps {
  title: string;
  users: InstagramUser[];
  mode: "unfollow" | "follow" | "mutual";
  accentColor: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
}

export default function UserList({
  title,
  users,
  mode,
  accentColor,
  icon,
  defaultExpanded = true,
}: UserListProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(defaultExpanded);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${accentColor}`}>{icon}</div>
          <div className="text-left">
            <h2 className="font-bold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500">{users.length}人</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {users.length > 5 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ユーザー名で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              {search ? "該当なし" : "データなし"}
            </p>
          ) : (
            <div className="grid gap-2 max-h-96 overflow-y-auto pr-1">
              {filtered.map((user) => (
                <UserCard key={user.username} user={user} mode={mode} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
