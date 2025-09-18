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

interface OpenWeatherResponse {
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
  }>
  wind: {
    speed: number
  }
  visibility: number
  name: string
  sys: {
    country: string
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  if (!apiKey) {
    throw new Error("OpenWeatherMap API key is not configured")
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data: OpenWeatherResponse = await response.json()

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      city: data.name,
      country: data.sys.country,
      feelsLike: Math.round(data.main.feels_like),
      visibility: Math.round(data.visibility / 1000), // Convert to km
      pressure: data.main.pressure,
    }
  } catch (error) {
    console.error("Failed to fetch weather data:", error)
    throw error
  }
}

export async function getWeatherByCity(cityName: string): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  if (!apiKey) {
    throw new Error("OpenWeatherMap API key is not configured")
  }

  try {
    // Clean and format the city name for better search results
    const cleanCityName = cityName.trim().replace(/\s+/g, " ")

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanCityName)}&appid=${apiKey}&units=metric`,
    )

    if (!response.ok) {
      // If direct search fails, try with country code for common regions
      if (cleanCityName.toLowerCase().includes("assam")) {
        const assanResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Guwahati,IN&appid=${apiKey}&units=metric`,
        )
        if (assanResponse.ok) {
          const data: OpenWeatherResponse = await assanResponse.json()
          return {
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 10) / 10,
            city: "Guwahati (Assam)",
            country: data.sys.country,
            feelsLike: Math.round(data.main.feels_like),
            visibility: Math.round(data.visibility / 1000),
            pressure: data.main.pressure,
          }
        }
      }
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data: OpenWeatherResponse = await response.json()

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      city: data.name,
      country: data.sys.country,
      feelsLike: Math.round(data.main.feels_like),
      visibility: Math.round(data.visibility / 1000),
      pressure: data.main.pressure,
    }
  } catch (error) {
    console.error("Failed to fetch weather data for city:", error)
    throw error
  }
}
