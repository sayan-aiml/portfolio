export default async function handler(req, res) {
  const USERNAME = process.env.USERNAME;
  const TOKEN = process.env.GITHUB_TOKEN;

  if (!USERNAME || !TOKEN) {
    return res.status(500).send("Missing env vars");
  }

  const query = `
    query {
      user(login: "${USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  const ghRes = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  const json = await ghRes.json();
  const weeks =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;

  if (!weeks) {
    return res.status(500).send("Invalid GitHub response");
  }

  /* ---------- SVG RENDER ---------- */
  const CELL = 12;
  const GAP = 4;
  const ROWS = 7;

  const width = weeks.length * (CELL + GAP);
  const height = ROWS * (CELL + GAP);

  let rects = "";

  weeks.forEach((week, x) => {
    week.contributionDays.forEach((day, y) => {
      rects += `
        <rect
          x="${x * (CELL + GAP)}"
          y="${y * (CELL + GAP)}"
          width="${CELL}"
          height="${CELL}"
          rx="3"
          ry="3"
          fill="${day.color}">
          <title>${day.contributionCount} contributions</title>
        </rect>
      `;
    });
  });

  const svg = `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg">
      ${rects}
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.status(200).send(svg);
}
