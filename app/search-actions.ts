"use server"

import { load } from "cheerio"
import type { Platform } from "./actions"

interface SearchResult {
  id: string
  name: string
  title: string
  location?: string
  snippet: string
  profileUrl: string
  imageUrl?: string
  platform: Platform
}

export async function fetchGoogleResults(
  query: string,
  page = 0,
): Promise<{
  results: SearchResult[]
  hasMore: boolean
}> {
  try {
    // Calculate start parameter for pagination (Google uses multiples of 10)
    const start = page * 10

    // Construct Google search URL with the X-ray query
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&start=${start}`

    // Set user agent to avoid being blocked
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch search results: ${response.status}`)
    }

    const html = await response.text()

    // Use cheerio to parse the HTML
    const $ = load(html)
    const results: SearchResult[] = []

    // Google search results are typically in divs with class 'g'
    $("div.g").each((i, el) => {
      // Extract LinkedIn profile URL
      const linkElement = $(el).find("a[href^='https://www.linkedin.com/in/']")
      const profileUrl = linkElement.attr("href") || ""

      if (!profileUrl || !profileUrl.includes("linkedin.com/in/")) {
        return // Skip non-LinkedIn profile results
      }

      // Extract profile ID from URL
      const profileId = profileUrl.split("/in/")[1]?.split("/")[0] || `result-${i}`

      // Extract title (usually the first h3)
      const titleElement = $(el).find("h3")
      const fullTitle = titleElement.text() || ""

      // Try to extract name from title (usually the first part before " - " or " | ")
      const name = fullTitle.split(" - ")[0] || fullTitle.split(" | ")[0] || fullTitle

      // Extract job title (usually after the name in the title)
      let title = ""
      if (fullTitle.includes(" - ")) {
        title = fullTitle.split(" - ").slice(1).join(" - ")
      } else if (fullTitle.includes(" | ")) {
        title = fullTitle.split(" | ").slice(1).join(" | ")
      }

      // Extract snippet (description text)
      const snippet = $(el).find(".VwiC3b, .yXK7lf").text() || ""

      // Try to extract location from snippet
      let location = ""
      const locationMatch = snippet.match(/(?:Location|Locatie|Located in|Based in|from):\s*([^.]+)/i)
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].trim()
      }

      // Add to results
      results.push({
        id: profileId,
        name,
        title,
        location,
        snippet,
        profileUrl,
        platform: "linkedin",
        // We don't have access to profile images from Google search results
        imageUrl: undefined,
      })
    })

    // Check if there are more results
    const hasMore = $("a#pnnext").length > 0

    return {
      results,
      hasMore,
    }
  } catch (error) {
    console.error("Error fetching Google results:", error)
    return {
      results: [],
      hasMore: false,
    }
  }
}

