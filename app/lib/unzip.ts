import JSZip from "jszip";
import { parseFollowers, parseFollowing, InstagramUser } from "./instagram";

export interface ExtractedData {
  followers: InstagramUser[];
  following: InstagramUser[];
  errors: string[];
}

export async function extractInstagramZip(file: File): Promise<ExtractedData> {
  const zip = await JSZip.loadAsync(file);
  const errors: string[] = [];

  // followers_1.json, followers_2.json, ... を収集してマージ
  const followerFiles = Object.keys(zip.files)
    .filter((name) => /connections\/followers_and_following\/followers_\d+\.json$/i.test(name))
    .sort();

  // following.json を収集
  const followingFiles = Object.keys(zip.files).filter((name) =>
    /connections\/followers_and_following\/following\.json$/i.test(name)
  );

  if (followerFiles.length === 0) {
    errors.push(
      "followers_1.json が見つかりませんでした。connections/followers_and_following/ フォルダが含まれているか確認してください。"
    );
  }
  if (followingFiles.length === 0) {
    errors.push("following.json が見つかりませんでした。");
  }

  const followers: InstagramUser[] = [];
  for (const name of followerFiles) {
    try {
      const text = await zip.files[name].async("text");
      followers.push(...parseFollowers(JSON.parse(text)));
    } catch {
      errors.push(`${name} の読み込みに失敗しました`);
    }
  }

  const following: InstagramUser[] = [];
  for (const name of followingFiles) {
    try {
      const text = await zip.files[name].async("text");
      following.push(...parseFollowing(JSON.parse(text)));
    } catch {
      errors.push(`${name} の読み込みに失敗しました`);
    }
  }

  return { followers, following, errors };
}
