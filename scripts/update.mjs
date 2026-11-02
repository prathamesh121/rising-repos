// Finds the most-starred GitHub repos created in the last 7 days and saves them as a daily report.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const TOP_N = 25;
const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);

const headers = { Accept: "application/vnd.github+json", "User-Agent": "rising-repos" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const query = encodeURIComponent(`created:>=${weekAgo}`);
const res = await fetch(
  `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=${TOP_N}`,
  { headers },
);
if (!res.ok) throw new Error(`GitHub search failed: ${res.status} ${await res.text()}`);
const { items } = await res.json();

const esc = (s) => (s ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const rows = items.map(
  (r, i) =>
    `| ${i + 1} | [${r.full_name}](${r.html_url}) | ${esc(r.description).slice(0, 120)} | ${r.language ?? "-"} | ${r.stargazers_count.toLocaleString("en-US")} |`,
);
const report = [
  `# Rising repos: ${today}`,
  "",
  `Most-starred repositories created since ${weekAgo}.`,
  "",
  "| # | Repo | Description | Language | Stars |",
  "|---|---|---|---|---|",
  ...rows,
  "",
].join("\n");

const [y, m] = today.split("-");
const path = `data/${y}/${m}/${today}.md`;
await mkdir(`data/${y}/${m}`, { recursive: true });
await writeFile(path, report);

// Show today's top 10 in the README.
const marker = "<!-- latest -->";
const readme = await readFile("README.md", "utf8");
const top = ["| # | Repo | Language | Stars |", "|---|---|---|---|"].concat(
  items.slice(0, 10).map(
    (r, i) => `| ${i + 1} | [${r.full_name}](${r.html_url}) | ${r.language ?? "-"} | ${r.stargazers_count.toLocaleString("en-US")} |`,
  ),
);
await writeFile(
  "README.md",
  `${readme.split(marker)[0]}${marker}\n## Today (${today})\n\n${top.join("\n")}\n\n[Full report](${path})\n`,
);
console.log(`Saved ${items.length} repos to ${path}`);
