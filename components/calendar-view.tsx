"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, MapPin, Clock, Trash2 } from "lucide-react"
import { saveCalendarEvent, getCalendarEvents, removeCalendarEvent, type CalendarEvent } from "@/lib/storage"
import { getWeatherByCity } from "@/lib/weather-service"

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setEvents(getCalendarEvents())
  }, [])

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.date) return

    setLoading(true)

    try {
      let weatherForecast = undefined
      if (newEvent.location) {
        try {
          const weather = await getWeatherByCity(newEvent.location)
          weatherForecast = {
            temperature: weather.temperature,
            condition: weather.condition,
            description: weather.description,
          }
        } catch (error) {
          console.log("Could not fetch weather for location")
        }
      }

      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        weatherForecast,
        notes: newEvent.notes,
      }

      saveCalendarEvent(event)
      setEvents(getCalendarEvents())
      setNewEvent({ title: "", date: "", time: "", location: "", notes: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Failed to add event:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = (id: string) => {
    removeCalendarEvent(id)
    setEvents(getCalendarEvents())
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase()
    if (cond.includes("rain")) return "🌧️"
    if (cond.includes("snow")) return "❄️"
    if (cond.includes("cloud")) return "☁️"
    if (cond.includes("clear")) return "☀️"
    return "🌤️"
  }

  const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Weather Calendar
            </CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Plan your events with weather forecasts. Add location to get weather predictions for your events.
          </p>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>Add New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white">
                    Event Title
                  </Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-white">
                    Location (Optional)
                  </Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Enter city name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-white">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-white">
                    Time (Optional)
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-white">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder="Add any additional notes"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? "Adding..." : "Add Event"}
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
        {sortedEvents.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-white/60" />
              <p className="text-white/80">No events scheduled yet. Add your first event!</p>
            </CardContent>
          </Card>
        ) : (
          sortedEvents.map((event) => (
            <Card key={event.id} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    {event.weatherForecast && (
                      <div className="mb-3">
                        <Badge className="bg-blue-600/50 text-white">
                          {getWeatherIcon(event.weatherForecast.condition)} {event.weatherForecast.temperature}°C -{" "}
                          {event.weatherForecast.description}
                        </Badge>
                      </div>
                    )}
                    {event.notes && <p className="text-white/80 text-sm">{event.notes}</p>}
                  </div>
                  <Button
                    onClick={() => handleDeleteEvent(event.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-400/50 text-red-400 hover:bg-red-400/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
