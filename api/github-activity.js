export default async function handler(req, res) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const USERNAME = "sayan-aiml";

    const query = `
      query {
        user(login: "${USERNAME}") {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!data.data) {
      return res.status(500).send("GitHub API error");
    }

    const weeks =
      data.data.user.contributionsCollection.contributionCalendar.weeks;

    // Build SVG
    let svg = `<svg width="720" height="110" viewBox="0 0 720 110" xmlns="http://www.w3.org/2000/svg">`;

    let x = 0;
    weeks.forEach(week => {
      let y = 0;
      week.contributionDays.forEach(day => {
        const c = day.contributionCount;
        let color = "#ebedf0";
        if (c > 0) color = "#9be9a8";
        if (c > 3) color = "#40c463";
        if (c > 6) color = "#30a14e";
        if (c > 10) color = "#216e39";

        svg += `<rect x="${x}" y="${y}" width="10" height="10" rx="3" ry="3" fill="${color}" />`;
        y += 12;
      });
      x += 12;
    });

    svg += `</svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).send("Server error");
  }
}
