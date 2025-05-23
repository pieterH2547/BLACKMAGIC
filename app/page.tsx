"use client"

import { useState, useEffect } from "react"
import { Copy, Wand2, Linkedin, Search, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExampleQueries } from "@/components/example-queries"
import { BooleanInfo } from "@/components/boolean-info"
import { FileUploadTextarea } from "@/components/file-upload-textarea"
import GenerateBooleanAction, { type Platform, type SearchMode } from "@/app/actions"
import { getSearchUrl } from "@/lib/search-urls"

export default function Home() {
  const [userInput, setUserInput] = useState("")
  const [booleanQuery, setBooleanQuery] = useState("")
  const [explanation, setExplanation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [platform, setPlatform] = useState<Platform>("linkedin")
  const [searchMode, setSearchMode] = useState<SearchMode>("native") // Default to native
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()

  // Animation effect on page load
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGenerate = async () => {
    if (!userInput.trim()) return

    setIsLoading(true)
    setBooleanQuery("") // Reset de query tijdens het laden
    setExplanation("") // Reset de uitleg tijdens het laden
    setIsError(false) // Reset de foutmelding tijdens het laden

    try {
      const response = await GenerateBooleanAction(userInput, platform, searchMode)

      if ("type" in response) {
        // Het is een foutrespons
        setIsError(true)
        setErrorMessage(response.message)
        setBooleanQuery("")
        setExplanation("")
      } else {
        // Het is een succesrespons
        setIsError(false)
        setBooleanQuery(response.query)
        setExplanation(response.explanation || "")
      }
    } catch (error) {
      console.error("Error generating query:", error)
      setIsError(true)
      setErrorMessage(`Fout: ${error instanceof Error ? error.message : "Onbekende fout"}`)
      setBooleanQuery("")
      setExplanation("")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(booleanQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const searchOnPlatform = (url: string) => {
    if (!booleanQuery) return
    window.open(url, "_blank")
  }

  const handleSelectExample = (query: string) => {
    setUserInput(query)
  }

  // Genereer zoek-URLs voor het huidige platform
  const searchUrls = booleanQuery ? getSearchUrl(platform, booleanQuery, searchMode) : []

  // Handle file or URL upload success
  const handleUploadSuccess = (content: string, source: string) => {
    setUserInput(content)
    setFileName(source)
  }

  // Toggle search mode
  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === "native" ? "xray" : "native"))
    // Reset query when changing modes
    setBooleanQuery("")
    setExplanation("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-purple-950 text-white">
      <div
        className={`container mx-auto px-4 py-8 max-w-4xl transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            Blackmagic.AI Sourcing
          </h1>
          <p className="text-purple-200/90 max-w-2xl mx-auto">
            Transformeer natuurlijke taal in krachtige Boolean zoekopdrachten
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border border-purple-800/20 p-5 h-full">
              <h2 className="text-lg font-medium mb-4 text-purple-300 flex items-center gap-2">
                <Linkedin className="h-5 w-5" />
                LinkedIn Search
              </h2>
              <ExampleQueries
                platform={platform}
                searchMode={searchMode}
                onSelectExample={handleSelectExample}
                currentQuery={booleanQuery}
              />
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/40 border border-purple-800/20 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-purple-300 flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Boolean Generator
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSearchMode}
                  className={`text-xs border-purple-800/30 hover:bg-purple-900/30 ${
                    searchMode === "native"
                      ? "bg-purple-900/20 text-purple-200"
                      : "bg-transparent text-purple-300 hover:text-purple-200"
                  }`}
                >
                  {searchMode === "native" ? "LinkedIn Search" : "X-ray"}
                </Button>
              </div>

              {/* Search mode info */}
              <div className="mb-4 p-3 bg-purple-900/20 border border-purple-800/30 rounded-md flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-300">
                  <p className="font-medium mb-1">{searchMode === "native" ? "LinkedIn Search" : "X-ray"}</p>
                  <p>
                    {searchMode === "native"
                      ? "Genereert korte, eenvoudige Boolean queries voor gebruik binnen LinkedIn's eigen zoekfunctie. Geen site: commando's."
                      : "Genereert uitgebreide Boolean queries voor Google X-ray search met site:linkedin.com/in commando's."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-200">
                    Beschrijf je ideale kandidaat of upload een vacature
                  </label>
                  <FileUploadTextarea
                    value={userInput}
                    onChange={setUserInput}
                    onUploadSuccess={handleUploadSuccess}
                    placeholder="Beschrijf je ideale kandidaat of upload een vacature of geef de link naar een vacature"
                    className="min-h-[150px] bg-black/40 border-purple-800/20 text-white placeholder:text-purple-400/70"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full bg-purple-700 hover:bg-purple-600 text-white py-2"
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Genereren...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      <span>Genereer Boolean-zoekopdracht</span>
                    </span>
                  )}
                </Button>
              </div>
            </Card>

            {(booleanQuery || isError) && (
              <Card className="bg-black/40 border border-purple-800/20 p-5">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-medium text-purple-300 flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Resultaat
                  </h2>
                  {booleanQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="text-purple-300 hover:text-white"
                    >
                      {copied ? (
                        <span className="flex items-center text-green-400">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Gekopieerd
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Copy className="h-4 w-4 mr-2" />
                          Kopiëren
                        </span>
                      )}
                    </Button>
                  )}
                </div>

                {isError ? (
                  <div className="bg-red-900/20 border border-red-700/30 p-4 rounded-md text-red-300">
                    <p className="font-medium mb-2">Fout bij het genereren van de zoekopdracht</p>
                    <p className="text-sm opacity-90">{errorMessage}</p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <pre className="bg-black/40 p-4 rounded-md text-green-400 whitespace-pre-wrap overflow-x-auto border border-purple-800/20 text-sm">
                        {booleanQuery}
                      </pre>
                    </div>

                    {explanation && (
                      <div className="mt-4 text-sm text-purple-300 bg-black/20 p-4 rounded-md border border-purple-800/20">
                        <div className="whitespace-pre-line">{explanation}</div>
                      </div>
                    )}

                    {/* Zoekopties */}
                    <div className="mt-4 space-y-3">
                      <h3 className="text-sm font-medium text-purple-300">Zoeken op:</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchUrls.map((searchOption, index) => (
                          <Button
                            key={index}
                            onClick={() => searchOnPlatform(searchOption.url)}
                            className="bg-purple-700 hover:bg-purple-600 text-white"
                            size="sm"
                          >
                            <span className="flex items-center">
                              <Linkedin className="h-4 w-4 mr-2" />
                              {searchOption.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-purple-800/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-purple-300/70">
              <p>&copy; {currentYear} Blackmagic.AI. Alle rechten voorbehouden.</p>
            </div>
            <div className="text-xs text-purple-300/50">
              <p>
                Ontwikkeld door Blackmagic.AI |{" "}
                <a href="#" className="hover:text-purple-300 underline">
                  Gebruiksvoorwaarden
                </a>{" "}
                |{" "}
                <a href="#" className="hover:text-purple-300 underline">
                  Privacybeleid
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>

      <BooleanInfo />
    </main>
  )
}
