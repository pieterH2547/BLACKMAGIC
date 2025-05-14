"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { cache } from "react"

// Constanten naar aparte file verplaatsen in een echte implementatie
const PLATFORMS = {
  LINKEDIN: "linkedin",
} as const

export type Platform = keyof typeof PLATFORMS
export type SearchMode = "native" | "xray"

// Voeg deze nieuwe constanten toe aan het begin van het bestand, na de bestaande constanten
const MAX_GOOGLE_QUERY_WORDS = 32
const PLATFORM_LIMITATIONS = {
  [PLATFORMS.LINKEDIN]: {
    xray: `
BELANGRIJKE GOOGLE BEPERKINGEN:
- Google heeft een limiet van ${MAX_GOOGLE_QUERY_WORDS} woorden per zoekopdracht. Langere queries worden afgekapt.
- Overmatig gebruik van haakjes en aanhalingstekens kan leiden tot onvoorspelbare resultaten.
- Complexe combinaties van OR-groepen kunnen problemen veroorzaken.

RICHTLIJNEN VOOR EFFECTIEVE QUERIES:
1. Houd queries KORT en KRACHTIG - maximaal ${MAX_GOOGLE_QUERY_WORDS} woorden
2. Gebruik maximaal 2-3 synoniemen per concept
3. Beperk het aantal OR-groepen
4. Gebruik aanhalingstekens alleen voor essentiële meerdere-woord-termen
5. Gebruik - in plaats van NOT voor uitsluitingen
6. Prioriteer de belangrijkste zoektermen
`,
    native: `
BELANGRIJKE LINKEDIN BEPERKINGEN:
- LinkedIn ondersteunt een beperktere set Boolean operatoren dan Google
- LinkedIn's zoekfunctie werkt ALLEEN met AND, OR, NOT, en aanhalingstekens
- LinkedIn's zoekfunctie heeft een ZEER BEPERKTE lengte voor queries
- LinkedIn's zoekfunctie werkt NIET met wildcards (*) of andere geavanceerde operatoren
- LinkedIn's zoekfunctie werkt NIET goed met complexe geneste haakjes
- LinkedIn's zoekfunctie werkt NIET goed met te veel OR-groepen

RICHTLIJNEN VOOR EFFECTIEVE LINKEDIN QUERIES:
1. Maak ZEER KORTE en EENVOUDIGE queries - maximaal 10-15 woorden
2. Gebruik MAXIMAAL 1 synoniem per concept
3. Gebruik ALLEEN de meest essentiële zoektermen
4. Gebruik ALLEEN aanhalingstekens voor exacte zinnen die essentieel zijn
5. Gebruik NOT in plaats van - voor uitsluitingen
6. Gebruik EENVOUDIGE haakjes voor groepering
7. Beperk het aantal OR-groepen tot maximaal 2-3
8. Focus op de KERN van wat je zoekt, laat details weg
`,
  },
}

// Cache resultaten voor 1 uur
const CACHE_TTL = 60 * 60 * 1000
const queryCache = new Map<string, { result: string; timestamp: number }>()

// Valideer gebruikersinvoer
function validateInput(input: string): string | null {
  if (!input || input.trim().length < 3) {
    return "Query moet minimaal 3 karakters bevatten"
  }
  if (input.length > 5000) {
    return "Query mag maximaal 5000 karakters bevatten"
  }
  return null
}

