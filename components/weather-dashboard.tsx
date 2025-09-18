"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMood } from "@/components/mood-provider"
import { CitySearch } from "@/components/city-search"
import { Thermometer, Droplets, Wind, Eye, Heart, Activity } from "lucide-react"
import { getWeatherByCity } from "@/lib/weather-service"
import { saveWeatherHistory, type WeatherHistoryEntry } from "@/lib/storage"

interface WeatherDashboardProps {
  location: { lat: number; lon: number }
}

export function WeatherDashboard({ location }: WeatherDashboardProps) {
  const { weather, suggestions, musicSuggestions, isConnected } = useMood()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [searchedWeather, setSearchedWeather] = useState<any>(null)
  const [currentMood, setCurrentMood] = useState<string>("")
  const [currentProductivity, setCurrentProductivity] = useState<number>(0)
  const [showMoodTracker, setShowMoodTracker] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCitySearch = async (city: string) => {
    try {
      const weatherData = await getWeatherByCity(city)
      setSearchedWeather(weatherData)

      // Save to history
      const historyEntry: WeatherHistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        city: weatherData.city,
        country: weatherData.country,
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        description: weatherData.description,
        coordinates: { lat: 0, lon: 0 }, // Would be populated from geocoding
      }
      saveWeatherHistory(historyEntry)
    } catch (error) {
      console.error("Failed to search city:", error)
      alert("Could not find weather data for this city. Please check the city name.")
    }
  }

  const handleMoodSubmit = () => {
    if (currentMood && currentProductivity > 0) {
      const weatherToTrack = searchedWeather || weather
      if (weatherToTrack) {
        const historyEntry: WeatherHistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          city: weatherToTrack.city,
          country: weatherToTrack.country,
          temperature: weatherToTrack.temperature,
          condition: weatherToTrack.condition,
          description: weatherToTrack.description,
          mood: currentMood as any,
          productivity: currentProductivity as any,
          coordinates: location,
        }
        saveWeatherHistory(historyEntry)
        setShowMoodTracker(false)
        setCurrentMood("")
        setCurrentProductivity(0)
        alert("Mood and productivity tracked!")
      }
    }
  }

  const displayWeather = searchedWeather || weather

  if (!displayWeather) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* City Search */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Search Weather by City</CardTitle>
        </CardHeader>
        <CardContent>
          <CitySearch onCitySelect={handleCitySearch} />
          {searchedWeather && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-white/80">
                Showing weather for:{" "}
                <span className="font-semibold">
                  {searchedWeather.city}, {searchedWeather.country}
                </span>
              </p>
              <Button
                onClick={() => setSearchedWeather(null)}
                variant="outline"
                size="sm"
                className="mt-2 border-white/40 text-white bg-white/10 hover:bg-white/30 hover:border-white/60 hover:text-white transition-colors"
              >
                Back to Current Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Weather Card */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {displayWeather.city}, {displayWeather.country}
          </CardTitle>
          <p className="text-white/80">{currentTime.toLocaleString()}</p>
          {!isConnected && (
            <Badge variant="destructive" className="mx-auto">
              Offline - Data may be outdated
            </Badge>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold mb-2">{displayWeather.temperature}°C</div>
          <p className="text-xl capitalize mb-4">{displayWeather.description}</p>
          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              Feels like {displayWeather.feelsLike}°C
            </Badge>
            <Button
              onClick={() => setShowMoodTracker(!showMoodTracker)}
              variant="outline"
              size="sm"
              className="border-white/40 text-white bg-white/10 hover:bg-white/30 hover:border-white/60 hover:text-white transition-colors"
            >
              <Heart className="w-4 h-4 mr-2" />
              Track Mood
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mood Tracker */}
      {showMoodTracker && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white mb-2 block">Current Mood</label>
              <Select value={currentMood} onValueChange={setCurrentMood}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/20 text-white">
                  <SelectItem value="happy" className="focus:bg-white/20 focus:text-white">
                    😊 Happy
                  </SelectItem>
                  <SelectItem value="neutral" className="focus:bg-white/20 focus:text-white">
                    😐 Neutral
                  </SelectItem>
                  <SelectItem value="sad" className="focus:bg-white/20 focus:text-white">
                    😢 Sad
                  </SelectItem>
                  <SelectItem value="energetic" className="focus:bg-white/20 focus:text-white">
                    ⚡ Energetic
                  </SelectItem>
                  <SelectItem value="calm" className="focus:bg-white/20 focus:text-white">
                    😌 Calm
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-white mb-2 block">Productivity Level (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    onClick={() => setCurrentProductivity(level)}
                    variant="outline"
                    size="sm"
                    className={
                      currentProductivity === level
                        ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white"
                        : "border-white/40 text-white bg-white/10 hover:bg-white/30 hover:border-white/60 hover:text-white transition-colors"
                    }
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleMoodSubmit}
              disabled={!currentMood || currentProductivity === 0}
              className="w-full bg-green-600 hover:bg-green-700 transition-colors"
            >
              Save Mood & Productivity
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <Thermometer className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm text-white/80">Temperature</p>
            <p className="text-xl font-bold">{displayWeather.temperature}°C</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-white/80">Humidity</p>
            <p className="text-xl font-bold">{displayWeather.humidity}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <Wind className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm text-white/80">Wind Speed</p>
            <p className="text-xl font-bold">{displayWeather.windSpeed} m/s</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-sm text-white/80">Visibility</p>
            <p className="text-xl font-bold">{displayWeather.visibility} km</p>
          </CardContent>
        </Card>
      </div>

      {/* Weather Vibes & Suggestions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span>
            Weather Vibes & Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-white/10 rounded-lg">
                {suggestion}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Music Suggestions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎵</span>
            Perfect Playlist for This Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {musicSuggestions.map((song, index) => (
              <div key={index} className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{song.title}</h4>
                    <p className="text-white/80">by {song.artist}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-white/30 text-white">
                        {song.genre}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-white/30 text-white">
                        {song.vibe}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-2xl">🎵</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-center text-white/70">
            <p className="text-sm">🎧 These songs match the current weather vibe perfectly!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
