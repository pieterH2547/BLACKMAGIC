export function getSearchUrl(platform: string, query: string) {
  const encodedQuery = encodeURIComponent(query)

  if (platform === "linkedin") {
    return [
      {
        name: "Google X-ray",
        url: `https://www.google.com/search?q=${encodedQuery}`,
      },
      {
        name: "LinkedIn Recruiter",
        url: `https://www.linkedin.com/talent/search?searchContextId=YOUR_CONTEXT_ID&searchHistoryId=YOUR_HISTORY_ID&searchRequestId=YOUR_REQUEST_ID&query=${encodedQuery}`,
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