// Valideer of de gegenereerde query een geldige query lijkt te zijn
function validateQuery(query: string, mode: SearchMode): boolean {
  // Een geldige Boolean query moet minstens een van deze operatoren bevatten
  const containsBooleanOperators = /\b(AND|OR|NOT)\b/.test(query)
  // Een geldige Boolean query moet haakjes of aanhalingstekens bevatten voor groepering
  const containsGrouping = /[()"]/.test(query)

  if (mode === "xray") {
    // Voor LinkedIn X-ray moet het site: bevatten
    return containsBooleanOperators && containsGrouping && query.includes("site:")
  } else {
    // Voor native LinkedIn search mag het GEEN site: bevatten
    return containsBooleanOperators && containsGrouping && !query.includes("site:")
  }
}

// Platform instructies in een aparte constante
const PLATFORM_INSTRUCTIONS = {
  [PLATFORMS.LINKEDIN]: {
    xray: `
Genereer een BEKNOPTE Boolean-zoekopdracht voor LinkedIn X-ray search via Google. Begin ALTIJD met site:linkedin.com/in.

VACATURE ANALYSE:
Als de input een vacaturetekst of link bevat, analyseer deze dan grondig:
1. Identificeer de MUST-HAVE vaardigheden, kwalificaties en vereisten
2. Identificeer de NICE-TO-HAVE vaardigheden en voorkeuren
3. Gebruik de must-haves als primaire zoektermen met AND operator
4. Gebruik de nice-to-haves als secundaire zoektermen met OR operator binnen groepen
5. Negeer irrelevante informatie zoals bedrijfsbeschrijvingen, arbeidsvoorwaarden, etc.

FOCUS OP BEPERKTE, EFFECTIEVE SYNONIEMEN:
- Kies voor elke vaardigheid of concept maximaal 2-3 MEEST RELEVANTE synoniemen
- Voorbeeld: Voor "developer" gebruik ("software developer" OR "software engineer" OR "programmeur")
- Voor technologieën, kies de meest gebruikte termen: (JavaScript OR JS)
- Voor locaties, beperk tot de belangrijkste regio's
- Voor ervaringsniveaus, kies de meest voorkomende termen: ("senior" OR "ervaren")

EFFICIËNTE BOOLEAN STRUCTUUR:
- Gebruik haakjes alleen waar nodig voor duidelijke groepering
- Groepeer gerelateerde concepten samen
- Gebruik wildcards (*) strategisch: develop* in plaats van meerdere varianten
- Prioriteer de belangrijkste zoektermen en laat minder belangrijke weg

GERICHTE UITSLUITINGEN:
- Beperk uitsluitingen tot maximaal 3-5 meest voorkomende irrelevante termen
- Gebruik - in plaats van NOT (Google-vriendelijker)
- Voorbeeld: -recruiter -"talent acquisition" -vacature

VOORBEELD VAN EFFICIËNTE STRUCTUUR:
site:linkedin.com/in ("software developer" OR "software engineer" OR programmeur) 
AND (JavaScript OR React OR frontend) 
AND (senior OR ervaren) 
AND (Nederland OR Amsterdam OR Utrecht) 
-recruiter -"talent acquisition" -vacature
`,
    native: `
Genereer een ZEER EENVOUDIGE en KORTE Boolean-zoekopdracht voor gebruik BINNEN LinkedIn's eigen zoekfunctie.

BELANGRIJKE REGELS:
1. GEBRUIK GEEN site:linkedin.com/in commando's - deze werken NIET in LinkedIn
2. Maak de query EXTREEM KORT - LinkedIn's zoekfunctie werkt slecht met lange queries
3. Gebruik ALLEEN de MEEST ESSENTIËLE zoektermen - maximaal 10-15 woorden in totaal
4. Gebruik MAXIMAAL 1 synoniem per concept
5. Gebruik ALLEEN de belangrijkste vaardigheden en kwalificaties
6. Gebruik EENVOUDIGE haakjes voor groepering
7. Gebruik NOT in plaats van - voor uitsluitingen
8. Beperk het aantal OR-groepen tot maximaal 2-3

VACATURE ANALYSE:
Als de input een vacaturetekst of link bevat:
1. Identificeer ALLEEN de 3-5 MEEST CRUCIALE vaardigheden of kwalificaties
2. Negeer nice-to-haves en secundaire vaardigheden volledig
3. Focus op de KERN van de functie, niet op details

VOORBEELD VAN EFFECTIEVE LINKEDIN QUERY:
("software engineer" OR developer) AND (JavaScript OR React) AND Nederland NOT recruiter

Dit is een IDEALE lengte voor LinkedIn - kort, krachtig en gericht op alleen het essentiële.
`,
  },
}

// Voeg deze functie toe om het aantal woorden in een query te tellen
function countQueryWords(query: string): number {
  // Verwijder speciale tekens die geen woorden zijn
  const cleanedQuery = query.replace(/["()]/g, "")
  // Split op witruimte en filter lege strings
  const words = cleanedQuery.split(/\s+/).filter((word) => word.length > 0)
  return words.length
}

// Voeg deze functie toe om te controleren of een query te lang is
function isQueryTooLong(query: string): boolean {
  return countQueryWords(query) > MAX_GOOGLE_QUERY_WORDS
}

// Voeg deze functie toe om een waarschuwing toe te voegen aan te lange queries
function addWarningToLongQuery(query: string, explanation = ""): { query: string; explanation: string } {
  if (isQueryTooLong(query)) {
    const wordCount = countQueryWords(query)
    const warningMessage = `⚠️ WAARSCHUWING: Deze query bevat ${wordCount} woorden, wat meer is dan de Google-limiet van ${MAX_GOOGLE_QUERY_WORDS} woorden. Dit kan leiden tot onvolledige resultaten. Overweeg de query te vereenvoudigen of op te splitsen in meerdere zoekopdrachten.`

    return {
      query,
      explanation: warningMessage + (explanation ? "\n\n" + explanation : ""),
    }
  }

  return { query, explanation }
}

// Voeg deze functie toe na de addWarningToLongQuery functie
function simplifyQuery(query: string): string {
  if (!isQueryTooLong(query)) {
    return query
  }

  // Stap 1: Verwijder overbodige witruimte
  let simplified = query.replace(/\s+/g, " ").trim()

  // Stap 2: Vervang meerdere OR-termen door wildcards waar mogelijk
  // Bijvoorbeeld: ("software developer" OR "software engineer" OR "software programmer") -> "software develop*"
  const orPatterns = simplified.match(/$$[^)]*OR[^)]*$$/g) || []

  for (const orPattern of orPatterns) {
    // Zoek naar patronen met veel OR-termen
    if ((orPattern.match(/OR/g) || []).length >= 3) {
      // Zoek naar gemeenschappelijke woorden in de OR-groep
      const terms = orPattern
        .replace(/[()]/g, "")
        .split(/\s+OR\s+/)
        .map((term) => term.replace(/"/g, "").trim())

      // Vind gemeenschappelijke woorden aan het begin
      const commonPrefix = findCommonPrefix(terms)

      if (commonPrefix && commonPrefix.split(/\s+/).length >= 1) {
        // Vervang de OR-groep door een wildcard-term
        const wildcardTerm = `"${commonPrefix}*"`
        simplified = simplified.replace(orPattern, wildcardTerm)
      }
    }
  }

  // Stap 3: Beperk het aantal uitsluitingen
  const exclusions = simplified.match(/-[^-\s]+/g) || []
  if (exclusions.length > 5) {
    // Behoud alleen de eerste 5 uitsluitingen
    const exclusionsToKeep = exclusions.slice(0, 5)
    // Verwijder alle uitsluitingen uit de query
    let withoutExclusions = simplified
    exclusions.forEach((excl) => {
      withoutExclusions = withoutExclusions.replace(excl, "")
    })
    // Voeg de te behouden uitsluitingen weer toe
    simplified = withoutExclusions.trim() + " " + exclusionsToKeep.join(" ")
  }

  // Stap 4: Als de query nog steeds te lang is, verwijder de minst belangrijke termen
  if (isQueryTooLong(simplified)) {
    // Split de query in delen op basis van AND
    const parts = simplified.split(/\s+AND\s+/)

    // Behoud de eerste delen (belangrijkste) en verwijder de laatste (minst belangrijke)
    // tot de query onder de woordlimiet komt
    while (parts.length > 2 && isQueryTooLong(parts.join(" AND "))) {
      parts.pop()
    }

    simplified = parts.join(" AND ")
  }

  return simplified.trim()
}

// Helper functie om gemeenschappelijke prefixen te vinden
function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return ""

  // Split elke string in woorden
  const wordArrays = strings.map((s) => s.split(/\s+/))

  // Vind de kortste array lengte
  const minLength = Math.min(...wordArrays.map((arr) => arr.length))

  // Zoek naar gemeenschappelijke woorden aan het begin
  const commonWords = []

  for (let i = 0; i < minLength; i++) {
    const currentWord = wordArrays[0][i]
    const allMatch = wordArrays.every((arr) => arr[i].toLowerCase() === currentWord.toLowerCase())

    if (allMatch) {
      commonWords.push(currentWord)
    } else {
      break
    }
  }

  return commonWords.join(" ")
}

// Fouttypen
enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  API_KEY_MISSING = "API_KEY_MISSING",
  API_ERROR = "API_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Gestructureerde foutrespons
interface ErrorResponse {
  type: ErrorType
  message: string
}

// Gestructureerde succesrespons
interface SuccessResponse {
  query: string
  explanation?: string
}

// Type voor de response
type ActionResponse = SuccessResponse | ErrorResponse

// Helper om te checken of het een foutrespons is
function isErrorResponse(response: ActionResponse): response is ErrorResponse {
  return "type" in response
}

// Rate limiting - eenvoudige implementatie
const userRequests = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS_PER_MINUTE = 5

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userRecord = userRequests.get(userId)

  if (!userRecord || userRecord.resetTime < now) {
    userRequests.set(userId, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (userRecord.count >= MAX_REQUESTS_PER_MINUTE) {
    return false
  }

  userRecord.count += 1
  return true
}

// Gecachede versie van de API call
const cachedGenerateText = cache(async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const cacheKey = `${systemPrompt}:${userPrompt}`

  // Check cache
  const cachedItem = queryCache.get(cacheKey)
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL) {
    console.log("Cache hit for query:", userPrompt)
    return cachedItem.result
  }

  // Make API call
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7, // Verhoogd van 0.3 naar 0.7 voor meer creativiteit met synoniemen
    max_tokens: 3000, // Verhoogd om nog langere, uitgebreidere queries mogelijk te maken
  })

  // Cache result
  queryCache.set(cacheKey, { result: text, timestamp: Date.now() })

  return text
})

