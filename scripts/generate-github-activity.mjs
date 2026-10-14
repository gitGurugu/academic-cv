// Generate static/uploads/github-activity.json from a user's GitHub contribution calendar.
//
// Usage: GITHUB_TOKEN=... node scripts/generate-github-activity.mjs [login]
// The login defaults to `github_user` in content/_index.md, then to the repository owner.
// The site still builds if this fails: the activity panel then shows "unavailable".

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const OUTPUT = "static/uploads/github-activity.json";
const HOME_PAGE = "content/_index.md";

// Single source of truth: the `github_user` key of the biography block on the home page.
async function loginFromHomePage() {
  try {
    const text = await readFile(HOME_PAGE, "utf8");
    return text.match(/^\s*github_user:\s*["']?([\w-]+)["']?\s*$/m)?.[1];
  } catch {
    return undefined;
  }
}

const login = process.argv[2] || (await loginFromHomePage()) || process.env.GITHUB_REPOSITORY_OWNER;
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

async function main() {
  if (!login) throw new Error("No GitHub login: pass one as an argument or set GITHUB_USER");
  if (!token) throw new Error("No token: set GITHUB_TOKEN or GH_TOKEN");

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "academic-cv" },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!response.ok) throw new Error(`GitHub API responded with HTTP ${response.status}`);

  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map((e) => e.message).join("; "));
  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`No contribution data for user "${login}"`);

  const days = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => ({ date: day.date, count: day.contributionCount }));

  const output = {
    generatedAt: new Date().toISOString(),
    user: login,
    total: calendar.totalContributions,
    days,
  };

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT}: ${days.length} days, ${calendar.totalContributions} contributions for ${login}`);
}

main().catch((error) => {
  // Never fail the site build because of the activity graph.
  console.warn(`generate-github-activity: skipped (${error.message})`);
});
