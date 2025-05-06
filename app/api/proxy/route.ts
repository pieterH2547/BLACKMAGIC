import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Fallback vacaturetekst voor als fetch mislukt
const FALLBACK_JOB_DESCRIPTIONS = [
  `Functietitel: Senior Software Engineer

Functieomschrijving:
Wij zijn op zoek naar een ervaren Senior Software Engineer om ons ontwikkelteam te versterken. Je zult werken aan uitdagende projecten en bijdragen aan de ontwikkeling van onze kernproducten.

Must-haves:
- Minimaal 5 jaar ervaring met software ontwikkeling
- Diepgaande kennis van JavaScript/TypeScript
- Ervaring met React en Node.js
- Kennis van moderne frontend frameworks en libraries
- Ervaring met RESTful API's en GraphQL
- Goede communicatieve vaardigheden in Nederlands en Engels
- Probleemoplossend vermogen en analytisch denken

Nice-to-haves:
- Ervaring met Next.js en serverless architecturen
- Kennis van AWS of Azure cloud diensten
- Ervaring met CI/CD pipelines
- Kennis van containerisatie (Docker, Kubernetes)
- Ervaring met microservices architectuur
- Affiniteit met UX/UI design
- Agile/Scrum werkervaring`,

  `Functietitel: Data Scientist

Functieomschrijving:
Voor onze afdeling Data Analytics zoeken wij een gedreven Data Scientist die complexe datasets kan analyseren en inzichten kan omzetten in concrete aanbevelingen.

Must-haves:
- MSc of PhD in Data Science, Statistiek, Wiskunde of vergelijkbaar
- Minimaal 3 jaar ervaring als Data Scientist
- Uitstekende kennis van Python en R
- Ervaring met machine learning algoritmes en statistische modellen
- Kennis van SQL en NoSQL databases
- Ervaring met data visualisatie tools
- Sterke analytische en probleemoplossende vaardigheden

Nice-to-haves:
- Ervaring in de financiële of e-commerce sector
- Kennis van big data technologieën (Hadoop, Spark)
- Ervaring met deep learning frameworks (TensorFlow, PyTorch)
- Kennis van NLP en computer vision
- Ervaring met cloud platforms (AWS, GCP, Azure)
- Publicaties in relevante vakgebieden`,

  `Functietitel: UX/UI Designer

Functieomschrijving:
Wij zoeken een creatieve UX/UI Designer die gebruikerservaringen kan ontwerpen die zowel intuïtief als visueel aantrekkelijk zijn voor onze digitale producten.

Must-haves:
- Minimaal 3 jaar ervaring als UX/UI Designer
- Portfolio met relevante projecten
- Ervaring met design tools zoals Figma, Sketch en Adobe Creative Suite
- Kennis van user-centered design principes
- Ervaring met het maken van wireframes, prototypes en user flows
- Begrip van responsive design en toegankelijkheid
- Goede communicatieve vaardigheden

Nice-to-haves:
- Ervaring met front-end ontwikkeling (HTML, CSS, JavaScript)
- Kennis van design systems
- Ervaring met usability testing
- Begrip van animatie en interactie design
- Ervaring in een agile werkomgeving
- Affiniteit met branding en visual identity`,
]

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Ongeldige URL. Zorg ervoor dat de URL begint met http:// of https://" },
        { status: 400 },
      )
    }

    try {
      // Probeer de URL te fetchen, maar met een korte timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 seconden timeout

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()

      // Gebruik AI om de relevante vacaturetekst te extraheren
      try {
        const { text } = await generateText({
          model: openai("gpt-4o"),
          system: `
Je bent een expert in het extraheren van vacatureteksten uit HTML. 
Haal de relevante vacaturetekst uit de gegeven HTML, inclusief:
- Functietitel
- Functieomschrijving
- Vereisten (must-haves)
- Wenselijke kwalificaties (nice-to-haves)
- Verantwoordelijkheden
- Gewenste ervaring en opleiding

Verwijder irrelevante informatie zoals:
- Navigatiemenu's
- Footers
- Cookieberichten
- Algemene bedrijfsinformatie
- Sollicitatieprocedures
- Arbeidsvoorwaarden

Geef ALLEEN de geëxtraheerde vacaturetekst terug, geen HTML of opmaak.
`,
          prompt: html,
          temperature: 0.3,
          max_tokens: 2000,
        })

        return NextResponse.json({ text })
      } catch (error) {
        console.error("Error extracting job description with AI:", error)
        // Als AI-extractie mislukt, stuur dan de ruwe HTML terug
        return NextResponse.json({
          text: `Kon de vacaturetekst niet automatisch extraheren. Ruwe HTML: ${html.slice(0, 1000)}...`,
        })
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)

      // Gebruik een willekeurige fallback vacaturetekst
      const randomIndex = Math.floor(Math.random() * FALLBACK_JOB_DESCRIPTIONS.length)
      const fallbackText = FALLBACK_JOB_DESCRIPTIONS[randomIndex]

      // Voeg een notitie toe dat dit een fallback is
      const fallbackMessage = `
OPMERKING: We konden de vacature niet ophalen van de opgegeven URL. 
Dit is een voorbeeld van een vacaturetekst om de functionaliteit te demonstreren.
Je kunt ook de vacaturetekst direct kopiëren en plakken in het tekstveld.

${fallbackText}
`

      return NextResponse.json({
        text: fallbackMessage,
        isFallback: true,
      })
    }
  } catch (error) {
    console.error("Error in proxy route:", error)

    // Gebruik een willekeurige fallback vacaturetekst als er een algemene fout optreedt
    const randomIndex = Math.floor(Math.random() * FALLBACK_JOB_DESCRIPTIONS.length)
    const fallbackText = FALLBACK_JOB_DESCRIPTIONS[randomIndex]

    return NextResponse.json({
      text: `
OPMERKING: Er is een fout opgetreden bij het verwerken van de URL. 
Dit is een voorbeeld van een vacaturetekst om de functionaliteit te demonstreren.
Je kunt ook de vacaturetekst direct kopiëren en plakken in het tekstveld.

${fallbackText}
`,
      isFallback: true,
    })
  }
}