export default async function GenerateBooleanAction(
  userInput: string,
  platform: Platform = "linkedin",
  mode: SearchMode = "native",
  userId = "anonymous",
): Promise<ActionResponse> {
  try {
    // Valideer input
    const validationError = validateInput(userInput)
    if (validationError) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: validationError,
      }
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return {
        type: ErrorType.API_KEY_MISSING,
        message: "OpenAI API key is niet geconfigureerd. Voeg deze toe aan je omgevingsvariabelen.",
      }
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return {
        type: ErrorType.RATE_LIMIT_ERROR,
        message: "Je hebt de limiet van verzoeken bereikt. Probeer het over een minuut opnieuw.",
      }
    }

    // Detecteer of de input een vacaturetekst of link is
    const isJobDescription =
      userInput.length > 200 ||
      userInput.includes("functie") ||
      userInput.includes("vacature") ||
      userInput.includes("job description") ||
      userInput.includes("requirements") ||
      userInput.includes("qualifications") ||
      userInput.includes("verantwoordelijkheden") ||
      userInput.includes("wij bieden") ||
      userInput.includes("wij zoeken") ||
      userInput.includes("must have") ||
      userInput.includes("nice to have")

    // Bouw system prompt
    const systemPrompt = `
Je bent blackmagic.AI, een ultra-intelligente sourcing copilot. Je vertaalt vage of gewone input van mensen in briljant geformuleerde zoekopdrachten. Je begrijpt zoekbedoelingen en denkt proactief mee met recruiters en sourcers.

${PLATFORM_INSTRUCTIONS[platform][mode]}
${PLATFORM_LIMITATIONS[platform][mode]}

Gedrag:
- Vul automatisch aan met relevante criteria en contextuele informatie
- Corrigeer slordige input of fouten
- Denk mensgericht, maar output-gericht
- Gebruik altijd geldige Boolean syntax: AND, OR, NOT, haakjes (), aanhalingstekens ""
${mode === "native" ? "- Maak ZEER KORTE en EENVOUDIGE Boolean strings met MINIMALE synoniemen" : "- Maak UITGEBREIDE Boolean strings met VEEL synoniemen en alternatieven"}
- Gebruik altijd juiste groepering met haakjes voor OR-statements
- Gebruik altijd aanhalingstekens rond meerdere woorden
${mode === "xray" ? "- Gebruik wildcards (*) waar van toepassing voor flexibiliteit" : "- Gebruik GEEN wildcards (*) - deze werken niet in LinkedIn's native zoekfunctie"}
${mode === "native" ? "- Houd de query EXTREEM KORT - LinkedIn werkt slecht met lange queries" : "- Maak LANGE en GEDETAILLEERDE queries met veel alternatieven voor elk concept"}
${
  isJobDescription
    ? `