export async function fetchFacebookResults(
  query: string,
  page = 0,
): Promise<{
  results: SearchResult[]
  hasMore: boolean
}> {
  try {
    // Facebook zoeken is beperkt en vereist authenticatie
    // Dit is een gesimuleerde implementatie die uitgebreid zou moeten worden in een echte applicatie

    // Simuleer een vertraging om een netwerkverzoek na te bootsen
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Genereer mock resultaten op basis van de query
    const results: SearchResult[] = []

    // Haal enkele trefwoorden uit de query om de mock resultaten enigszins relevant te maken
    const keywords = query.toLowerCase().split(/\s+/)
    const jobTitleKeywords = ["engineer", "developer", "manager", "designer", "verpleegkundige", "arts", "consultant"]
    const locationKeywords = ["amsterdam", "rotterdam", "utrecht", "den haag", "eindhoven", "nederland"]
    const companyKeywords = ["google", "microsoft", "philips", "ing", "abn", "rabobank", "albert", "heijn"]

    // Bepaal of er een functietitel, locatie of bedrijf in de query zit
    const hasJobTitle = keywords.some((k) => jobTitleKeywords.some((jk) => k.includes(jk)))
    const hasLocation = keywords.some((k) => locationKeywords.some((lk) => k.includes(lk)))
    const hasCompany = keywords.some((k) => companyKeywords.some((ck) => k.includes(ck)))

    // Als er geen relevante trefwoorden zijn, toon een bericht dat er geen resultaten zijn
    if (!hasJobTitle && !hasLocation && !hasCompany) {
      return {
        results: [],
        hasMore: false,
      }
    }

    // Genereer 3-6 mock resultaten per pagina
    const count = 3 + Math.floor(Math.random() * 3)

    for (let i = 0; i < count; i++) {
      const id = `fb-${page}-${i}`

      // Genereer een willekeurige naam
      const firstNames = ["Jan", "Piet", "Joris", "Emma", "Sophie", "Liam", "Noah", "Olivia", "Daan", "Sem", "Julia"]
      const lastNames = ["de Vries", "Jansen", "Bakker", "Visser", "Smit", "van Dijk", "Meijer", "de Boer", "Mulder"]
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`

      // Genereer een functietitel op basis van trefwoorden in de query
      let title = ""
      if (hasJobTitle) {
        const matchedJobKeyword = keywords.find((k) => jobTitleKeywords.some((jk) => k.includes(jk)))
        if (matchedJobKeyword) {
          if (matchedJobKeyword.includes("engineer") || matchedJobKeyword.includes("developer")) {
            const techTitles = [
              "Software Engineer",
              "Software Developer",
              "Frontend Developer",
              "Backend Engineer",
              "Full Stack Developer",
            ]
            title = techTitles[Math.floor(Math.random() * techTitles.length)]
          } else if (matchedJobKeyword.includes("manager")) {
            const managerTitles = [
              "Project Manager",
              "Product Manager",
              "Marketing Manager",
              "Sales Manager",
              "Account Manager",
            ]
            title = managerTitles[Math.floor(Math.random() * managerTitles.length)]
          } else if (matchedJobKeyword.includes("designer")) {
            const designerTitles = [
              "UX Designer",
              "UI Designer",
              "Product Designer",
              "Graphic Designer",
              "Web Designer",
            ]
            title = designerTitles[Math.floor(Math.random() * designerTitles.length)]
          } else if (matchedJobKeyword.includes("verpleeg") || matchedJobKeyword.includes("arts")) {
            const healthcareTitles = ["Verpleegkundige", "Arts", "Zorgcoördinator", "Medisch Specialist"]
            title = healthcareTitles[Math.floor(Math.random() * healthcareTitles.length)]
          } else {
            title = "Professional"
          }
        }
      } else {
        title = "Professional"
      }

      // Genereer een locatie op basis van trefwoorden in de query
      let location = ""
      if (hasLocation) {
        const matchedLocationKeyword = keywords.find((k) => locationKeywords.some((lk) => k.includes(lk)))
        if (matchedLocationKeyword) {
          if (matchedLocationKeyword.includes("amsterdam")) {
            location = "Amsterdam, Nederland"
          } else if (matchedLocationKeyword.includes("rotterdam")) {
            location = "Rotterdam, Nederland"
          } else if (matchedLocationKeyword.includes("utrecht")) {
            location = "Utrecht, Nederland"
          } else if (matchedLocationKeyword.includes("den haag")) {
            location = "Den Haag, Nederland"
          } else if (matchedLocationKeyword.includes("eindhoven")) {
            location = "Eindhoven, Nederland"
          } else {
            location = "Nederland"
          }
        }
      } else {
        const cities = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven", "Groningen", "Maastricht"]
        location = `${cities[Math.floor(Math.random() * cities.length)]}, Nederland`
      }

      // Genereer een bedrijf op basis van trefwoorden in de query
      let company = ""
      if (hasCompany) {
        const matchedCompanyKeyword = keywords.find((k) => companyKeywords.some((ck) => k.includes(ck)))
        if (matchedCompanyKeyword) {
          if (matchedCompanyKeyword.includes("google")) {
            company = "Google"
          } else if (matchedCompanyKeyword.includes("microsoft")) {
            company = "Microsoft"
          } else if (matchedCompanyKeyword.includes("philips")) {
            company = "Philips"
          } else if (matchedCompanyKeyword.includes("ing")) {
            company = "ING Bank"
          } else if (matchedCompanyKeyword.includes("abn")) {
            company = "ABN AMRO"
          } else if (matchedCompanyKeyword.includes("rabobank")) {
            company = "Rabobank"
          } else if (matchedCompanyKeyword.includes("albert") || matchedCompanyKeyword.includes("heijn")) {
            company = "Albert Heijn"
          }
        }
      } else {
        const companies = ["Google", "Microsoft", "Philips", "ING Bank", "ABN AMRO", "Rabobank", "Albert Heijn"]
        company = companies[Math.floor(Math.random() * companies.length)]
      }

      // Genereer een snippet met relevante informatie
      let snippet = `${name} is een ${title.toLowerCase()} uit ${location}.`

      if (company) {
        snippet += ` Werkt bij ${company}.`
      }

      // Voeg opleiding of andere informatie toe
      const schools = [
        "Universiteit van Amsterdam",
        "Vrije Universiteit",
        "Technische Universiteit Delft",
        "Universiteit Utrecht",
        "Hogeschool van Amsterdam",
      ]

      if (Math.random() > 0.5) {
        const school = schools[Math.floor(Math.random() * schools.length)]
        snippet += ` Gestudeerd aan ${school}.`
      }

      results.push({
        id,
        name,
        title,
        location,
        snippet,
        profileUrl: `https://facebook.com/profile/${id}`,
        platform: "facebook",
        imageUrl: `/placeholder.svg?height=100&width=100&query=profile%20picture`,
      })
    }

    // Altijd meer resultaten voor de eerste paar pagina's
    const hasMore = page < 2

    return {
      results,
      hasMore,
    }
  } catch (error) {
    console.error("Error fetching Facebook results:", error)
    return {
      results: [],
      hasMore: false,
    }
  }
}

export async function fetchResults(
  query: string,
  platform: Platform,
  page = 0,
): Promise<{
  results: SearchResult[]
  hasMore: boolean
}> {
  if (platform === "linkedin") {
    return fetchGoogleResults(query, page)
  } else if (platform === "facebook") {
    return fetchFacebookResults(query, page)
  }

  return {
    results: [],
    hasMore: false,
  }
}
