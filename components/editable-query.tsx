"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Edit, Wand2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FineTuneQueryAction } from "@/app/actions"
import type { Platform } from "@/app/actions"

interface EditableQueryProps {
  query: string
  onQueryChange: (newQuery: string) => void
  platform?: Platform
  className?: string
}

export function EditableQuery({ query, onQueryChange, platform = "linkedin", className = "" }: EditableQueryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuery, setEditedQuery] = useState(query)
  const [copied, setCopied] = useState(false)
  const [isFinetuning, setIsFinetuning] = useState(false)
  const [finetuneError, setFinetuneError] = useState<string | null>(null)

  // Update editedQuery when the original query changes
  useEffect(() => {
    setEditedQuery(query)
  }, [query])

  const handleSaveEdit = () => {
    onQueryChange(editedQuery)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedQuery(query)
    setIsEditing(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFineTune = async () => {
    setIsFinetuning(true)
    setFinetuneError(null)

    try {
      const result = await FineTuneQueryAction(editedQuery, platform)

      if ("type" in result) {
        // Het is een foutrespons
        setFinetuneError(result.message)
      } else {
        // Het is een succesrespons
        setEditedQuery(result.query)
      }
    } catch (error) {
      console.error("Error fine-tuning query:", error)
      setFinetuneError(`Fout bij fine-tuning: ${error instanceof Error ? error.message : "Onbekende fout"}`)
    } finally {
      setIsFinetuning(false)
    }
  }

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Textarea
          value={editedQuery}
          onChange={(e) => setEditedQuery(e.target.value)}
          className="min-h-[120px] bg-black/40 border-purple-800/20 text-green-400 font-mono text-sm"
        />

        {finetuneError && (
          <div className="bg-red-900/20 border border-red-700/30 p-3 rounded-md text-red-300 text-sm">
            {finetuneError}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelEdit}
            className="bg-black/30 border-purple-800/20 text-purple-300"
          >
            Annuleren
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFineTune}
            disabled={isFinetuning}
            className="bg-black/30 border-purple-800/20 text-purple-300"
          >
            {isFinetuning ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-300 border-t-transparent"></div>
                <span>Fine-tuning...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="h-3 w-3" />
                <span>Fine-tune</span>
              </span>
            )}
          </Button>
          <Button size="sm" onClick={handleSaveEdit} className="bg-purple-700 hover:bg-purple-600 text-white">
            <span className="flex items-center gap-2">
              <Check className="h-3 w-3" />
              <span>Opslaan</span>
            </span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <pre className="bg-black/40 p-4 rounded-md text-green-400 whitespace-pre-wrap overflow-x-auto border border-purple-800/20 text-sm">
        {query}
      </pre>
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="bg-black/50 hover:bg-purple-900/50 text-purple-300 hover:text-white"
        >
          <span className="flex items-center gap-1">
            <Edit className="h-3 w-3" />
            <span className="text-xs">Bewerken</span>
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="bg-black/50 hover:bg-purple-900/50 text-purple-300 hover:text-white"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="h-3 w-3" />
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
    </div>
  )
}
