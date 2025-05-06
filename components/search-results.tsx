"use client"

import { useState, useEffect, useRef } from "react"
import { Linkedin, ExternalLink, User, Briefcase, MapPin, AlertCircle, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchResults } from "@/app/search-actions"
import type { Platform } from "@/app/actions"

interface SearchResult {
  id: string
  name: string
  title: string
  location?: string
  snippet: string
  profileUrl: string
  imageUrl?: string
  platform: Platform
}

interface SearchResultsProps {
  query: string
  platform: Platform
  isOpen: boolean
  onClose: () => void
}

export function SearchResults({ query, platform, isOpen, onClose }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastResultElementRef = useRef<HTMLDivElement | null>(null)

  // Fetch search results
  const fetchMoreResults = async () => {
    if (loading || !query) return

    setLoading(true)
    setError(null)

    try {
      const { results: newResults, hasMore: moreResults } = await fetchResults(query, platform, page)

      if (newResults.length === 0 && page === 0) {
        setError("Geen resultaten gevonden. Probeer een andere zoekopdracht.")
      } else {
        setResults((prev) => [...prev, ...newResults])
        setHasMore(moreResults)
        setPage((prev) => prev + 1)
      }
    } catch (err) {
      console.error("Error fetching results:", err)
      setError("Er is een fout opgetreden bij het ophalen van de zoekresultaten. Probeer het later opnieuw.")
    } finally {
      setLoading(false)
    }
  }

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return

    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreResults()
      }
    })

    if (lastResultElementRef.current) {
      observer.current.observe(lastResultElementRef.current)
    }
  }, [loading, hasMore])

  // Initial load
  useEffect(() => {
    if (isOpen && query) {
      setResults([])
      setPage(0)
      setHasMore(true)
      setError(null)
      fetchMoreResults()
    }
  }, [isOpen, query, platform])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-hidden flex justify-center">
      <div className="w-full max-w-3xl h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-purple-300 flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn X-ray Resultaten
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-purple-300 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-black/40 p-3 rounded-md mb-4 border border-purple-800/30">
          <p className="text-sm text-purple-200">
            <span className="font-medium">Zoekopdracht:</span> {query}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <AlertCircle className="h-12 w-12 text-purple-400 mb-4" />
              <p className="text-purple-300 mb-2">{error}</p>
              <p className="text-purple-400/70 text-sm max-w-md">
                Probeer je zoekopdracht aan te passen of gebruik de externe zoekoptie voor betere resultaten.
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result, index) => {
                // Check if this is the last element
                const isLastElement = index === results.length - 1

                return (
                  <div key={result.id} ref={isLastElement ? lastResultElementRef : null}>
                    <Card className="bg-black/40 p-3 border-purple-800/20 hover:border-purple-700/30 transition-all">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-900/30 flex-shrink-0 flex items-center justify-center">
                          {result.imageUrl ? (
                            <img
                              src={result.imageUrl || "/placeholder.svg"}
                              alt={result.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-purple-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-purple-200 truncate">{result.name}</h3>
                            <a
                              href={result.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>

                          {result.title && (
                            <p className="text-sm text-purple-300/90 flex items-center gap-1.5 mt-1">
                              <Briefcase className="h-3.5 w-3.5 text-purple-400/70 flex-shrink-0" />
                              <span className="truncate">{result.title}</span>
                            </p>
                          )}

                          {result.location && (
                            <p className="text-sm text-purple-300/90 flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-purple-400/70 flex-shrink-0" />
                              <span className="truncate">{result.location}</span>
                            </p>
                          )}

                          <p className="text-xs text-purple-300/70 mt-2 line-clamp-2">{result.snippet}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}

              {hasMore && <div ref={lastResultElementRef} className="h-4"></div>}
            </div>
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Search className="h-12 w-12 text-purple-400/50 mb-4" />
              <p className="text-purple-300/70">Zoeken naar resultaten...</p>
            </div>
          ) : null}

          {loading && (
            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((_, i) => (
                <Card key={i} className="bg-black/40 p-3 border-purple-800/20">
                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-purple-900/30" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-purple-900/30" />
                      <Skeleton className="h-3 w-full bg-purple-900/20" />
                      <Skeleton className="h-3 w-2/3 bg-purple-900/20" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!hasMore && results.length > 0 && (
            <div className="text-center py-4 text-purple-400/70">
              <p>Einde van de resultaten</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
