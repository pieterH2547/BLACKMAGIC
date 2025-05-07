"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Paperclip, FileText, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FileUploadTextareaProps {
  value: string
  onChange: (value: string) => void
  onUploadSuccess?: (content: string, source: string) => void
  placeholder?: string
  className?: string
}

export function FileUploadTextarea({
  value,
  onChange,
  onUploadSuccess,
  placeholder,
  className,
}: FileUploadTextareaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [showDirectInputTip, setShowDirectInputTip] = useState(false)
  const [lastProcessedUrl, setLastProcessedUrl] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setFileName(file.name)

    try {
      // Voor tekstbestanden
      if (file.type === "text/plain") {
        const text = await file.text()
        onChange(text)
        if (onUploadSuccess) {
          onUploadSuccess(text, `Bestand: ${file.name}`)
        }
      } else {
        alert(
          "Alleen tekstbestanden (.txt) worden ondersteund in deze demo. In een volledige implementatie zouden ook PDF en Word documenten ondersteund worden.",
        )
      }
    } catch (error) {
      console.error("Error reading file:", error)
      alert("Er is een fout opgetreden bij het lezen van het bestand.")
    } finally {
      setIsLoading(false)
      // Reset de file input zodat dezelfde file opnieuw kan worden gekozen
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handlePaperclipClick = () => {
    fileInputRef.current?.click()
  }

  // Verbeterde URL-detectie functie
  const isValidUrl = (text: string): boolean => {
    // Controleer of de tekst een URL-patroon bevat
    const urlPattern =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i

    // Controleer of de tekst een URL is en niet te lang (om te voorkomen dat we hele vacatureteksten als URL beschouwen)
    return urlPattern.test(text.trim()) && text.trim().length < 500
  }

  // Functie om URL uit tekst te extraheren
  const extractUrl = (text: string): string | null => {
    const urlPattern =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i
    const match = text.match(urlPattern)
    return match ? match[0] : null
  }

  // Functie om vacature van URL op te halen
  const fetchJobFromUrl = async (url: string) => {
    setIsLoading(true)
    try {
      const result = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`)
      }

      const data = await result.json()

      if (data.text) {
        onChange(data.text)
        const urlSource = `URL: ${new URL(url).hostname}`
        setFileName(urlSource)
        setLastProcessedUrl(url)

        if (onUploadSuccess) {
          onUploadSuccess(data.text, urlSource)
        }

        if (data.text.includes("OPMERKING:") || data.text.includes("We konden de vacature niet ophalen")) {
          setShowDirectInputTip(true)
        }
      } else {
        alert(`Fout bij het ophalen van de URL: ${data.error || "Onbekende fout"}`)
        setShowDirectInputTip(true)
      }
    } catch (error) {
      console.error("Error fetching URL:", error)
      alert(
        `Er is een fout opgetreden bij het ophalen van de URL: ${error instanceof Error ? error.message : "Onbekende fout"}`,
      )
      setShowDirectInputTip(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Functie om te detecteren of de ingevoerde tekst een URL is
  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    onChange(text)

    // Controleer of de ingevoerde tekst een URL is
    if (text.trim().startsWith("http")) {
      const url = extractUrl(text.trim())

      // Als we een URL hebben gevonden en deze nog niet eerder hebben verwerkt
      if (url && url !== lastProcessedUrl && isValidUrl(url)) {
        // Het lijkt een URL te zijn, vraag de gebruiker of ze de inhoud willen ophalen
        const confirmFetch = window.confirm(
          "Het lijkt erop dat je een URL naar een vacature hebt geplakt. Wil je de vacaturetekst van deze URL ophalen?",
        )

        if (confirmFetch) {
          await fetchJobFromUrl(url)
        } else {
          // Als de gebruiker niet wil ophalen, markeer deze URL toch als verwerkt
          setLastProcessedUrl(url)
        }
      }
    }
  }

  // Functie om een URL direct te verwerken (voor paste events)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text")

    // Als de geplakte tekst een URL is en deze nog niet eerder is verwerkt
    if (pastedText.trim().startsWith("http") && isValidUrl(pastedText.trim())) {
      const url = extractUrl(pastedText.trim())

      if (url && url !== lastProcessedUrl) {
        // Voorkom standaard plakgedrag
        e.preventDefault()

        // Vraag de gebruiker of ze de inhoud willen ophalen
        const confirmFetch = window.confirm(
          "Het lijkt erop dat je een URL naar een vacature hebt geplakt. Wil je de vacaturetekst van deze URL ophalen?",
        )

        if (confirmFetch) {
          await fetchJobFromUrl(url)
        } else {
          // Als de gebruiker niet wil ophalen, plak dan alsnog de URL
          onChange(value + pastedText)
          // Markeer deze URL als verwerkt
          setLastProcessedUrl(url)
        }
      }
    }
  }

  return (
    <div className="relative">
      {showDirectInputTip && (
        <div className="mb-2 p-3 bg-amber-900/20 border border-amber-700/30 rounded-md flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-xs font-medium">Tip: Direct kopiëren en plakken</p>
            <p className="text-amber-200/80 text-xs mt-1">
              Voor het beste resultaat kun je de vacaturetekst direct kopiëren en plakken in het tekstveld hieronder.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-300 hover:text-amber-100 hover:bg-amber-800/30 p-1 h-auto"
            onClick={() => setShowDirectInputTip(false)}
          >
            ×
          </Button>
        </div>
      )}

      <Textarea
        value={value}
        onChange={handleInputChange}
        onPaste={handlePaste}
        placeholder={
          placeholder || "Beschrijf je ideale kandidaat of upload een vacature of geef de link naar een vacature"
        }
        className={`pr-12 ${className}`}
      />

      {fileName && (
        <div className="absolute top-2 right-12 bg-purple-900/50 text-purple-200 text-xs py-1 px-2 rounded-md flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          {fileName}
        </div>
      )}

      <div className="absolute right-3 bottom-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePaperclipClick}
                disabled={isLoading}
                className="h-8 w-8 rounded-full bg-purple-800/30 hover:bg-purple-700/50 text-purple-300 hover:text-white"
                aria-label="Upload vacaturetekst"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/90 border-purple-800/30 text-purple-100">
              <p>Upload vacaturetekst (.txt)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" className="hidden" />
    </div>
  )
}
