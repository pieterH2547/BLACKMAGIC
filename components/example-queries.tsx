"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Code, BookmarkPlus, Bookmark } from "lucide-react"
import { SavedSearches } from "@/components/saved-searches"
import { SaveSearchForm } from "@/components/save-search-form"
import { useSavedSearches } from "@/hooks/use-saved-searches"
import type { SearchMode } from "@/app/actions"

interface ExampleQueriesProps {
  platform: string
  searchMode?: SearchMode
  onSelectExample: (query: string) => void
  currentQuery?: string
}

export function ExampleQueries({
  platform,
  searchMode = "native",
  onSelectExample,
  currentQuery = "",
}: ExampleQueriesProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { savedSearches, addSavedSearch, deleteSavedSearch, updateSavedSearch, getCategories } = useSavedSearches()

  // Predefined examples based on search mode
  const examples =
    searchMode === "native"
      ? [
          {
            title: "Senior Developer",
            description: "Senior Java developer met Spring Boot ervaring",
          },
          {
            title: "UX/UI Designer",
            description: "UX/UI designer met Figma ervaring",
          },
          {
            title: "Accountant SBB",
            description: "Accountant met ervaring in SBB en Finforward",
          },
        ]
      : [
          {
            title: "Senior Developer",
            description: "Senior Java developer met Spring Boot en cloud ervaring in Amsterdam",
          },
          {
            title: "UX/UI Designer",
            description: "UX/UI designer met Figma ervaring en e-commerce achtergrond",
          },
          {
            title: "Accountant SBB",
            description: "Accountant met ervaring in SBB en Finforward in de regio Utrecht",
          },
        ]

  const handleSaveSearch = (name: string, category: string) => {
    if (currentQuery) {
      addSavedSearch(name, currentQuery, category)
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Examples Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-purple-300">Voorbeelden</h3>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <div key={index} className="w-full overflow-hidden rounded-md border border-purple-800/20">
              <Button
                onClick={() => onSelectExample(example.description)}
                className="w-full justify-start text-left bg-black/30 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200 p-3 h-auto flex flex-col items-start rounded-none border-0"
              >
                <div className="flex items-center gap-2 mb-1 w-full">
                  <Code className="h-3.5 w-3.5 flex-shrink-0 text-purple-400" />
                  <span className="font-medium truncate">{example.title}</span>
                </div>
                <span className="text-xs text-purple-300/80 w-full truncate">{example.description}</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Searches Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-purple-300 flex items-center gap-2">
            <Bookmark className="h-3.5 w-3.5" />
            Opgeslagen zoekopdrachten
          </h3>
          {currentQuery && !isSaving && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaving(true)}
              className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
            >
              <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
              Opslaan
            </Button>
          )}
        </div>

        {isSaving ? (
          <SaveSearchForm
            onSave={handleSaveSearch}
            onCancel={() => setIsSaving(false)}
            categories={getCategories()}
            currentQuery={currentQuery}
          />
        ) : (
          <SavedSearches
            savedSearches={savedSearches}
            onSelectSearch={onSelectExample}
            onDeleteSearch={deleteSavedSearch}
            onUpdateSearch={updateSavedSearch}
          />
        )}
      </div>
    </div>
  )
}
