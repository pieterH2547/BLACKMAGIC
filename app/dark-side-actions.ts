"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Functie om een X-ray zoekopdracht te genereren voor een specifiek bedrijfsdomein
export async function generateXrayQuery(domain: string): Promise<string> {
  try {
    const xrayPrompt = `
Genereer een Google X-ray zoekopdracht om de medewerkers- of teaminformatie te vinden van het bedrijf met de volgende website: ${domain}. 
Gebruik enkel structuurgerichte filters zoals inurl of intitle. 
Voeg geen functietitels of e-mailadressen toe.

Geef ALLEEN de pure Boolean query terug, zonder uitleg of context. Bijvoorbeeld:
site:teamleader.eu (intitle:"team" OR intitle:"about us" OR inurl:team OR inurl:about OR inurl:staff OR inurl:people OR inurl:company)

Zorg ervoor dat je ALLEEN de query teruggeeft, geen inleidende tekst, geen uitleg, geen aanhalingstekens eromheen.
`

    const xrayResult = await generateText({
      model: openai("gpt-4o"),
      system:
        "Je bent een expert in het maken van Google X-ray zoekopdrachten. Je geeft ALLEEN de pure query terug zonder extra tekst.",
      prompt: xrayPrompt,
      temperature: 0.3,
    })

    // Verwijder eventuele aanhalingstekens, backticks of andere opmaak die het model mogelijk toevoegt
    let cleanedResult = xrayResult.text.trim()
    cleanedResult = cleanedResult.replace(/^```[\w]*\n?/, "").replace(/```$/, "") // Verwijder code blocks
    cleanedResult = cleanedResult.replace(/^["'`]/, "").replace(/["'`]$/, "") // Verwijder aanhalingstekens

    return cleanedResult
  } catch (error) {
    console.error("Error generating X-ray query:", error)
    throw new Error("Er is een fout opgetreden bij het genereren van de X-ray zoekopdracht.")
  }
}

// Functie om de inhoud van een teampagina te analyseren
export async function analyzeTeamContent(content: string, domain: string): Promise<string> {
  try {
    const analysisPrompt = `
Analyseer de volgende webpagina. Geef een lijst van de mensen die op deze pagina vermeld worden, inclusief hun naam, functie en eventueel contactinfo. Beperk je tot wat zichtbaar is.

Gebruik het volgende format:

### 🧑 Team van [Bedrijfsnaam]

1. [Voornaam Achternaam] – [Functie] – [Email indien beschikbaar]
2. [Voornaam Achternaam] – [Functie] – [Email indien beschikbaar]
...

Als er geen duidelijke medewerkers te vinden zijn, geef dan aan dat er geen teamleden gevonden konden worden en suggereer alternatieve zoekstrategieën.

Hier is de inhoud van de webpagina:

${content}
`

    const analysisResult = await generateText({
      model: openai("gpt-4o"),
      system:
        "Je bent een expert in het analyseren van webpagina's om informatie over teamleden en medewerkers te extraheren.",
      prompt: analysisPrompt,
      temperature: 0.5,
      maxTokens: 1500,
    })

    return analysisResult.text
  } catch (error) {
    console.error("Error analyzing team content:", error)
    throw new Error("Er is een fout opgetreden bij het analyseren van de teampagina.")
  }
}
