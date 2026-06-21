"use client";

import { ExternalLink, UserMinus, UserPlus } from "lucide-react";
import { InstagramUser } from "../lib/instagram";

interface UserCardProps {
  user: InstagramUser;
  mode: "unfollow" | "follow" | "mutual";
}

export default function UserCard({ user, mode }: UserCardProps) {
  const initials = user.username.slice(0, 2).toUpperCase();
  const colors = [
    "from-pink-400 to-rose-500",
    "from-purple-400 to-indigo-500",
    "from-orange-400 to-pink-500",
    "from-cyan-400 to-blue-500",
    "from-green-400 to-teal-500",
  ];
  const colorIndex =
    user.username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    colors.length;
  const gradient = colors[colorIndex];

  function handleAction(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(user.href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white text-xs font-bold">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate text-sm">@{user.username}</p>
        <p className="text-xs text-gray-400">
          {mode === "unfollow"
            ? "フォロー返しなし"
            : mode === "follow"
            ? "あなたをフォロー中"
            : "相互フォロー"}
        </p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <a
          href={user.href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="プロフィールを開く"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        {mode === "unfollow" && (
          <button
            onClick={handleAction}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
            title="フォローを外す（Instagramで開きます）"
          >
            <UserMinus className="w-3.5 h-3.5" />
            外す
          </button>
        )}
        {mode === "follow" && (
          <button
            onClick={handleAction}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
            title="フォローする（Instagramで開きます）"
          >
            <UserPlus className="w-3.5 h-3.5" />
            フォロー
          </button>
        )}
      </div>
    </div>
  );
}
