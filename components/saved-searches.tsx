"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Bookmark, Edit, Trash2, Save, X, FolderPlus } from "lucide-react"
import type { SavedSearch } from "@/hooks/use-saved-searches"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SavedSearchesProps {
  savedSearches: SavedSearch[]
  onSelectSearch: (query: string) => void
  onDeleteSearch: (id: string) => void
  onUpdateSearch: (id: string, updates: Partial<SavedSearch>) => void
}

export function SavedSearches({ savedSearches, onSelectSearch, onDeleteSearch, onUpdateSearch }: SavedSearchesProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editCategory, setEditCategory] = useState("")

  // Group searches by category
  const searchesByCategory: Record<string, SavedSearch[]> = {}
  savedSearches.forEach((search) => {
    if (!searchesByCategory[search.category]) {
      searchesByCategory[search.category] = []
    }
    searchesByCategory[search.category].push(search)
  })

  // Sort categories alphabetically
  const sortedCategories = Object.keys(searchesByCategory).sort()

  const handleEdit = (search: SavedSearch) => {
    setEditingId(search.id)
    setEditName(search.name)
    setEditCategory(search.category)
  }

  const handleSaveEdit = (id: string) => {
    onUpdateSearch(id, {
      name: editName,
      category: editCategory,
    })
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  if (savedSearches.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed border-purple-800/30 rounded-lg bg-black/20">
        <p className="text-purple-300/70 text-sm">Geen opgeslagen zoekopdrachten</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedCategories.map((category) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center gap-2 text-purple-300">
            <FolderPlus className="h-4 w-4" />
            <h4 className="text-sm font-medium">{category}</h4>
          </div>

          <div className="space-y-2">
            {searchesByCategory[category].map((search) => (
              <Card
                key={search.id}
                className="bg-black/30 border-purple-800/20 hover:border-purple-700/30 transition-all p-0 overflow-hidden"
              >
                {editingId === search.id ? (
                  <div className="p-3 space-y-3">
                    <div>
                      <Label htmlFor={`edit-name-${search.id}`} className="text-xs text-purple-300">
                        Naam
                      </Label>
                      <Input
                        id={`edit-name-${search.id}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-black/40 border-purple-800/30 text-purple-200 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-category-${search.id}`} className="text-xs text-purple-300">
                        Categorie
                      </Label>
                      <Input
                        id={`edit-category-${search.id}`}
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="bg-black/40 border-purple-800/30 text-purple-200 h-8 text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 text-purple-300 hover:text-purple-100"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Annuleren
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(search.id)}
                        className="h-8 bg-purple-700 hover:bg-purple-600 text-white"
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Opslaan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Button
                      onClick={() => onSelectSearch(search.query)}
                      className="flex-1 justify-start text-left bg-transparent hover:bg-purple-900/20 text-purple-300 hover:text-purple-200 p-3 h-auto rounded-none border-0"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Bookmark className="h-3.5 w-3.5 flex-shrink-0 text-purple-400" />
                        <span className="font-medium truncate">{search.name}</span>
                      </div>
                    </Button>

                    <div className="flex pr-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(search)}
                        className="h-7 w-7 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                        aria-label="Bewerk zoekopdracht"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-purple-400 hover:text-red-300 hover:bg-red-900/20"
                            aria-label="Verwijder zoekopdracht"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 border-purple-800/30 text-white max-w-sm">
                          <DialogHeader>
                            <DialogTitle className="text-purple-300">Zoekopdracht verwijderen</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-purple-200 mb-4">
                            Weet je zeker dat je de zoekopdracht "{search.name}" wilt verwijderen?
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30"
                            >
                              Annuleren
                            </Button>
                            <Button
                              onClick={() => onDeleteSearch(search.id)}
                              className="bg-red-700 hover:bg-red-600 text-white"
                            >
                              Verwijderen
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
