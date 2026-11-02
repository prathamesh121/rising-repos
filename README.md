# Rising Repos

A daily snapshot of the most-starred GitHub repositories created in the last 7 days, built from the [GitHub search API](https://docs.github.com/en/rest/search). Each day's top 25 is saved to `data/YYYY/MM/YYYY-MM-DD.md`, so you can look back at what was trending on any date.

## How it works

A GitHub Actions workflow (`.github/workflows/update.yml`) runs `scripts/update.mjs` once a day and commits the new data. The script is plain Node.js 22 with no dependencies.

```bash
node scripts/update.mjs
```

<!-- latest -->
