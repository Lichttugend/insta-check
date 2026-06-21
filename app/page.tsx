"use client";

import { useState } from "react";
import {
  Camera,
  Users,
  UserMinus,
  UserPlus,
  Heart,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FileUpload from "./components/FileUpload";
import UserList from "./components/UserList";
import StatsCard from "./components/StatsCard";
import {
  parseFollowers,
  parseFollowing,
  analyzeRelationships,
  AnalysisResult,
} from "./lib/instagram";

export default function Home() {
  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const [followingFile, setFollowingFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  async function readJson(file: File): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          resolve(JSON.parse(e.target?.result as string));
        } catch {
          reject(new Error("JSONの解析に失敗しました"));
        }
      };
      reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
      reader.readAsText(file);
    });
  }

  async function handleAnalyze() {
    if (!followersFile || !followingFile) return;
    setLoading(true);
    setError(null);
    try {
      const [followersJson, followingJson] = await Promise.all([
        readJson(followersFile),
        readJson(followingFile),
      ]);
      const followers = parseFollowers(followersJson);
      const following = parseFollowing(followingJson);

      if (followers.length === 0 && following.length === 0) {
        setError(
          "データを読み込めませんでした。正しいInstagramのエクスポートファイルを選択してください。"
        );
        return;
      }

      setResult(analyzeRelationships(followers, following));
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFollowersFile(null);
    setFollowingFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Insta Check</h1>
          <p className="text-gray-500 text-sm">
            フォロワーとフォロー中を比較して、フォロー返しのない人を確認できます
          </p>
        </div>

        {!result ? (
          <>
            {/* How to Guide */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setShowGuide((v) => !v)}
              >
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Info className="w-4 h-4 text-pink-500" />
                  データの取得方法
                </div>
                {showGuide ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {showGuide && (
                <div className="px-4 pb-4">
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      Instagramアプリで
                      <strong>プロフィール → ハンバーガーメニュー → アカウントセンター</strong>
                      を開く
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>
                        <strong>情報とアクセス許可 → 情報をダウンロード</strong>を選択
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span>
                        形式を<strong>JSON</strong>に設定してリクエスト送信
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>
                        ZIPを展開して{" "}
                        <code className="bg-gray-100 px-1 rounded text-xs">
                          connections/followers_and_following/
                        </code>{" "}
                        フォルダを確認
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      <span>
                        <code className="bg-gray-100 px-1 rounded text-xs">followers_1.json</code>{" "}
                        と{" "}
                        <code className="bg-gray-100 px-1 rounded text-xs">following.json</code>{" "}
                        を下記にアップロード
                      </span>
                    </li>
                  </ol>
                  <p className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                    ファイルはブラウザ内でのみ処理され、サーバーには送信されません。
                  </p>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FileUpload
                label="フォロワー"
                description="followers_1.json をドラッグ＆ドロップ"
                fileName={followersFile?.name ?? null}
                onFile={setFollowersFile}
              />
              <FileUpload
                label="フォロー中"
                description="following.json をドラッグ＆ドロップ"
                fileName={followingFile?.name ?? null}
                onFile={setFollowingFile}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!followersFile || !followingFile || loading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  分析する
                </>
              )}
            </button>
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatsCard
                label="フォロー中"
                value={result.followingCount}
                icon={<UserPlus className="w-6 h-6" />}
                bgColor="bg-blue-50"
                textColor="text-blue-600"
              />
              <StatsCard
                label="フォロワー"
                value={result.followersCount}
                icon={<Users className="w-6 h-6" />}
                bgColor="bg-purple-50"
                textColor="text-purple-600"
              />
              <StatsCard
                label="フォロー返しなし"
                value={result.notFollowingBack.length}
                icon={<UserMinus className="w-6 h-6" />}
                bgColor="bg-red-50"
                textColor="text-red-500"
              />
              <StatsCard
                label="相互フォロー"
                value={result.mutualFollowers.length}
                icon={<Heart className="w-6 h-6" />}
                bgColor="bg-pink-50"
                textColor="text-pink-500"
              />
            </div>

            {/* Lists */}
            <div className="space-y-4">
              <UserList
                title="フォロー返しなし"
                users={result.notFollowingBack}
                mode="unfollow"
                accentColor="bg-red-100"
                icon={<UserMinus className="w-5 h-5 text-red-500" />}
                defaultExpanded={true}
              />
              <UserList
                title="あなたをフォロー中（未フォロー）"
                users={result.notFollowedByYou}
                mode="follow"
                accentColor="bg-blue-100"
                icon={<UserPlus className="w-5 h-5 text-blue-500" />}
                defaultExpanded={false}
              />
              <UserList
                title="相互フォロー"
                users={result.mutualFollowers}
                mode="mutual"
                accentColor="bg-pink-100"
                icon={<Heart className="w-5 h-5 text-pink-500" />}
                defaultExpanded={false}
              />
            </div>

            <button
              onClick={handleReset}
              className="mt-6 w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:border-pink-300 hover:text-pink-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              最初からやり直す
            </button>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          ※ フォローを外す・フォローするボタンはInstagramのプロフィールページを開きます
        </p>
      </div>
    </div>
  );
}
