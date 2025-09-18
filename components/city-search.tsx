"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { saveRecentSearch } from "@/lib/storage"

interface CitySearchProps {
  onCitySelect: (city: string) => void
  className?: string
}

export function CitySearch({ onCitySelect, className = "" }: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim()
      saveRecentSearch(trimmedQuery)
      onCitySelect(trimmedQuery)
      setSearchQuery("")
    }
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Search
        </Button>
      </form>
    </div>
  )
}
