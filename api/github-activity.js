export default async function handler(req, res) {
  try {
    const USERNAME = "sayan-aiml";
    const token = process.env.GITHUB_TOKEN;

    const query = `
      query {
        user(login: "${USERNAME}") {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
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
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    const weeks =
      json.data.user.contributionsCollection.contributionCalendar.weeks;

    const cell = 12;
    const gap = 3;
    const rows = 7;

    const width = weeks.length * (cell + gap);
    const height = rows * (cell + gap);

    let svg = `<svg viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg">`;

    weeks.forEach((week, x) => {
      week.contributionDays.forEach((day, y) => {
        svg += `
          <rect
            x="${x * (cell + gap)}"
            y="${y * (cell + gap)}"
            width="${cell}"
            height="${cell}"
            rx="3"
            ry="3"
            fill="${day.color}"
          />
        `;
      });
    });

    svg += "</svg>";

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).send("GitHub activity failed");
  }
}
