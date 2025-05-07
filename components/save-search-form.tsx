"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookmarkPlus, X } from "lucide-react"

interface SaveSearchFormProps {
  onSave: (name: string, category: string) => void
  onCancel: () => void
  categories: string[]
  currentQuery: string
}

export function SaveSearchForm({ onSave, onCancel, categories, currentQuery }: SaveSearchFormProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState(categories.length > 0 ? categories[0] : "General")
  const [newCategory, setNewCategory] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return

    const finalCategory = isAddingCategory ? newCategory.trim() || "General" : category
    onSave(name, finalCategory)
  }

  const handleAddCategory = () => {
    setIsAddingCategory(true)
  }

  return (
    <div className="p-3 bg-black/30 border border-purple-800/20 rounded-md space-y-3">
      <div>
        <Label htmlFor="search-name" className="text-xs text-purple-300">
          Naam zoekopdracht
        </Label>
        <Input
          id="search-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bijv. 'Senior Java Developers in Amsterdam'"
          className="bg-black/40 border-purple-800/30 text-purple-200 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="search-category" className="text-xs text-purple-300 flex justify-between">
          <span>Categorie</span>
          {!isAddingCategory && (
            <button onClick={handleAddCategory} className="text-purple-400 hover:text-purple-300 text-xs underline">
              + Nieuwe categorie
            </button>
          )}
        </Label>

        {isAddingCategory ? (
          <div className="flex gap-2">
            <Input
              id="new-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nieuwe categorie"
              className="bg-black/40 border-purple-800/30 text-purple-200 h-9 text-sm flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingCategory(false)}
              className="h-9 text-purple-300 hover:text-purple-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <select
            id="search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-black/40 border border-purple-800/30 text-purple-200 rounded-md h-9 px-3 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            {categories.length === 0 && <option value="General">General</option>}
          </select>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 text-purple-300 hover:text-purple-100 hover:bg-purple-900/30"
        >
          Annuleren
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!name.trim()}
          className="h-8 bg-purple-700 hover:bg-purple-600 text-white"
        >
          <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
          Opslaan
        </Button>
      </div>
    </div>
  )
}
