export interface InstagramUser {
  username: string;
  href: string;
  timestamp: number;
}

interface StringListEntry {
  href: string;
  value: string;
  timestamp: number;
}

interface RawEntry {
  title: string;
  media_list_data: unknown[];
  string_list_data: StringListEntry[];
}

export interface AnalysisResult {
  notFollowingBack: InstagramUser[];
  notFollowedByYou: InstagramUser[];
  mutualFollowers: InstagramUser[];
  followingCount: number;
  followersCount: number;
}

function parseEntries(entries: RawEntry[]): InstagramUser[] {
  return entries.flatMap((entry) =>
    entry.string_list_data.map((item) => ({
      username: item.value,
      href: item.href || `https://www.instagram.com/${item.value}/`,
      timestamp: item.timestamp,
    }))
  );
}

export function parseFollowers(json: unknown): InstagramUser[] {
  if (Array.isArray(json)) {
    return parseEntries(json as RawEntry[]);
  }
  return [];
}

export function parseFollowing(json: unknown): InstagramUser[] {
  if (Array.isArray(json)) {
    return parseEntries(json as RawEntry[]);
  }
  if (json && typeof json === "object" && "relationships_following" in json) {
    const obj = json as { relationships_following: RawEntry[] };
    return parseEntries(obj.relationships_following);
  }
  return [];
}

export function analyzeRelationships(
  followers: InstagramUser[],
  following: InstagramUser[]
): AnalysisResult {
  const followerSet = new Set(followers.map((u) => u.username));
  const followingSet = new Set(following.map((u) => u.username));

  const notFollowingBack = following.filter((u) => !followerSet.has(u.username));
  const notFollowedByYou = followers.filter((u) => !followingSet.has(u.username));
  const mutualFollowers = following.filter((u) => followerSet.has(u.username));

  return {
    notFollowingBack,
    notFollowedByYou,
    mutualFollowers,
    followingCount: following.length,
    followersCount: followers.length,
  };
}
