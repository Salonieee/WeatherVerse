"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { getWeatherData, getWeatherByCity } from "@/lib/weather-service"

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

interface VoiceInteractionProps {
  location: { lat: number; lon: number }
}

export function VoiceInteraction({ location }: VoiceInteractionProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  }, [])

  const startListening = () => {
    if (!isSupported) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
      setResponse("")
    }

    recognition.onresult = async (event: any) => {
      const speechResult = event.results[0][0].transcript
      setTranscript(speechResult)
      await processVoiceCommand(speechResult)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const processVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase()
    let responseText = ""

    try {
      // Extract city from command for location-specific queries
      const cityFromCommand = extractCityFromCommand(lowerCommand)

      // Weather queries
      if (lowerCommand.includes("weather") || lowerCommand.includes("temperature")) {
        if (cityFromCommand) {
          try {
            const weather = await getWeatherByCity(cityFromCommand)
            responseText = `The weather in ${weather.city}, ${weather.country} is currently ${Math.round(weather.temperature)} degrees Celsius with ${weather.description}. The humidity is ${weather.humidity}% and wind speed is ${weather.windSpeed} meters per second. It feels like ${weather.feelsLike} degrees.`
          } catch {
            responseText = `I couldn't find weather information for ${cityFromCommand}. Please check the city name and try again.`
          }
        } else {
          const weather = await getWeatherData(location.lat, location.lon)
          responseText = `The current weather in ${weather.city} is ${Math.round(weather.temperature)} degrees Celsius with ${weather.description}. The humidity is ${weather.humidity}% and wind speed is ${weather.windSpeed} meters per second. It feels like ${weather.feelsLike} degrees.`
        }
      }
      // Clothing advice queries
      else if (
        lowerCommand.includes("what should i wear") ||
        lowerCommand.includes("clothing") ||
        lowerCommand.includes("dress")
      ) {
        if (cityFromCommand) {
          try {
            const weather = await getWeatherByCity(cityFromCommand)
            responseText = getClothingAdvice(weather, cityFromCommand)
          } catch {
            responseText = `I couldn't find weather information for ${cityFromCommand} to give clothing advice. Please check the city name and try again.`
          }
        } else {
          const weather = await getWeatherData(location.lat, location.lon)
          responseText = getClothingAdvice(weather)
        }
      }
      // Activity suggestions
      else if (
        lowerCommand.includes("what should i do") ||
        lowerCommand.includes("activity") ||
        lowerCommand.includes("plan")
      ) {
        if (cityFromCommand) {
          try {
            const weather = await getWeatherByCity(cityFromCommand)
            responseText = getActivitySuggestion(weather, cityFromCommand)
          } catch {
            responseText = `I couldn't find weather information for ${cityFromCommand} to suggest activities. Please check the city name and try again.`
          }
        } else {
          const weather = await getWeatherData(location.lat, location.lon)
          responseText = getActivitySuggestion(weather)
        }
      }
      // Travel advice
      else if (lowerCommand.includes("travel") || lowerCommand.includes("trip") || lowerCommand.includes("drive")) {
        if (cityFromCommand) {
          try {
            const weather = await getWeatherByCity(cityFromCommand)
            responseText = getTravelAdvice(weather, cityFromCommand)
          } catch {
            responseText = `I couldn't find weather information for ${cityFromCommand} to give travel advice. Please check the city name and try again.`
          }
        } else {
          const weather = await getWeatherData(location.lat, location.lon)
          responseText = getTravelAdvice(weather)
        }
      }
      // Temperature-specific queries
      else if (lowerCommand.includes("how hot") || lowerCommand.includes("how cold")) {
        if (cityFromCommand) {
          try {
            const weather = await getWeatherByCity(cityFromCommand)
            const temp = Math.round(weather.temperature)
            if (temp > 30) {
              responseText = `It's quite hot in ${weather.city}, ${weather.country} at ${temp} degrees Celsius. Make sure to stay hydrated and seek shade when possible!`
            } else if (temp < 10) {
              responseText = `It's quite cold in ${weather.city}, ${weather.country} at ${temp} degrees Celsius. Bundle up and stay warm!`
            } else {
              responseText = `The temperature in ${weather.city}, ${weather.country} is ${temp} degrees Celsius. It's quite comfortable!`
            }
          } catch {
            responseText = `I couldn't find temperature information for ${cityFromCommand}. Please check the city name and try again.`
          }
        } else {
          const weather = await getWeatherData(location.lat, location.lon)
          const temp = Math.round(weather.temperature)
          if (temp > 30) {
            responseText = `It's quite hot today at ${temp} degrees Celsius in ${weather.city}. Make sure to stay hydrated and seek shade when possible!`
          } else if (temp < 10) {
            responseText = `It's quite cold today at ${temp} degrees Celsius in ${weather.city}. Bundle up and stay warm!`
          } else {
            responseText = `The temperature is ${temp} degrees Celsius in ${weather.city}. It's quite comfortable today!`
          }
        }
      }
      // Greetings
      else if (lowerCommand.includes("hello") || lowerCommand.includes("hi") || lowerCommand.includes("hey")) {
        const weather = await getWeatherData(location.lat, location.lon)
        responseText = `Hello! I'm your WeatherVerse assistant. It's currently ${Math.round(weather.temperature)} degrees and ${weather.description} in ${weather.city}. I can help you with weather information for any city worldwide. How can I help you today?`
      }
      // Time-based queries
      else if (lowerCommand.includes("good morning") || lowerCommand.includes("morning")) {
        if (cityFromCommand) {
          try {
            const weather = await getWeatherByCity(cityFromCommand)
            responseText = `Good morning! It's a ${weather.description} day in ${weather.city}, ${weather.country} with ${Math.round(weather.temperature)} degrees. ${getMorningAdvice(weather)}`
          } catch {
            responseText = `Good morning! I couldn't find weather information for ${cityFromCommand}. Please check the city name and try again.`
          }
        } else {
          const weather = await getWeatherData(location.lat, location.lon)
          responseText = `Good morning! It's a ${weather.description} day in ${weather.city} with ${Math.round(weather.temperature)} degrees. ${getMorningAdvice(weather)}`
        }
      } else if (lowerCommand.includes("good evening") || lowerCommand.includes("evening")) {
        if (cityFromCommand) {
          try {
            const weather = await getWeatherByCity(cityFromCommand)
            responseText = `Good evening! The weather in ${weather.city}, ${weather.country} is ${weather.description} with ${Math.round(weather.temperature)} degrees. ${getEveningAdvice(weather)}`
          } catch {
            responseText = `Good evening! I couldn't find weather information for ${cityFromCommand}. Please check the city name and try again.`
          }
        } else {
          const weather = await getWeatherData(location.lat, location.lon)
          responseText = `Good evening! The weather in ${weather.city} is ${weather.description} with ${Math.round(weather.temperature)} degrees. ${getEveningAdvice(weather)}`
        }
      }
      // Comparison queries
      else if (lowerCommand.includes("compare") || lowerCommand.includes("difference")) {
        responseText =
          "To compare weather between cities, please use the Travel Planner tab where you can see detailed comparisons and travel recommendations."
      }
      // Help queries
      else if (lowerCommand.includes("help") || lowerCommand.includes("what can you do")) {
        responseText =
          "I can help you with weather information for any city worldwide! Try asking: 'What's the weather in Tokyo?', 'What should I wear in London?', 'Weather in New York', 'What should I do in Paris?', or 'Should I travel to Mumbai?'. I can provide weather, clothing advice, activity suggestions, and travel tips for any location."
      }
      // Default response
      else {
        const weather = await getWeatherData(location.lat, location.lon)
        responseText = `I'm here to help with weather information worldwide! Currently in ${weather.city}, it's ${Math.round(weather.temperature)} degrees and ${weather.description}. You can ask me about weather in any city, clothing advice, activities, or travel tips. For example, try 'Weather in Paris' or 'What should I wear in Tokyo?'. What would you like to know?`
      }

      setResponse(responseText)
      speakResponse(responseText)
    } catch {
      const errorResponse =
        "Sorry, I couldn't fetch the weather information right now. Please check your internet connection and try again."
      setResponse(errorResponse)
      speakResponse(errorResponse)
    }
  }

  const extractCityFromCommand = (command: string): string | null => {
    // Enhanced patterns for city extraction
    const patterns = [
      /weather in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /temperature in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /wear in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /do in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /travel to ([a-zA-Z\s,]+?)(?:\s|$)/,
      /trip to ([a-zA-Z\s,]+?)(?:\s|$)/,
      /morning in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /evening in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /hot in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /cold in ([a-zA-Z\s,]+?)(?:\s|$)/,
      /how is ([a-zA-Z\s,]+?)(?:\s|$)/,
      /what about ([a-zA-Z\s,]+?)(?:\s|$)/,
      /check ([a-zA-Z\s,]+?)(?:\s|$)/,
    ]

    for (const pattern of patterns) {
      const match = command.match(pattern)
      if (match && match[1]) {
        return match[1].trim().replace(/\s+/g, " ")
      }
    }
    return null
  }

  const getClothingAdvice = (weather: WeatherData, cityName?: string): string => {
    const temp = weather.temperature
    const condition = weather.condition.toLowerCase()
    const location = cityName || `${weather.city}, ${weather.country}`

    let advice = `For ${Math.round(temp)} degrees in ${location}, I recommend: `

    if (temp > 35) {
      advice +=
        "Very light, breathable clothing like cotton t-shirts, shorts, and sandals. Definitely wear sunscreen, a hat, and stay in shade!"
    } else if (temp > 30) {
      advice += "Light, breathable clothing like cotton t-shirts and shorts. Don't forget sunscreen and a hat!"
    } else if (temp > 25) {
      advice += "Comfortable summer wear like t-shirts, light pants or shorts. Light colors work best."
    } else if (temp > 20) {
      advice += "Comfortable casual wear like jeans and a t-shirt or light sweater."
    } else if (temp > 15) {
      advice += "Layer up with a light jacket or hoodie. Long pants and closed shoes would be good."
    } else if (temp > 10) {
      advice += "Wear a jacket or hoodie with long pants. Consider bringing a scarf."
    } else if (temp > 5) {
      advice += "Warm clothing like a coat, scarf, and gloves. Definitely wear layers!"
    } else if (temp > 0) {
      advice += "Heavy winter clothing! Coat, warm layers, gloves, hat, and warm boots are essential."
    } else {
      advice +=
        "Extreme cold protection! Heavy winter coat, multiple layers, insulated gloves, warm hat, scarf, and waterproof boots."
    }

    if (condition.includes("rain")) {
      advice += " Also, bring an umbrella or rain jacket as it's raining."
    } else if (condition.includes("snow")) {
      advice += " Also, wear waterproof boots and warm accessories as it's snowing."
    } else if (condition.includes("wind")) {
      advice += " Consider a windbreaker as it's windy."
    }

    return advice
  }

  const getActivitySuggestion = (weather: WeatherData, cityName?: string): string => {
    const temp = weather.temperature
    const condition = weather.condition.toLowerCase()
    const location = cityName || `${weather.city}, ${weather.country}`

    let suggestion = `With ${Math.round(temp)} degrees and ${weather.description} in ${location}, `

    if (condition.includes("rain")) {
      suggestion +=
        "it's perfect for indoor activities like visiting museums, shopping malls, cafes, reading, cooking, or watching movies."
    } else if (condition.includes("snow")) {
      suggestion +=
        "you could enjoy winter activities like building a snowman, skiing, or cozy indoor activities by the fireplace."
    } else if (temp > 30 && condition.includes("clear")) {
      suggestion +=
        "it's great for water activities like swimming, beach visits, or early morning/evening outdoor activities. Stay hydrated!"
    } else if (temp > 25 && condition.includes("clear")) {
      suggestion += "it's perfect for outdoor activities like hiking, picnics, sports, or sightseeing!"
    } else if (temp > 20 && !condition.includes("rain")) {
      suggestion += "it's nice for walking, light outdoor activities, exploring the city, or visiting parks."
    } else if (temp > 15) {
      suggestion +=
        "it's good for moderate outdoor activities like walking tours, visiting outdoor markets, or light hiking."
    } else if (temp > 10) {
      suggestion += "brief outdoor activities with proper clothing, or indoor activities like museums and cafes."
    } else if (temp < 5) {
      suggestion +=
        "indoor activities would be more comfortable, such as visiting museums, shopping centers, or cozy restaurants."
    } else {
      suggestion +=
        "it's decent for most activities with proper clothing. Maybe a nice walk or some light outdoor exploration."
    }

    return suggestion
  }

  const getTravelAdvice = (weather: WeatherData, cityName?: string): string => {
    const temp = weather.temperature
    const condition = weather.condition.toLowerCase()
    const windSpeed = weather.windSpeed
    const location = cityName || `${weather.city}, ${weather.country}`

    let advice = `For travel in ${location} with current conditions: `

    if (condition.includes("rain")) {
      advice +=
        "Roads may be wet and slippery. Drive carefully, use headlights, reduce speed, and allow extra time for your journey."
    } else if (condition.includes("snow")) {
      advice +=
        "Winter driving conditions! Use snow tires if available, drive slowly, keep extra distance, and check road conditions before traveling."
    } else if (windSpeed > 25) {
      advice +=
        "Very high winds detected. Avoid travel if possible, especially for high-profile vehicles. If you must travel, drive slowly and be prepared for sudden gusts."
    } else if (windSpeed > 15) {
      advice += "High winds detected. Be cautious of crosswinds, especially in high-profile vehicles or on bridges."
    } else if (temp < -5) {
      advice +=
        "Extreme cold may cause icy roads and vehicle issues. Warm up your vehicle, check tire pressure, and carry emergency supplies."
    } else if (temp < 0) {
      advice +=
        "Freezing temperatures may cause icy roads. Drive carefully, warm up your vehicle, and watch for black ice."
    } else if (condition.includes("clear") && temp > 15 && temp < 30) {
      advice += "Excellent conditions for travel! Clear roads, good visibility, and comfortable temperatures."
    } else if (temp > 35) {
      advice +=
        "Very hot conditions. Ensure your vehicle's cooling system is working, carry extra water, and avoid travel during peak heat hours."
    } else {
      advice += "Generally good conditions for travel. Standard precautions apply - drive safely and stay alert."
    }

    return advice
  }

  const getMorningAdvice = (weather: WeatherData): string => {
    const temp = weather.temperature
    const condition = weather.condition.toLowerCase()

    if (condition.includes("rain")) {
      return "Don't forget your umbrella for the day!"
    } else if (temp > 30) {
      return "It's going to be a hot day, start hydrating early!"
    } else if (temp < 10) {
      return "Bundle up, it's quite chilly this morning!"
    } else if (condition.includes("clear")) {
      return "Beautiful morning! Perfect for starting the day with some outdoor time."
    } else {
      return "Have a great day ahead!"
    }
  }

  const getEveningAdvice = (weather: WeatherData): string => {
    const temp = weather.temperature
    const condition = weather.condition.toLowerCase()

    if (condition.includes("clear") && temp > 20) {
      return "Perfect evening for a walk or outdoor dining!"
    } else if (condition.includes("rain")) {
      return "Cozy evening weather - perfect for staying in with a warm drink!"
    } else if (temp < 10) {
      return "It's getting chilly - time to warm up indoors!"
    } else if (condition.includes("clear")) {
      return "Clear evening skies - great for stargazing!"
    } else {
      return "Enjoy your evening!"
    }
  }

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1
      speechSynthesis.speak(utterance)
    }
  }

  if (!isSupported) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Voice Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            Voice recognition is not supported in your browser. Please use a modern browser like Chrome or Firefox.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-6 h-6" />
            Smart Global Weather Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-white/80 mb-4">
            Ask me about weather, clothing, activities, or travel for any city worldwide!
          </p>

          <Button
            onClick={startListening}
            disabled={isListening}
            size="lg"
            className={`w-24 h-24 rounded-full ${
              isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>

          <div className="space-y-2">
            <Badge variant={isListening ? "destructive" : "secondary"}>
              {isListening ? "Listening..." : "Ready to listen"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {transcript && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>You said:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">&quot;{transcript}&quot;</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>WeatherVerse Assistant:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{response}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Try asking about any city:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Badge variant="outline" className="text-white border-white/30 justify-start">
              &quot;What should I wear in Pune?&quot;
            </Badge>
            <Badge variant="outline" className="text-white border-white/30 justify-start">
              &quot;Weather in Tokyo&quot;
            </Badge>
            <Badge variant="outline" className="text-white border-white/30 justify-start">
              &quot;What should I do in London?&quot;
            </Badge>
            <Badge variant="outline" className="text-white border-white/30 justify-start">
              &quot;Should I travel to Mumbai?&quot;
            </Badge>
            <Badge variant="outline" className="text-white border-white/30 justify-start">
              &quot;How hot is it in Dubai?&quot;
            </Badge>
            <Badge variant="outline" className="text-white border-white/30 justify-start">
              &quot;Good morning in Paris&quot;
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
