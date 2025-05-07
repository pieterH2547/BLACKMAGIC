"use client"

import { useState, useEffect } from "react"

export interface SavedSearch {
  id: string
  name: string
  query: string
  category: string
  timestamp: number
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved searches from localStorage on component mount
  useEffect(() => {
    const loadSavedSearches = () => {
      try {
        const savedData = localStorage.getItem("blackmagic-saved-searches")
        if (savedData) {
          setSavedSearches(JSON.parse(savedData))
        }
      } catch (error) {
        console.error("Error loading saved searches:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadSavedSearches()
  }, [])

  // Save to localStorage whenever savedSearches changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("blackmagic-saved-searches", JSON.stringify(savedSearches))
    }
  }, [savedSearches, isLoaded])

  // Add a new saved search
  const addSavedSearch = (name: string, query: string, category = "General") => {
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      query,
      category,
      timestamp: Date.now(),
    }
    setSavedSearches((prev) => [...prev, newSearch])
    return newSearch
  }

  // Update an existing saved search
  const updateSavedSearch = (id: string, updates: Partial<Omit<SavedSearch, "id" | "timestamp">>) => {
    setSavedSearches((prev) =>
      prev.map((search) =>
        search.id === id
          ? {
              ...search,
              ...updates,
              timestamp: Date.now(), // Update timestamp when modified
            }
          : search,
      ),
    )
  }

  // Delete a saved search
  const deleteSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((search) => search.id !== id))
  }

  // Get all available categories
  const getCategories = (): string[] => {
    const categories = new Set(savedSearches.map((search) => search.category))
    return Array.from(categories)
  }

  // Get searches by category
  const getSearchesByCategory = (category: string): SavedSearch[] => {
    return savedSearches.filter((search) => search.category === category)
  }

  return {
    savedSearches,
    isLoaded,
    addSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    getCategories,
    getSearchesByCategory,
  }
}
