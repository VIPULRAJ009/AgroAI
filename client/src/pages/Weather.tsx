import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search, Sun, CloudRain, Cloud, CloudDrizzle, Loader2, Navigation, Wind, Droplets, Thermometer, ArrowUp, ArrowDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import DetailedWeatherCard from "@/components/DetailedWeatherCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import { motion, AnimatePresence } from "framer-motion";

// Types for API response
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
}

interface ForecastItem {
  dt: number;
  main: {
    temp_min: number;
    temp_max: number;
  };
  weather: {
    main: string;
    icon: string;
  }[];
  dt_txt: string;
}

const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  useEffect(() => {
    // Initial load: Try geolocation, fallback to Moscow
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData({ lat: position.coords.latitude, lon: position.coords.longitude });
        },
        (err) => {
          console.warn("Location access denied or failed. Falling back to default location.", err);
          fetchWeatherData({ cityId: 524901 });
        }
      );
    } else {
      console.warn("Geolocation not supported. Falling back to default location.");
      fetchWeatherData({ cityId: 524901 });
    }
  }, []);

  const fetchWeatherData = async (params: { lat?: number; lon?: number; cityId?: number; city?: string }) => {
    try {
      setLoading(true);
      setError(null);

      let weatherUrl = "";
      let forecastUrl = "";

      if (params.city) {
        weatherUrl = `${import.meta.env.VITE_OPENWEATHER_API_URL}/weather?q=${params.city}&appid=${API_KEY}&units=metric`;
        forecastUrl = `${import.meta.env.VITE_OPENWEATHER_API_URL}/forecast?q=${params.city}&appid=${API_KEY}&units=metric`;
      } else if (params.lat && params.lon) {
        weatherUrl = `${import.meta.env.VITE_OPENWEATHER_API_URL}/weather?lat=${params.lat}&lon=${params.lon}&appid=${API_KEY}&units=metric`;
        forecastUrl = `${import.meta.env.VITE_OPENWEATHER_API_URL}/forecast?lat=${params.lat}&lon=${params.lon}&appid=${API_KEY}&units=metric`;
      } else if (params.cityId) {
        weatherUrl = `${import.meta.env.VITE_OPENWEATHER_API_URL}/weather?id=${params.cityId}&appid=${API_KEY}&units=metric`;
        forecastUrl = `${import.meta.env.VITE_OPENWEATHER_API_URL}/forecast?id=${params.cityId}&appid=${API_KEY}&units=metric`;
      } else {
        throw new Error("Invalid parameters for weather fetch");
      }

      // Fetch Current Weather
      const weatherRes = await axios.get(weatherUrl);
      setWeather(weatherRes.data);

      // Fetch Forecast
      const forecastRes = await axios.get(forecastUrl);

      // Process forecast to get daily data (API returns 3-hour intervals)
      // We'll take one reading per day (e.g., at 12:00 PM) for the next 5 days
      const dailyForecast = forecastRes.data.list.filter((reading: ForecastItem) =>
        reading.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data. Please check the city name.");
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherData({ city: searchQuery });
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear": return Sun;
      case "clouds": return Cloud;
      case "rain": return CloudRain;
      case "drizzle": return CloudDrizzle;
      default: return Sun;
    }
  };

  // Prepare chart data from forecast
  const chartData = forecast.map(item => ({
    day: format(new Date(item.dt * 1000), "EEE"), // Mon, Tue, etc.
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity
  }));

  const advisories = [
    {
      title: "Weather Impact",
      desc: "Monitor local weather conditions closely for sudden changes in temperature or precipitation.",
      icon: "🌤️",
      color: "bg-orange-50 text-orange-700 border-orange-100"
    },
    {
      title: "Crop Care",
      desc: "Ensure crops receive adequate irrigation based on soil moisture levels and upcoming rain.",
      icon: "🌱",
      color: "bg-green-50 text-green-700 border-green-100"
    },
    {
      title: "Pest & Disease Control",
      desc: "Regularly inspect crops for signs of pests or disease, especially after humidity changes.",
      icon: "🔍",
      color: "bg-blue-50 text-blue-700 border-blue-100"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <AgriculturalBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-white drop-shadow-md" />
          <p className="text-white font-medium text-lg animate-pulse">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        <AgriculturalBackground />
        <div className="relative z-10">
          <Navbar />
          <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-[calc(100vh-100px)]">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200 text-center max-w-md">
              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                <CloudRain className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800">Retry</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      <AgriculturalBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 drop-shadow-sm mb-2 tracking-tight">Weather Insights</h1>
              <p className="text-slate-600 text-lg font-medium opacity-90">
                Detailed weather information for informed farming decisions.
              </p>
            </div>

            {/* Location and Search */}
            <div className="w-full lg:w-auto flex flex-col md:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm p-1.5 rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="pl-9 bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 w-[200px]"
                  />
                </div>
                <Button onClick={handleSearch} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white border-none h-8">Search</Button>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-700 shadow-sm">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">{weather?.name || "Unknown"}</span>
                </div>
                <Button
                  onClick={() => {
                    setLoading(true);
                    navigator.geolocation.getCurrentPosition((position) => {
                      fetchWeatherData({ lat: position.coords.latitude, lon: position.coords.longitude });
                    });
                  }}
                  size="icon"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                  title="Use Current Location"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Hero Weather Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-10 overflow-hidden relative min-h-[300px] border-none shadow-2xl rounded-3xl group">
              <img
                src="https://images.unsplash.com/photo-1601134467661-3d775b999c8b?q=80&w=1200&auto=format&fit=crop"
                alt="Weather background"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/10">
                    Current Conditions
                  </span>
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(), "MMMM do, yyyy")}
                  </span>
                </div>

                <h2 className="text-6xl md:text-7xl font-bold mb-4 tracking-tighter">
                  {Math.round(weather?.main.temp || 0)}°
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-2xl md:text-3xl font-medium capitalize flex items-center gap-2">
                    {weather?.weather[0].main}
                  </p>
                  <div className="h-2 w-2 rounded-full bg-white/50" />
                  <p className="text-xl text-white/80 capitalize">{weather?.weather[0].description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
                  {[
                    { label: "Humidity", value: `${weather?.main.humidity}%`, icon: Droplets },
                    { label: "Wind", value: `${weather?.wind.speed} m/s`, icon: Wind },
                    { label: "Pressure", value: `${weather?.main.pressure} hPa`, icon: ArrowDown }, // Using as barometer
                    { label: "Real Feel", value: `${Math.round(weather?.main.temp || 0)}°`, icon: Thermometer },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <p className="text-white/60 text-xs uppercase font-bold tracking-wider">{stat.label}</p>
                      <p className="text-lg font-bold flex items-center gap-2">
                        <stat.icon className="w-4 h-4 text-green-400" />
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Forecast */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="p-8 h-full bg-white/90 backdrop-blur-xl border-none shadow-xl rounded-3xl">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" /> 5-Day Forecast
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {forecast.map((day, index) => {
                    const Icon = getWeatherIcon(day.weather[0].main);
                    const isToday = index === 0;
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className={`
                        text-center p-4 rounded-2xl transition-all duration-300
                        flex flex-col items-center justify-between min-h-[160px] cursor-default
                        ${isToday
                            ? "bg-gradient-to-b from-green-50 to-white border border-green-200 shadow-md ring-1 ring-green-100"
                            : "bg-slate-50 hover:bg-white hover:shadow-lg border border-slate-100"}
                      `}
                      >
                        <p className={`font-bold mb-1 ${isToday ? "text-green-800" : "text-slate-600"}`}>
                          {format(new Date(day.dt * 1000), "EEE")}
                        </p>
                        <p className="text-xs text-slate-400 mb-3">{format(new Date(day.dt * 1000), "d MMM")}</p>

                        <div className={`p-3 rounded-full mb-3 ${isToday ? "bg-green-100 text-green-600" : "bg-white text-slate-400 shadow-sm"}`}>
                          <Icon className="w-8 h-8" />
                        </div>

                        <div className="flex flex-col items-center w-full">
                          <div className="flex justify-center items-end gap-1">
                            <span className={`text-xl font-bold ${isToday ? "text-slate-900" : "text-slate-800"}`}>{Math.round(day.main.temp_max)}°</span>
                            <span className={`text-sm mb-0.5 ${isToday ? "text-green-600/70" : "text-slate-400"}`}>{Math.round(day.main.temp_min)}°</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {forecast.length === 0 && <p className="col-span-5 text-center text-muted-foreground">No forecast data available.</p>}
                </div>
              </Card>
            </motion.div>

            {/* Current Conditions Detail / Trend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <Card className="p-8 h-full bg-white/90 backdrop-blur-xl border-none shadow-xl rounded-3xl flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-500" /> Temperature Trend
                </h3>
                <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar dataKey="temp" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Agricultural Advisory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 bg-white/90 backdrop-blur-xl border-none shadow-xl rounded-3xl">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" /> Agricultural Advisory
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {advisories.map((advisory, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className={`p-6 rounded-2xl border ${advisory.color} bg-opacity-40 transition-shadow hover:shadow-md cursor-default`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="text-3xl bg-white p-2 rounded-xl shadow-sm">{advisory.icon}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-2">{advisory.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{advisory.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Weather;