- BELANGRIJK: De input lijkt een vacaturetekst te zijn. Analyseer deze grondig:
  ${
    mode === "native"
      ? "1. Identificeer ALLEEN de 3-5 MEEST CRUCIALE vaardigheden of kwalificaties\n  2. Negeer nice-to-haves en secundaire vaardigheden volledig\n  3. Focus op de KERN van de functie, niet op details"
      : "1. Identificeer de MUST-HAVE vaardigheden, kwalificaties en vereisten\n  2. Identificeer de NICE-TO-HAVE vaardigheden en voorkeuren\n  3. Gebruik de must-haves als primaire zoektermen met AND operator\n  4. Gebruik de nice-to-haves als secundaire zoektermen met OR operator binnen groepen\n  5. Negeer irrelevante informatie zoals bedrijfsbeschrijvingen, arbeidsvoorwaarden, etc."
  }
`
    : ""
}

BELANGRIJK: Je MOET de DAADWERKELIJKE zoekopdracht direct teruggeven. GEEN placeholder tekst, GEEN uitleg vooraf, GEEN "Hier is je zoekopdracht:". Begin je antwoord DIRECT met de zoekopdracht.

Outputformaat:
Eerste regel: ALLEEN de daadwerkelijke zoekopdracht, niets anders
Tweede regel (optioneel): Een korte uitleg in max. 1 zin
${
  isJobDescription
    ? `
