export function getSearchUrl(platform: string, query: string) {
  const encodedQuery = encodeURIComponent(query)

  if (platform === "linkedin") {
    return [
      {
        name: "Google X-ray",
        url: `https://www.google.com/search?q=${encodedQuery}`,
      },
      {
        name: "LinkedIn Search",
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}`,
      },
    ]
  }

  // Fallback naar Google
  return [
    {
      name: "Google X-ray",
      url: `https://www.google.com/search?q=${encodedQuery}`,
    },
  ]
}
