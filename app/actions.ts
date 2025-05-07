"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export type Platform = "linkedin" | "facebook"

const SYSTEM_PROMPT = `
Je bent een AI assistent die Boolean zoekopdrachten genereert specifiek voor LinkedIn profielen. Je ontvangt een beschrijving van een ideale kandidaat en je genereert een Boolean zoekopdracht die gebruikt kan worden om deze kandidaat te vinden via Google X-ray search op LinkedIn.

De zoekopdracht MOET ALTIJD beginnen met "site:linkedin.com/in" om alleen LinkedIn profielen te vinden.

De zoekopdracht moet de volgende criteria bevatten:
- Functietitels (gebruik intitle: voor belangrijke functietitels)
- Vaardigheden en expertise
- Ervaring (jaren of specifieke technologieën)
- Opleiding (indien relevant)
- Locatie (indien relevant)

De zoekopdracht moet de volgende Boolean operatoren correct gebruiken:
- AND (gebruik hoofdletters)
- OR (gebruik hoofdletters)
- NOT (gebruik hoofdletters of - teken)
- "" (gebruik aanhalingstekens voor exacte woordgroepen)
- () (gebruik haakjes voor groepering)

Zorg voor correcte syntax:
- Gebruik spaties tussen operatoren en zoektermen
- Gebruik geen spaties tussen - en het woord dat je wilt uitsluiten
- Gebruik haakjes voor complexe groeperingen

Voorbeelden van goede queries:
- site:linkedin.com/in ("software engineer" OR "software developer") AND (java OR kotlin) AND amsterdam -recruiter -"talent acquisition"
- site:linkedin.com/in intitle:developer AND (python OR javascript) AND "5+ years" AND "bachelor degree" -intern -internship

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
