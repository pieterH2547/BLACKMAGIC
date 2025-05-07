export function getSearchUrl(platform: string, query: string) {
  const encodedQuery = encodeURIComponent(query)

  if (platform === "linkedin") {
    return [
      {
        name: "Google X-ray Search",
        url: `https://www.google.com/search?q=${encodedQuery}`,
      },
      {
        name: "LinkedIn Recruiter (indien beschikbaar)",
        url: `https://www.linkedin.com/talent/search?keywords=${encodedQuery.replace(/site:linkedin\.com\/in\s*/i, "")}`,
      },
    ]
  }

  // Fallback naar Google
  return [
    {
      name: "Google X-ray Search",
      url: `https://www.google.com/search?q=${encodedQuery}`,
    },
  ]
}
