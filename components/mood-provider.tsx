"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { getWeatherData } from "@/lib/weather-service"
import { saveWeatherHistory, type User, type WeatherHistoryEntry } from "@/lib/storage"

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  city: string
  country: string
  feelsLike: number
  visibility: number
  pressure: number
}

interface MoodContextType {
  weather: WeatherData | null
  mood: string
  backgroundClass: string
  suggestions: string[]
  musicSuggestions: Array<{
    title: string
    artist: string
    genre: string
    vibe: string
  }>
  isConnected: boolean
  lastUpdate: Date | null
}

const MoodContext = createContext<MoodContextType | undefined>(undefined)

export function useMood() {
  const context = useContext(MoodContext)
  if (!context) {
    throw new Error("useMood must be used within a MoodProvider")
  }
  return context
}

interface MoodProviderProps {
  children: ReactNode
  location: { lat: number; lon: number }
  user: User
}

export function MoodProvider({ children, location, user }: MoodProviderProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [mood, setMood] = useState("neutral")
  // Constant beautiful background for WeatherVerse
  const [backgroundClass] = useState("bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [musicSuggestions, setMusicSuggestions] = useState<
    Array<{
      title: string
      artist: string
      genre: string
      vibe: string
    }>
  >([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket-like live updates using polling
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsConnected(true)
        const data = await getWeatherData(location.lat, location.lon)
        setWeather(data)
        setLastUpdate(new Date())
        updateMoodAndSuggestions(data)

        // Save to history
        const historyEntry: WeatherHistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          city: data.city,
          country: data.country,
          temperature: data.temperature,
          condition: data.condition,
          description: data.description,
          coordinates: location,
        }
        saveWeatherHistory(historyEntry)
      } catch (error) {
        console.error("Failed to fetch weather:", error)
        setIsConnected(false)
      }
    }

    // Initial fetch
    fetchWeatherData()

    // Set up live updates every 30 seconds
    intervalRef.current = setInterval(fetchWeatherData, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [location])

  const updateMoodAndSuggestions = (weatherData: WeatherData) => {
    const condition = weatherData.condition.toLowerCase()
    const temp = weatherData.temperature

    let newMood = "neutral"
    let newSuggestions: string[] = []
    let newMusicSuggestions: Array<{
      title: string
      artist: string
      genre: string
      vibe: string
    }> = []

    if (condition.includes("rain") || condition.includes("drizzle")) {
      newMood = "cozy"
      newSuggestions = [
        "Perfect weather for a warm cup of coffee ☕",
        "Great time to read a book indoors 📚",
        "Don't forget your umbrella! ☔",
      ]
      newMusicSuggestions = [
        { title: "Raindrops Keep Fallin' on My Head", artist: "B.J. Thomas", genre: "Pop", vibe: "Cozy & Nostalgic" },
        { title: "The Sound of Rain", artist: "Solange", genre: "R&B", vibe: "Mellow & Soothing" },
        { title: "November Rain", artist: "Guns N' Roses", genre: "Rock", vibe: "Epic & Dramatic" },
        { title: "Purple Rain", artist: "Prince", genre: "Pop/Rock", vibe: "Iconic & Moody" },
        { title: "Rainy Days and Mondays", artist: "The Carpenters", genre: "Soft Rock", vibe: "Melancholic & Warm" },
      ]
    } else if (condition.includes("snow")) {
      newMood = "winter"
      newSuggestions = ["Bundle up in warm clothes! 🧥", "Hot chocolate weather ☕", "Watch out for icy roads ❄️"]
      newMusicSuggestions = [
        {
          title: "Let It Snow! Let It Snow! Let It Snow!",
          artist: "Dean Martin",
          genre: "Jazz",
          vibe: "Festive & Warm",
        },
        { title: "Winter Wonderland", artist: "Tony Bennett", genre: "Jazz", vibe: "Classic & Cozy" },
        { title: "Snowman", artist: "Sia", genre: "Pop", vibe: "Whimsical & Fun" },
        { title: "White Winter Hymnal", artist: "Fleet Foxes", genre: "Indie Folk", vibe: "Ethereal & Beautiful" },
        { title: "Baby, It's Cold Outside", artist: "Ella Fitzgerald", genre: "Jazz", vibe: "Romantic & Playful" },
      ]
    } else if (condition.includes("clear") && temp > 25) {
      newMood = "sunny"
      newSuggestions = ["Perfect day for outdoor activities! ☀️", "Don't forget sunscreen 🧴", "Stay hydrated! 💧"]
      newMusicSuggestions = [
        { title: "Here Comes the Sun", artist: "The Beatles", genre: "Rock", vibe: "Uplifting & Joyful" },
        { title: "Good as Hell", artist: "Lizzo", genre: "Pop", vibe: "Confident & Energetic" },
        { title: "Walking on Sunshine", artist: "Katrina and the Waves", genre: "Pop", vibe: "Happy & Energetic" },
        { title: "Sunny", artist: "Bobby Hebb", genre: "Soul", vibe: "Feel-Good & Groovy" },
        { title: "Summer Breeze", artist: "Seals and Crofts", genre: "Soft Rock", vibe: "Relaxed & Warm" },
      ]
    } else if (temp > 30) {
      // Hot weather override
      newMood = "hot"
      newSuggestions = ["It's very hot! Stay in shade ☀️", "Drink lots of water 💧", "Perfect pool weather 🏊"]
      newMusicSuggestions = [
        { title: "Hot Fun in the Summertime", artist: "Sly & The Family Stone", genre: "Funk", vibe: "Hot & Groovy" },
        { title: "Summer", artist: "Calvin Harris", genre: "Electronic", vibe: "Hot & Energetic" },
        { title: "Cruel Summer", artist: "Taylor Swift", genre: "Pop", vibe: "Hot & Catchy" },
        { title: "Hot Hot Hot", artist: "Arrow", genre: "Calypso", vibe: "Tropical & Fun" },
        { title: "Under the Boardwalk", artist: "The Drifters", genre: "Soul", vibe: "Hot & Classic" },
      ]
    } else if (condition.includes("cloud")) {
      newMood = "cloudy"
      newSuggestions = [
        "Great weather for a walk 🚶",
        "Perfect photography lighting 📸",
        "Comfortable temperature outside 🌤️",
      ]
      newMusicSuggestions = [
        { title: "Cloudy", artist: "Simon & Garfunkel", genre: "Folk", vibe: "Contemplative & Peaceful" },
        { title: "Both Sides Now", artist: "Joni Mitchell", genre: "Folk", vibe: "Reflective & Beautiful" },
        { title: "Mad World", artist: "Gary Jules", genre: "Alternative", vibe: "Moody & Atmospheric" },
        { title: "The Night We Met", artist: "Lord Huron", genre: "Indie Folk", vibe: "Nostalgic & Dreamy" },
        { title: "Breathe Me", artist: "Sia", genre: "Alternative", vibe: "Introspective & Emotional" },
      ]
    } else if (temp < 5) {
      newMood = "cold"
      newSuggestions = ["Layer up! It's cold outside 🥶", "Warm soup sounds perfect 🍲", "Check your heating system 🏠"]
      newMusicSuggestions = [
        { title: "Cold", artist: "Maroon 5", genre: "Pop Rock", vibe: "Energetic & Warming" },
        { title: "Fire on Fire", artist: "Sam Smith", genre: "Pop", vibe: "Passionate & Warming" },
        { title: "Warm", artist: "SG Lewis", genre: "Electronic", vibe: "Cozy & Modern" },
        { title: "Hot Chocolate", artist: "Tom Hanks", genre: "Soundtrack", vibe: "Comforting & Nostalgic" },
        { title: "Firestone", artist: "Kygo", genre: "Tropical House", vibe: "Uplifting & Warm" },
      ]
    } else {
      // Default pleasant weather
      newMusicSuggestions = [
        { title: "Perfect", artist: "Ed Sheeran", genre: "Pop", vibe: "Pleasant & Romantic" },
        { title: "Good 4 U", artist: "Olivia Rodrigo", genre: "Pop Rock", vibe: "Energetic & Fun" },
        { title: "Levitating", artist: "Dua Lipa", genre: "Pop", vibe: "Upbeat & Modern" },
        { title: "Blinding Lights", artist: "The Weeknd", genre: "Synth Pop", vibe: "Energetic & Catchy" },
        { title: "As It Was", artist: "Harry Styles", genre: "Pop", vibe: "Chill & Contemporary" },
      ]
    }

    setMood(newMood)
    setSuggestions(newSuggestions)
    setMusicSuggestions(newMusicSuggestions)
  }

  return (
    <MoodContext.Provider
      value={{ weather, mood, backgroundClass, suggestions, musicSuggestions, isConnected, lastUpdate }}
    >
      <div className={`${backgroundClass} min-h-screen transition-all duration-1000`}>
        {/* Connection Status Indicator */}
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isConnected ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
            } backdrop-blur-md`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} ${
                isConnected ? "animate-pulse" : ""
              }`}
            />
            {isConnected ? "Live" : "Offline"}
            {lastUpdate && <span className="text-white/60">• {lastUpdate.toLocaleTimeString()}</span>}
          </div>
        </div>
        {children}
      </div>
    </MoodContext.Provider>
  )
}
