// localStorage utilities for WeatherVerse
export interface User {
  id: string
  username: string
  email: string
  preferences: {
    temperatureUnit: "celsius" | "fahrenheit"
    theme: "auto" | "light" | "dark"
    notifications: boolean
  }
  loginTime: string
}

export interface WeatherHistoryEntry {
  id: string
  date: string
  city: string
  country: string
  temperature: number
  condition: string
  description: string
  mood?: "happy" | "neutral" | "sad" | "energetic" | "calm"
  productivity?: 1 | 2 | 3 | 4 | 5
  coordinates: { lat: number; lon: number }
}

export interface FavoriteLocation {
  id: string
  name: string
  city: string
  country: string
  customName?: string
  coordinates: { lat: number; lon: number }
  notifications: {
    temperatureAlerts: boolean
    conditionAlerts: boolean
    threshold: number
  }
  addedDate: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  coordinates?: { lat: number; lon: number }
  weatherForecast?: {
    temperature: number
    condition: string
    description: string
  }
  notes?: string
}

export interface NotificationPreferences {
  temperatureAlerts: boolean
  conditionAlerts: boolean
  favoriteLocationAlerts: boolean
  thresholds: {
    highTemp: number
    lowTemp: number
    conditions: string[]
  }
}

export interface AnalyticsData {
  mostVisitedCities: Array<{ city: string; count: number }>
  averageTemperature: number
  mostCommonWeather: string
  moodPatterns: Array<{ weather: string; mood: string; count: number }>
  productivityData: Array<{ weather: string; productivity: number; count: number }>
  totalSearches: number
}

// Storage keys
const STORAGE_KEYS = {
  USER: "weatherverse_user",
  WEATHER_HISTORY: "weatherverse_weather_history",
  FAVORITES: "weatherverse_favorites",
  CALENDAR: "weatherverse_calendar",
  NOTIFICATIONS: "weatherverse_notifications",
  ANALYTICS: "weatherverse_analytics",
  RECENT_SEARCHES: "weatherverse_recent_searches",
}

// User management
export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export const getUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.USER)
  return user ? JSON.parse(user) : null
}

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER)
}

// Weather history
export const saveWeatherHistory = (entry: WeatherHistoryEntry): void => {
  const history = getWeatherHistory()
  history.unshift(entry)
  // Keep only last 100 entries
  const limitedHistory = history.slice(0, 100)
  localStorage.setItem(STORAGE_KEYS.WEATHER_HISTORY, JSON.stringify(limitedHistory))
  updateAnalytics(entry)
}

export const getWeatherHistory = (): WeatherHistoryEntry[] => {
  const history = localStorage.getItem(STORAGE_KEYS.WEATHER_HISTORY)
  return history ? JSON.parse(history) : []
}

// Favorite locations
export const saveFavoriteLocation = (location: FavoriteLocation): void => {
  const favorites = getFavoriteLocations()
  const existingIndex = favorites.findIndex((fav) => fav.city === location.city && fav.country === location.country)

  if (existingIndex >= 0) {
    favorites[existingIndex] = location
  } else {
    favorites.push(location)
  }

  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
}

export const getFavoriteLocations = (): FavoriteLocation[] => {
  const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES)
  return favorites ? JSON.parse(favorites) : []
}

export const removeFavoriteLocation = (id: string): void => {
  const favorites = getFavoriteLocations().filter((fav) => fav.id !== id)
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
}

// Calendar events
export const saveCalendarEvent = (event: CalendarEvent): void => {
  const events = getCalendarEvents()
  const existingIndex = events.findIndex((e) => e.id === event.id)

  if (existingIndex >= 0) {
    events[existingIndex] = event
  } else {
    events.push(event)
  }

  localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events))
}

export const getCalendarEvents = (): CalendarEvent[] => {
  const events = localStorage.getItem(STORAGE_KEYS.CALENDAR)
  return events ? JSON.parse(events) : []
}

export const removeCalendarEvent = (id: string): void => {
  const events = getCalendarEvents().filter((event) => event.id !== id)
  localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events))
}

// Notification preferences
export const saveNotificationPreferences = (prefs: NotificationPreferences): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(prefs))
}

export const getNotificationPreferences = (): NotificationPreferences => {
  const prefs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  return prefs
    ? JSON.parse(prefs)
    : {
        temperatureAlerts: true,
        conditionAlerts: true,
        favoriteLocationAlerts: true,
        thresholds: {
          highTemp: 30,
          lowTemp: 5,
          conditions: ["rain", "snow", "storm"],
        },
      }
}

// Analytics
const updateAnalytics = (entry: WeatherHistoryEntry): void => {
  const analytics = getAnalytics()

  // Update most visited cities
  const cityIndex = analytics.mostVisitedCities.findIndex((c) => c.city === entry.city)
  if (cityIndex >= 0) {
    analytics.mostVisitedCities[cityIndex].count++
  } else {
    analytics.mostVisitedCities.push({ city: entry.city, count: 1 })
  }

  // Update analytics data
  analytics.totalSearches++

  // Update mood patterns
  if (entry.mood) {
    const moodIndex = analytics.moodPatterns.findIndex((m) => m.weather === entry.condition && m.mood === entry.mood)
    if (moodIndex >= 0) {
      analytics.moodPatterns[moodIndex].count++
    } else {
      analytics.moodPatterns.push({ weather: entry.condition, mood: entry.mood, count: 1 })
    }
  }

  // Update productivity data
  if (entry.productivity) {
    const prodIndex = analytics.productivityData.findIndex((p) => p.weather === entry.condition)
    if (prodIndex >= 0) {
      analytics.productivityData[prodIndex].productivity =
        (analytics.productivityData[prodIndex].productivity * analytics.productivityData[prodIndex].count +
          entry.productivity) /
        (analytics.productivityData[prodIndex].count + 1)
      analytics.productivityData[prodIndex].count++
    } else {
      analytics.productivityData.push({ weather: entry.condition, productivity: entry.productivity, count: 1 })
    }
  }

  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics))
}

export const getAnalytics = (): AnalyticsData => {
  const analytics = localStorage.getItem(STORAGE_KEYS.ANALYTICS)
  return analytics
    ? JSON.parse(analytics)
    : {
        mostVisitedCities: [],
        averageTemperature: 0,
        mostCommonWeather: "",
        moodPatterns: [],
        productivityData: [],
        totalSearches: 0,
      }
}

// Recent searches
export const saveRecentSearch = (city: string): void => {
  const searches = getRecentSearches()
  const filtered = searches.filter((s) => s !== city)
  filtered.unshift(city)
  const limited = filtered.slice(0, 10)
  localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(limited))
}

export const getRecentSearches = (): string[] => {
  const searches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES)
  return searches ? JSON.parse(searches) : []
}
