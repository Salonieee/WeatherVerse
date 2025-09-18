"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Thermometer, Droplets, Wind, AlertTriangle } from "lucide-react"
import { getWeatherByCity } from "@/lib/weather-service"

interface CityWeather {
  city: string
  country: string
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  feelsLike: number
  visibility: number
  pressure: number
}

export function TravelPlanner() {
  const [originCity, setOriginCity] = useState("")
  const [destinationCity, setDestinationCity] = useState("")
  const [originWeather, setOriginWeather] = useState<CityWeather | null>(null)
  const [destinationWeather, setDestinationWeather] = useState<CityWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [travelAdvice, setTravelAdvice] = useState<string[]>([])

  const planTrip = async () => {
    if (!originCity || !destinationCity) return

    setLoading(true)
    try {
      const [origin, destination] = await Promise.all([getWeatherByCity(originCity), getWeatherByCity(destinationCity)])

      setOriginWeather(origin)
      setDestinationWeather(destination)
      generateTravelAdvice(origin, destination)
    } catch (error) {
      console.error("Failed to fetch weather data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateTravelAdvice = (origin: CityWeather, destination: CityWeather) => {
    const advice: string[] = []
    const tempDiff = destination.temperature - origin.temperature

    // Temperature advice
    if (tempDiff > 10) {
      advice.push("🌡️ It's significantly warmer at your destination. Pack lighter clothes!")
    } else if (tempDiff < -10) {
      advice.push("🧥 It's much cooler at your destination. Bring warm clothing!")
    } else {
      advice.push("🌡️ Temperature is similar at both locations. Current clothing should be fine!")
    }

    // Weather condition advice
    if (destination.condition.toLowerCase().includes("rain")) {
      advice.push("☔ Rain expected at destination. Don't forget your umbrella!")
    }
    if (destination.condition.toLowerCase().includes("snow")) {
      advice.push("❄️ Snow conditions at destination. Pack winter gear and check road conditions!")
    }
    if (destination.windSpeed > 15) {
      advice.push("💨 High winds expected at destination. Secure loose items!")
    }

    // Best travel day advice
    const originScore = calculateWeatherScore(origin)
    const destScore = calculateWeatherScore(destination)

    if (originScore > 7 && destScore > 7) {
      advice.push("✈️ Excellent weather conditions for travel today!")
    } else if (originScore < 4 || destScore < 4) {
      advice.push("⚠️ Consider postponing travel due to poor weather conditions.")
    } else {
      advice.push("🌤️ Moderate weather conditions. Travel with caution.")
    }

    // Humidity advice
    if (destination.humidity > 80) {
      advice.push("💧 High humidity at destination. Stay hydrated and dress breathably!")
    }

    setTravelAdvice(advice)
  }

  const calculateWeatherScore = (weather: CityWeather): number => {
    let score = 10

    // Temperature penalties
    if (weather.temperature < 0 || weather.temperature > 35) score -= 3
    if (weather.temperature < -10 || weather.temperature > 40) score -= 2

    // Weather condition penalties
    if (weather.condition.toLowerCase().includes("rain")) score -= 2
    if (weather.condition.toLowerCase().includes("snow")) score -= 3
    if (weather.condition.toLowerCase().includes("storm")) score -= 4

    // Wind penalties
    if (weather.windSpeed > 15) score -= 2
    if (weather.windSpeed > 25) score -= 2

    return Math.max(0, score)
  }

  const getWeatherScoreColor = (score: number): string => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6) return "bg-yellow-500"
    if (score >= 4) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Smart Travel Weather Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin" className="text-white">
                Origin City
              </Label>
              <Input
                id="origin"
                placeholder="e.g., New York"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <div>
              <Label htmlFor="destination" className="text-white">
                Destination City
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Paris"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>
          <Button
            onClick={planTrip}
            disabled={loading || !originCity || !destinationCity}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Planning your trip..." : "Plan My Trip"}
          </Button>
        </CardContent>
      </Card>

      {originWeather && destinationWeather && (
        <>
          {/* Weather Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {originWeather.city}, {originWeather.country} (Origin)
                  </span>
                  <Badge className={`${getWeatherScoreColor(calculateWeatherScore(originWeather))} text-white`}>
                    Score: {calculateWeatherScore(originWeather)}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{Math.round(originWeather.temperature)}°C</div>
                  <p className="capitalize">{originWeather.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <Droplets className="w-4 h-4 mx-auto mb-1" />
                    <p>{originWeather.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-4 h-4 mx-auto mb-1" />
                    <p>{originWeather.windSpeed} m/s</p>
                  </div>
                  <div className="text-center">
                    <Thermometer className="w-4 h-4 mx-auto mb-1" />
                    <p>{Math.round(originWeather.temperature)}°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {destinationWeather.city}, {destinationWeather.country} (Destination)
                  </span>
                  <Badge className={`${getWeatherScoreColor(calculateWeatherScore(destinationWeather))} text-white`}>
                    Score: {calculateWeatherScore(destinationWeather)}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{Math.round(destinationWeather.temperature)}°C</div>
                  <p className="capitalize">{destinationWeather.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <Droplets className="w-4 h-4 mx-auto mb-1" />
                    <p>{destinationWeather.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-4 h-4 mx-auto mb-1" />
                    <p>{destinationWeather.windSpeed} m/s</p>
                  </div>
                  <div className="text-center">
                    <Thermometer className="w-4 h-4 mx-auto mb-1" />
                    <p>{Math.round(destinationWeather.temperature)}°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Travel Advice */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Travel Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {travelAdvice.map((advice, index) => (
                  <div key={index} className="p-3 bg-white/10 rounded-lg">
                    {advice}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