Derde regel (optioneel): Lijst van geïdentificeerde must-haves en nice-to-haves uit de vacature
`
    : ""
}
`

    // Maak API call met caching
    const resultText = await cachedGenerateText(systemPrompt, userInput)

    // Parse result en zorg voor betere foutafhandeling
    const lines = resultText.split("\n").filter((line) => line.trim())

    // Controleer of we een resultaat hebben
    if (lines.length === 0) {
      return {
        type: ErrorType.API_ERROR,
        message: "De AI genereerde geen output. Probeer het opnieuw met een specifiekere beschrijving.",
      }
    }

    // Controleer of de output niet de placeholder tekst bevat
    let query = lines[0] || ""
    if (
      query.includes("[Boolean") ||
      query.includes("[boolean") ||
      query.includes("Hier is") ||
      query.includes("hier is") ||
      query.toLowerCase().includes("boolean string") ||
      query.toLowerCase().includes("zoekstring") ||
      query.toLowerCase().includes("zoek string")
    ) {
      return {
        type: ErrorType.API_ERROR,
        message: "De AI gaf een ongeldige zoekopdracht terug. Probeer het opnieuw met een specifiekere beschrijving.",
      }
    }

    // Platform-specifieke validatie
    if (mode === "xray" && !query.includes("site:")) {
      // Probeer de volgende regel als deze er meer als een Boolean query uitziet
      if (lines.length > 1 && lines[1].includes("site:")) {
        query = lines[1]
        // Als we de tweede regel gebruiken, gebruik dan de derde regel als uitleg (indien beschikbaar)
        return {
          query: query,
          explanation: lines[2] || undefined,
        }
      }
    } else if (mode === "native" && query.includes("site:")) {
      // Als we in native mode zitten maar toch een site: commando hebben, verwijder dit
      query = query.replace(/site:linkedin\.com\/in\s*/g, "")
    }

    // Controleer of de query een geldige query lijkt te zijn
    if (!validateQuery(query, mode)) {
      return {
        type: ErrorType.API_ERROR,
        message: `De gegenereerde Boolean query lijkt niet geldig te zijn. Probeer het opnieuw met een specifiekere beschrijving.`,
      }
    }

    // Combineer de uitleg en de must-haves/nice-to-haves als die er zijn
    let explanation = lines[1] || ""
    if (isJobDescription && lines.length > 2) {
      explanation += "\n\n" + lines.slice(2).join("\n")
    }

    // Controleer of de query te lang is (alleen voor X-ray mode)
    if (mode === "xray" && isQueryTooLong(query)) {
      // Probeer de query te vereenvoudigen
      const simplifiedQuery = simplifyQuery(query)

      // Voeg een waarschuwing toe aan de uitleg
      let updatedExplanation = explanation || ""

      if (isQueryTooLong(simplifiedQuery)) {
        // Als de query nog steeds te lang is, voeg een waarschuwing toe
        const wordCount = countQueryWords(query)
        const warningMessage = `⚠️ WAARSCHUWING: De oorspronkelijke query bevatte ${wordCount} woorden, wat meer is dan de Google-limiet van ${MAX_GOOGLE_QUERY_WORDS} woorden. We hebben geprobeerd deze te vereenvoudigen, maar de query is nog steeds te lang. Dit kan leiden tot onvolledige resultaten.`
        updatedExplanation = warningMessage + (updatedExplanation ? "\n\n" + updatedExplanation : "")

        return {
          query: simplifiedQuery,
          explanation: updatedExplanation,
        }
      } else {
        // Als de vereenvoudigde query binnen de limiet valt
        const wordCount = countQueryWords(query)
        const simplifiedWordCount = countQueryWords(simplifiedQuery)
        const warningMessage = `ℹ️ OPMERKING: De oorspronkelijke query bevatte ${wordCount} woorden, wat meer is dan de Google-limiet van ${MAX_GOOGLE_QUERY_WORDS} woorden. We hebben deze vereenvoudigd tot ${simplifiedWordCount} woorden voor betere resultaten.`
        updatedExplanation = warningMessage + (updatedExplanation ? "\n\n" + updatedExplanation : "")

        return {
          query: simplifiedQuery,
          explanation: updatedExplanation,
        }
      }
    } else {
      // Query is binnen de limiet, geen aanpassingen nodig
      return {
        query: query,
        explanation: explanation || undefined,
      }
    }
  } catch (error) {
    console.error("Error in GenerateBooleanAction:", error)

    // Categoriseer fouten
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return {
          type: ErrorType.RATE_LIMIT_ERROR,
          message: "OpenAI API rate limiet bereikt. Probeer het later opnieuw.",
        }
      }

      if (error.message.includes("API key")) {
        return {
          type: ErrorType.API_KEY_MISSING,
          message: "Ongeldige of ontbrekende OpenAI API key.",
        }
      }

      return {
        type: ErrorType.API_ERROR,
        message: `API fout: ${error.message}`,
      }
    }

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: "Er is een onbekende fout opgetreden bij het genereren van de zoekopdracht.",
    }
  }
}

