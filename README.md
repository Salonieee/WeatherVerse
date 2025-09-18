# WeatherVerse 🌤️

A comprehensive weather application built with Next.js 15, React 19, and TypeScript that provides real-time weather data, travel planning, voice interaction, analytics, and more. WeatherVerse offers a modern, intuitive interface for weather monitoring and lifestyle management.

## ✨ Features

### 🌦️ Weather Dashboard

- Real-time weather data for current location
- City search functionality
- Detailed weather metrics (temperature, humidity, wind speed, visibility, pressure)
- Weather history tracking
- Mood-based weather suggestions

### 🛫 Travel Planner

- Weather-based travel recommendations
- Destination planning with weather considerations
- Travel itinerary management

### 🎤 Voice Interaction

- Voice-activated weather queries
- Hands-free weather information access
- Speech-to-text weather commands

### 📅 Calendar Integration

- Weather-aware calendar view
- Event planning with weather context
- Schedule optimization based on weather conditions

### 📊 Analytics Dashboard

- Weather pattern analysis
- Historical data visualization
- Personal weather insights and trends

### ❤️ Favorite Locations

- Save and manage favorite weather locations
- Quick access to frequently checked places
- Location-based weather alerts

### 🎵 Mood Integration

- Weather-based mood tracking
- Music suggestions based on weather
- Productivity recommendations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Weather API**: OpenWeatherMap

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18.0 or higher)
- npm, yarn, or pnpm package manager
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/WeatherVerse.git
cd WeatherVerse
```

### 2. Install Dependencies

Choose one of the following package managers:

**Using npm:**

```bash
npm install
```

**Using yarn:**

```bash
yarn install
```

**Using pnpm:**

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add your OpenWeatherMap API key:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**To get an OpenWeatherMap API key:**

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API keys section
4. Copy your API key and paste it in the `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 5. Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
# or
pnpm build
pnpm start
```

## 🎯 Usage

1. **First Time Setup**: Create an account or login to access the application
2. **Location Access**: Allow location access for automatic weather detection
3. **Explore Features**: Navigate through different tabs to access various features:
   - **Weather**: View current weather and search for other cities
   - **Travel**: Plan trips with weather considerations
   - **Voice**: Use voice commands for weather queries
   - **Calendar**: View weather-aware calendar
   - **Analytics**: Analyze weather patterns and trends
   - **Favorites**: Manage your favorite locations

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```text
WeatherVerse/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── ui/                # Reusable UI components
│   └── *.tsx              # Feature components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🌐 API Integration

This application integrates with:

- **OpenWeatherMap API**: For real-time weather data
- **Browser Geolocation API**: For location detection
- **Web Speech API**: For voice interaction features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your OpenWeatherMap API key is correctly set in `.env.local`
2. **Location Access Denied**: The app will use a default location (New York) if geolocation is denied
3. **Build Errors**: Make sure all dependencies are installed and Node.js version is compatible

### Getting Help

If you encounter any issues, please:

1. Check the [Issues](https://github.com/your-username/WeatherVerse/issues) page
2. Create a new issue with detailed information about the problem
3. Include your environment details (OS, Node.js version, etc.)

## 🙏 Acknowledgments

- OpenWeatherMap for providing weather data
- Radix UI for accessible component primitives
- Lucide for beautiful icons
- The Next.js team for the amazing framework

---

## Happy Weather Monitoring! 🌤️
