"use client"

import { useState } from "react"
import {
  Search,
  Building,
  User,
  ArrowRight,
  Copy,
  ExternalLink,
  Loader2,
  X,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateXrayQuery, analyzeTeamContent } from "@/app/dark-side-actions"

interface DarkSideWorkflowProps {
  isOpen: boolean
  onClose: () => void
}

export function DarkSideWorkflow({ isOpen, onClose }: DarkSideWorkflowProps) {
  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [xrayQuery, setXrayQuery] = useState("")
  const [teamPageContent, setTeamPageContent] = useState("")
  const [teamAnalysis, setTeamAnalysis] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerateXrayQuery = async () => {
    if (!domain) return

    setIsLoading(true)
    try {
      const result = await generateXrayQuery(domain)
      setXrayQuery(result)
      setStep(2)
    } catch (error) {
      console.error("Error generating X-ray query:", error)
      alert("Er is een fout opgetreden bij het genereren van de X-ray zoekopdracht. Probeer het opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeTeamContent = async () => {
    if (!teamPageContent) return

    setIsLoading(true)
    try {
      const result = await analyzeTeamContent(teamPageContent, domain)
      setTeamAnalysis(result)
      setStep(3)
    } catch (error) {
      console.error("Error analyzing team content:", error)
      alert("Er is een fout opgetreden bij het analyseren van de teampagina. Probeer het opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openGoogleSearch = () => {
    if (!xrayQuery) return
    window.open(`https://www.google.com/search?q=${encodeURIComponent(xrayQuery)}`, "_blank")
  }

  const resetWorkflow = () => {
    setStep(1)
    setDomain("")
    setXrayQuery("")
    setTeamPageContent("")
    setTeamAnalysis("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-hidden flex justify-center">
      <div className="w-full max-w-4xl h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="heading-md text-purple-300 flex items-center gap-2">
            <Search className="h-5 w-5" />
            The Dark Side: X-ray → Mensen vinden op bedrijfswebsites
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-300 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-black/40 backdrop-blur-md p-4 rounded-lg mb-6 border border-purple-800/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900/50 text-purple-300 font-bold">
              {step}
            </div>
            <div>
              <h3 className="text-purple-300 font-medium">
                {step === 1
                  ? "Voer bedrijfsdomein in"
                  : step === 2
                    ? "Gebruik X-ray zoekopdracht"
                    : "Bekijk gevonden medewerkers"}
              </h3>
              <p className="text-purple-400/70 text-sm">
                {step === 1
                  ? "We gebruiken dit om een gerichte X-ray zoekopdracht te maken"
                  : step === 2
                    ? "Zoek in Google en plak de inhoud van een teampagina"
                    : "Hier zijn de medewerkers die we hebben gevonden"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto subtle-scrollbar pr-1 bg-black/20 rounded-lg border border-purple-800/20 p-4">
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="form-label flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4" />
                  Bedrijfsdomein
                </label>
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="bijv. teamleader.eu (zonder www of http://)"
                  className="form-input"
                />
              </div>

              <Button
                onClick={handleGenerateXrayQuery}
                disabled={isLoading || !domain}
                className="w-full btn-primary py-6 rounded-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>X-ray zoekopdracht genereren...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    <span>Genereer X-ray zoekopdracht</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="relative">
                  <pre className="bg-black/40 backdrop-blur-sm p-4 rounded-lg text-green-400 whitespace-pre-wrap overflow-x-auto subtle-scrollbar border border-purple-800/20 text-sm">
                    {xrayQuery}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(xrayQuery)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-purple-900/50 text-purple-300 hover:text-white"
                  >
                    {copied ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span className="text-xs">Gekopieerd</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        <span className="text-xs">Kopiëren</span>
                      </span>
                    )}
                  </Button>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={openGoogleSearch}
                    className="w-full bg-purple-700/80 hover:bg-purple-600 text-white transition-colors shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <span>Bekijk Google-resultaten</span>
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </span>
                  </Button>
                </div>

                <div className="mt-6 bg-amber-900/20 p-4 rounded-lg border border-amber-700/30">
                  <h3 className="text-amber-300 font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Waarom je geen resultaten krijgt
                  </h3>
                  <div className="space-y-3 text-amber-200/90 text-sm">
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-800/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-200">1</span>
                      </div>
                      <p>
                        <strong>Moderne websites gebruiken JavaScript-gedreven content</strong> - Veel bedrijven
                        gebruiken React, Vue of Next.js. Hun team- of contactinformatie wordt dynamisch geladen, niet
                        als pure HTML. Google indexeert die content niet betrouwbaar via X-ray.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-800/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-200">2</span>
                      </div>
                      <p>
                        <strong>Ze gebruiken geen semantische pagina's meer als '/team'</strong> - Moderne bedrijven
                        stoppen info in een modaal, een verborgen scrollsectie, of enkel op LinkedIn. De pagina heeft
                        dan geen intitle:"team" of inurl:team.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-800/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-200">3</span>
                      </div>
                      <p>
                        <strong>Ze gebruiken Engelse keywords waar jij NL toevoegt (en vice versa)</strong> - Soms heet
                        de pagina about-us, leadership, of the-company.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-purple-300 font-medium mb-3">Plak de inhoud van een teampagina</h3>
                <div className="space-y-3">
                  <Textarea
                    value={teamPageContent}
                    onChange={(e) => setTeamPageContent(e.target.value)}
                    placeholder="Plak hier de HTML of tekst van de teampagina..."
                    className="min-h-[150px] form-input subtle-scrollbar"
                  />
                  <Button
                    onClick={handleAnalyzeTeamContent}
                    disabled={isLoading || !teamPageContent}
                    className="w-full bg-purple-700/80 hover:bg-purple-600 text-white"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Inhoud analyseren...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Analyseer teampagina</span>
                      </span>
                    )}
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-800/20">
                  <p className="text-purple-300 text-sm flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">Pro tip:</span> Je kunt de HTML van een pagina bekijken door rechts
                      te klikken en "Bekijk broncode" te selecteren. Kopieer en plak de volledige HTML voor de beste
                      resultaten.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Gevonden medewerkers
                </h3>
                <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-purple-800/20">
                  <div className="whitespace-pre-line text-purple-200">{teamAnalysis}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={resetWorkflow}
                  className="bg-black/30 border-purple-800/20 text-purple-300"
                >
                  Opnieuw beginnen
                </Button>
                <Button
                  onClick={() => copyToClipboard(teamAnalysis)}
                  className="bg-purple-700/80 hover:bg-purple-600 text-white"
                >
                  {copied ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>Gekopieerd</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      <span>Kopieer resultaten</span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
