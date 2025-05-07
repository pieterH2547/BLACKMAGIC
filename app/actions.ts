"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export type Platform = "linkedin" | "facebook"

const SYSTEM_PROMPT = `
Je bent een AI assistent die Boolean zoekopdrachten genereert. Je ontvangt een beschrijving van een ideale kandidaat en je genereert een Boolean zoekopdracht die gebruikt kan worden om deze kandidaat te vinden op LinkedIn.

De zoekopdracht moet de volgende criteria bevatten:
- Functietitels
- Vaardigheden
- Ervaring
- Opleiding
- Locatie

De zoekopdracht moet de volgende Boolean operatoren gebruiken:
- AND
- OR
- NOT
- ""
- ()

De zoekopdracht moet de volgende X-ray zoek operatoren gebruiken:
- site:
- intitle:
- inurl:

De zoekopdracht moet zo specifiek mogelijk zijn.

Geef ALLEEN de Boolean query terug, geen uitleg of context.
`

async function GenerateBooleanAction(
  userInput: string,
  platform: Platform,
): Promise<{ query: string; explanation?: string } | { type: string; message: string }> {
  try {
    const prompt = `Genereer een Boolean zoekopdracht voor de volgende beschrijving van een ideale kandidaat: ${userInput}. Het platform is ${platform}.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 1000,
    })

    return { query: text }
  } catch (error) {
    console.error("Error generating boolean query:", error)
    return { type: "API_ERROR", message: "Failed to generate boolean query." }
  }
}

export async function FineTuneQueryAction(
  query: string,
  platform: Platform,
): Promise<{ query: string } | { type: string; message: string }> {
  try {
    const systemPrompt = `Je bent een AI assistent die Boolean zoekopdrachten verfijnt voor ${platform}. 
    Je ontvangt een Boolean zoekopdracht en je geeft een verbeterde versie van de zoekopdracht terug.
    
    Tips voor het verfijnen van Boolean zoekopdrachten:
    * Gebruik meer specifieke zoektermen
    * Gebruik meer synoniemen waar nuttig
    * Optimaliseer Boolean operatoren (AND, OR, NOT)
    * Verwijder irrelevante zoektermen
    * Gebruik meer specifieke zoekoperatoren (site:, intitle:, inurl:)
    * Zorg voor correcte syntax en spatiëring
    * Groepeer gerelateerde termen met haakjes
    * Gebruik aanhalingstekens voor exacte woordgroepen
    
    Geef ALLEEN de verbeterde Boolean query terug, geen uitleg of context.`

    const userPrompt = `Verfijn de volgende Boolean zoekopdracht: ${query}`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.5,
      max_tokens: 1000,
    })

    return { query: text }
  } catch (error) {
    console.error("Error in FineTuneQueryAction:", error)
    return { type: "API_ERROR", message: "Er is een fout opgetreden bij het verfijnen van de zoekopdracht." }
  }
}

export default GenerateBooleanAction
export type { Platform }
