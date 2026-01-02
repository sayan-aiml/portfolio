export default async function handler(req, res) {
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

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (!data.data) {
      return res.status(500).send("GitHub API error");
    }

    const weeks =
      data.data.user.contributionsCollection.contributionCalendar.weeks;

    // Build SVG (you already had this logic)
    const svg = generateSVG(weeks); // your existing SVG builder

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);

  } catch (err) {
    res.status(500).send("Server error");
  }
}
