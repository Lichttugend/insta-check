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
  FileArchive,
  CheckCircle,
} from "lucide-react";
import UserList from "./components/UserList";
import StatsCard from "./components/StatsCard";
import { analyzeRelationships, AnalysisResult } from "./lib/instagram";
import { extractInstagramZip } from "./lib/unzip";

type UploadMode = "zip" | "json";

export default function Home() {
  const [mode, setMode] = useState<UploadMode>("zip");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const [followingFile, setFollowingFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [dragging, setDragging] = useState(false);

  const canAnalyze =
    mode === "zip" ? !!zipFile : !!followersFile && !!followingFile;

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
    setLoading(true);
    setErrors([]);
    try {
      if (mode === "zip" && zipFile) {
        const { followers, following, errors: extractErrors } = await extractInstagramZip(zipFile);
        if (extractErrors.length > 0) {
          setErrors(extractErrors);
          if (followers.length === 0 && following.length === 0) return;
        }
        setResult(analyzeRelationships(followers, following));
      } else if (followersFile && followingFile) {
        const { parseFollowers, parseFollowing } = await import("./lib/instagram");
        const [followersJson, followingJson] = await Promise.all([
          readJson(followersFile),
          readJson(followingFile),
        ]);
        const followers = parseFollowers(followersJson);
        const following = parseFollowing(followingJson);
        if (followers.length === 0 && following.length === 0) {
          setErrors(["データを読み込めませんでした。正しいInstagramのエクスポートファイルを選択してください。"]);
          return;
        }
        setResult(analyzeRelationships(followers, following));
      }
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "不明なエラーが発生しました"]);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setZipFile(null);
    setFollowersFile(null);
    setFollowingFile(null);
    setResult(null);
    setErrors([]);
  }

  function handleZipDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".zip")) setZipFile(file);
  }

  function handleJsonFile(type: "followers" | "following", file: File) {
    if (type === "followers") setFollowersFile(file);
    else setFollowingFile(file);
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
            {/* Guide */}
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
                    {[
                      <>Instagramアプリで<strong>プロフィール → ≡ → アカウントセンター</strong>を開く</>,
                      <><strong>情報とアクセス許可 → 情報をダウンロード</strong>を選択</>,
                      <>形式を<strong>JSON</strong>に設定してリクエスト送信</>,
                      <>数分〜数時間後に届くメールのリンクからZIPをダウンロード</>,
                      <>ダウンロードした<strong>ZIPファイルをそのままアップロード</strong>（解凍不要）</>,
                    ].map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                    ファイルはブラウザ内でのみ処理され、サーバーには送信されません。
                  </p>
                </div>
              )}
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === "zip"
                    ? "bg-white shadow text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setMode("zip")}
              >
                ZIPファイル
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === "json"
                    ? "bg-white shadow text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setMode("json")}
              >
                JSONファイル（個別）
              </button>
            </div>

            {/* Upload Area */}
            {mode === "zip" ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 text-center mb-6 ${
                  dragging
                    ? "border-pink-500 bg-pink-50"
                    : zipFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50/30"
                }`}
                onClick={() => document.getElementById("zip-input")?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleZipDrop}
              >
                <input
                  id="zip-input"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setZipFile(f);
                  }}
                />
                {zipFile ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-700">{zipFile.name}</p>
                    <p className="text-xs text-green-500 mt-1">
                      {(zipFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">
                      ZIPファイルをドラッグ＆ドロップ
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      またはクリックしてファイルを選択
                    </p>
                    <p className="text-xs text-gray-300 mt-3">
                      解凍不要・そのままアップロードできます
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {(["followers", "following"] as const).map((type) => {
                  const file = type === "followers" ? followersFile : followingFile;
                  const label = type === "followers" ? "フォロワー" : "フォロー中";
                  const hint = type === "followers" ? "followers_1.json" : "following.json";
                  return (
                    <div
                      key={type}
                      className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer text-center transition-all ${
                        file
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50/30"
                      }`}
                      onClick={() => document.getElementById(`json-${type}`)?.click()}
                    >
                      <input
                        id={`json-${type}`}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleJsonFile(type, f);
                        }}
                      />
                      {file ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="font-semibold text-green-700 text-sm">{label}</p>
                          <p className="text-xs text-green-500 truncate">{file.name}</p>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                            <span className="text-gray-500 text-xs font-bold">JSON</span>
                          </div>
                          <p className="font-semibold text-gray-700 text-sm">{label}</p>
                          <p className="text-xs text-gray-400">{hint}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 space-y-1">
                {errors.map((e, i) => (
                  <p key={i} className="text-sm text-red-600">{e}</p>
                ))}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || loading}
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
