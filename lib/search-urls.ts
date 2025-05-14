import type { SearchMode } from "@/app/actions"

export function getSearchUrl(platform: string, query: string, mode: SearchMode = "native") {
  const encodedQuery = encodeURIComponent(query)

  if (platform === "linkedin") {
    if (mode === "native") {
      return [
        {
          name: "LinkedIn Search",
          url: `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}`,
        },
      ]
    } else {
      return [
        {
          name: "Google X-ray",
          url: `https://www.google.com/search?q=${encodedQuery}`,
        },
      ]
    }
  }

  // Fallback naar Google
  return [
    {
      name: "Google X-ray",
      url: `https://www.google.com/search?q=${encodedQuery}`,
    },
  ]
}
