"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Heart, Plus, Trash2, MapPin, Bell } from "lucide-react"
import {
  getFavoriteLocations,
  saveFavoriteLocation,
  removeFavoriteLocation,
  type FavoriteLocation,
} from "@/lib/storage"
import { getWeatherByCity } from "@/lib/weather-service"

export function FavoriteLocations() {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFavorite, setNewFavorite] = useState({
    city: "",
    customName: "",
    temperatureAlerts: true,
    conditionAlerts: true,
    threshold: 25,
  })
  const [loading, setLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<Record<string, any>>({})

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    const favs = getFavoriteLocations()
    setFavorites(favs)

    // Load current weather for each favorite
    const weatherPromises = favs.map(async (fav) => {
      try {
        const weather = await getWeatherByCity(fav.city)
        return { id: fav.id, weather }
      } catch (error) {
        return { id: fav.id, weather: null }
      }
    })

    const weatherResults = await Promise.all(weatherPromises)
    const weatherMap: Record<string, any> = {}
    weatherResults.forEach((result) => {
      weatherMap[result.id] = result.weather
    })
    setWeatherData(weatherMap)
  }

  const handleAddFavorite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFavorite.city) return

    setLoading(true)

    try {
      const weather = await getWeatherByCity(newFavorite.city)

      const favorite: FavoriteLocation = {
        id: Date.now().toString(),
        name: newFavorite.city,
        city: weather.city,
        country: weather.country,
        customName: newFavorite.customName || undefined,
        coordinates: { lat: 0, lon: 0 }, // Would be populated from geocoding in real app
        notifications: {
          temperatureAlerts: newFavorite.temperatureAlerts,
          conditionAlerts: newFavorite.conditionAlerts,
          threshold: newFavorite.threshold,
        },
        addedDate: new Date().toISOString(),
      }

      saveFavoriteLocation(favorite)
      setNewFavorite({
        city: "",
        customName: "",
        temperatureAlerts: true,
        conditionAlerts: true,
        threshold: 25,
      })
      setShowAddForm(false)
      loadFavorites()
    } catch (error) {
      console.error("Failed to add favorite:", error)
      alert("Could not find weather data for this city. Please check the city name.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = (id: string) => {
    removeFavoriteLocation(id)
    loadFavorites()
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition?.toLowerCase() || ""
    if (cond.includes("rain")) return "🌧️"
    if (cond.includes("snow")) return "❄️"
    if (cond.includes("cloud")) return "☁️"
    if (cond.includes("clear")) return "☀️"
    return "🌤️"
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6" />
              Favorite Locations
            </CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Favorite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Save your favorite locations for quick weather access and personalized notifications.
          </p>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>Add Favorite Location</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFavorite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-white">
                    City Name
                  </Label>
                  <Input
                    id="city"
                    value={newFavorite.city}
                    onChange={(e) => setNewFavorite({ ...newFavorite, city: e.target.value })}
                    placeholder="Enter city name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customName" className="text-white">
                    Custom Name (Optional)
                  </Label>
                  <Input
                    id="customName"
                    value={newFavorite.customName}
                    onChange={(e) => setNewFavorite({ ...newFavorite, customName: e.target.value })}
                    placeholder="e.g., Home, Work, Vacation Spot"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium">Notification Preferences</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tempAlerts" className="text-white">
                    Temperature Alerts
                  </Label>
                  <Switch
                    id="tempAlerts"
                    checked={newFavorite.temperatureAlerts}
                    onCheckedChange={(checked) => setNewFavorite({ ...newFavorite, temperatureAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="condAlerts" className="text-white">
                    Weather Condition Alerts
                  </Label>
                  <Switch
                    id="condAlerts"
                    checked={newFavorite.conditionAlerts}
                    onCheckedChange={(checked) => setNewFavorite({ ...newFavorite, conditionAlerts: checked })}
                  />
                </div>
                <div>
                  <Label htmlFor="threshold" className="text-white">
                    Temperature Threshold (°C)
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newFavorite.threshold}
                    onChange={(e) => setNewFavorite({ ...newFavorite, threshold: Number.parseInt(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? "Adding..." : "Add Favorite"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {favorites.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-white/60" />
              <p className="text-white/80">No favorite locations yet. Add your first favorite!</p>
            </CardContent>
          </Card>
        ) : (
          favorites.map((favorite) => {
            const weather = weatherData[favorite.id]
            return (
              <Card key={favorite.id} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-pink-400" />
                        <h3 className="text-xl font-semibold">{favorite.customName || favorite.city}</h3>
                        {favorite.customName && (
                          <Badge variant="outline" className="text-white border-white/30">
                            {favorite.city}, {favorite.country}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/80 mb-3">
                        Added on {new Date(favorite.addedDate).toLocaleDateString()}
                      </p>

                      {weather && (
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
                            <span className="text-lg font-bold">{weather.temperature}°C</span>
                          </div>
                          <Badge className="bg-blue-600/50 text-white">{weather.description}</Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <div className="flex items-center gap-1">
                          <Bell className="w-4 h-4" />
                          <span>
                            {favorite.notifications.temperatureAlerts || favorite.notifications.conditionAlerts
                              ? "Notifications On"
                              : "Notifications Off"}
                          </span>
                        </div>
                        {favorite.notifications.temperatureAlerts && (
                          <span>Threshold: {favorite.notifications.threshold}°C</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-400/50 text-red-400 hover:bg-red-400/20 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
