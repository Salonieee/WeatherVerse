"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, MapPin, Heart, Activity } from "lucide-react"
import { getAnalytics, getWeatherHistory, type AnalyticsData } from "@/lib/storage"

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [weatherHistory, setWeatherHistory] = useState<any[]>([])

  useEffect(() => {
    setAnalytics(getAnalytics())
    setWeatherHistory(getWeatherHistory())
  }, [])

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊"
      case "sad":
        return "😢"
      case "energetic":
        return "⚡"
      case "calm":
        return "😌"
      default:
        return "😐"
    }
  }

  const getWeatherEmoji = (weather: string) => {
    const w = weather.toLowerCase()
    if (w.includes("rain")) return "🌧️"
    if (w.includes("snow")) return "❄️"
    if (w.includes("cloud")) return "☁️"
    if (w.includes("clear")) return "☀️"
    return "🌤️"
  }

  const totalSearches = analytics.totalSearches || weatherHistory.length
  const averageTemp =
    weatherHistory.length > 0
      ? Math.round(weatherHistory.reduce((sum, entry) => sum + entry.temperature, 0) / weatherHistory.length)
      : 0

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Personal Weather Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Discover your weather patterns, preferences, and how weather affects your mood and productivity.
          </p>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-white/80">Total Searches</p>
            <p className="text-2xl font-bold">{totalSearches}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm text-white/80">Avg Temperature</p>
            <p className="text-2xl font-bold">{averageTemp}°C</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-sm text-white/80">Cities Visited</p>
            <p className="text-2xl font-bold">{analytics.mostVisitedCities.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm text-white/80">Mood Entries</p>
            <p className="text-2xl font-bold">{analytics.moodPatterns.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Most Visited Cities */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Most Visited Cities</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.mostVisitedCities.length > 0 ? (
            <div className="space-y-3">
              {analytics.mostVisitedCities
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">#{index + 1}</span>
                      <span className="font-medium">{city.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(city.count / Math.max(...analytics.mostVisitedCities.map((c) => c.count))) * 100}
                        className="w-20 h-2"
                      />
                      <Badge variant="outline" className="text-white border-white/30">
                        {city.count} visits
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No city data available yet. Start searching for weather!</p>
          )}
        </CardContent>
      </Card>

      {/* Mood Patterns */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Weather & Mood Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.moodPatterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.moodPatterns
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map((pattern, index) => (
                  <div key={index} className="p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getWeatherEmoji(pattern.weather)}</span>
                        <span className="font-medium">{pattern.weather}</span>
                      </div>
                      <span className="text-2xl">{getMoodEmoji(pattern.mood)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80 capitalize">{pattern.mood} mood</span>
                      <Badge variant="outline" className="text-white border-white/30">
                        {pattern.count} times
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">
              No mood data available yet. Start tracking your mood with weather!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Productivity Insights */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Productivity & Weather Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.productivityData.length > 0 ? (
            <div className="space-y-4">
              {analytics.productivityData
                .sort((a, b) => b.productivity - a.productivity)
                .map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getWeatherEmoji(data.weather)}</span>
                      <div>
                        <p className="font-medium">{data.weather}</p>
                        <p className="text-sm text-white/80">{data.count} entries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Progress value={data.productivity * 20} className="w-20 h-2" />
                        <span className="font-bold">{data.productivity.toFixed(1)}/5</span>
                      </div>
                      <p className="text-xs text-white/60">Avg Productivity</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">
              No productivity data available yet. Start tracking your productivity with weather!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Weather History */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Recent Weather History</CardTitle>
        </CardHeader>
        <CardContent>
          {weatherHistory.length > 0 ? (
            <div className="space-y-3">
              {weatherHistory.slice(0, 10).map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getWeatherEmoji(entry.condition)}</span>
                    <div>
                      <p className="font-medium">
                        {entry.city}, {entry.country}
                      </p>
                      <p className="text-sm text-white/80">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.temperature}°C</p>
                    <p className="text-sm text-white/80 capitalize">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No weather history available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