// Functie om een vacature-URL te fetchen en de inhoud te extraheren
export async function fetchJobDescription(url: string): Promise<string | ErrorResponse> {
  try {
    // Valideer URL
    if (!url || !url.startsWith("http")) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: "Ongeldige URL. Zorg ervoor dat de URL begint met http:// of https://",
      }
    }

    try {
      // Gebruik onze eigen proxy-route om CORS-problemen te vermijden
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          type: ErrorType.API_ERROR,
          message: errorData.error || `Fout bij het ophalen van de vacature: ${response.status} ${response.statusText}`,
        }
      }

      const data = await response.json()

      if (!data.text) {
        return {
          type: ErrorType.API_ERROR,
          message: "Geen vacaturetekst gevonden op de opgegeven URL",
        }
      }

      // Als dit een fallback-response is, voeg dan een waarschuwing toe
      if (data.isFallback) {
        return data.text
      }

      return data.text
    } catch (fetchError) {
      console.error("Error fetching from proxy:", fetchError)

      // Als de proxy-route niet werkt, geef dan een duidelijke foutmelding
      return {
        type: ErrorType.API_ERROR,
        message:
          "Er is een probleem met het ophalen van de vacature. Probeer de vacaturetekst direct te kopiëren en plakken in het tekstveld.",
      }
    }
  } catch (error) {
    console.error("Error in fetchJobDescription:", error)
    return {
      type: ErrorType.API_ERROR,
      message: `Fout bij het ophalen van de vacature: ${error instanceof Error ? error.message : "Onbekende fout"}. Probeer de vacaturetekst direct te kopiëren en plakken.`,
    }
  }
}
