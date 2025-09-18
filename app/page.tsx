"use client"

import { useState, useEffect } from "react"
import { WeatherDashboard } from "@/components/weather-dashboard"
import { VoiceInteraction } from "@/components/voice-interaction"
import { TravelPlanner } from "@/components/travel-planner"
import { CalendarView } from "@/components/calendar-view"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { FavoriteLocations } from "@/components/favorite-locations"
import { MoodProvider } from "@/components/mood-provider"
import { LoginPage } from "@/components/auth/login-page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Cloud, Plane, Mic, Calendar, BarChart3, Heart, LogOut } from "lucide-react"
import { getUser, logout, type User } from "@/lib/storage"

export default function WeatherVerse() {
  const [user, setUser] = useState<User | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = getUser()
    setUser(savedUser)
    setLoading(false)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Location access denied, using default location")
          setCurrentLocation({ lat: 40.7128, lon: -74.006 })
        },
      )
    } else {
      setCurrentLocation({ lat: 40.7128, lon: -74.006 })
    }
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading WeatherVerse...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (!currentLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Getting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <MoodProvider location={currentLocation} user={user}>
      <div className="min-h-screen transition-all duration-1000">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">WeatherVerse</h1>
              <p className="text-white/80 text-lg drop-shadow">Welcome back, {user.username}!</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </header>

          <Tabs defaultValue="weather" className="w-full max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-6 mb-8 bg-white/10 backdrop-blur-md">
              <TabsTrigger
                value="weather"
                className="flex items-center gap-2 text-white data-[state=active]:bg-white/20"
              >
                <Cloud className="w-4 h-4" />
                Weather
              </TabsTrigger>
              <TabsTrigger
                value="travel"
                className="flex items-center gap-2 text-white data-[state=active]:bg-white/20"
              >
                <Plane className="w-4 h-4" />
                Travel
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
                <Mic className="w-4 h-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2 text-white data-[state=active]:bg-white/20"
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 text-white data-[state=active]:bg-white/20"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex items-center gap-2 text-white data-[state=active]:bg-white/20"
              >
                <Heart className="w-4 h-4" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weather">
              <WeatherDashboard location={currentLocation} />
            </TabsContent>

            <TabsContent value="travel">
              <TravelPlanner />
            </TabsContent>

            <TabsContent value="voice">
              <VoiceInteraction location={currentLocation} />
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="favorites">
              <FavoriteLocations />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MoodProvider>
  )
}
