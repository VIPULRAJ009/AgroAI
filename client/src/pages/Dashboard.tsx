import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Sparkles, FileText, Cloud, MessageSquare, UserCog, Loader2, ChevronRight } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import api from "@/services/api";
import axios from "axios";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import MandiPrices from "@/components/MandiPrices";

interface Recommendation {
  _id: string;
  crop: string;
  date: string;
  status: string;
  image: string;
  fieldName: string;
  predictedCrop: string;
  createdAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; image?: string } | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [healthSummary, setHealthSummary] = useState<string>("Loading insights...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Weather
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
            const weatherRes = await axios.get(
              `${import.meta.env.VITE_OPENWEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            setWeather(weatherRes.data);
          });
        }

        // 2. Fetch Recommendations History
        const { data: historyData } = await api.get("/predict/history");

        // Map history to display format
        const formattedRecs = historyData.map((rec: any) => ({
          _id: rec._id,
          crop: rec.predictedCrop,
          date: new Date(rec.createdAt).toLocaleDateString(),
          status: "Completed",
          image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
          fieldName: rec.fieldName,
          predictedCrop: rec.predictedCrop,
          ...rec
        }));

        setRecommendations(formattedRecs);

        // 3. Get Health Summary
        if (historyData.length > 0) {
          const latestRec = historyData[0];
          try {
            const { data: summaryData } = await api.post("/predict/health-summary", latestRec);
            setHealthSummary(summaryData.summary);
          } catch (err) {
            console.error("Failed to fetch health summary", err);
            setHealthSummary("Health insights unavailable.");
          }
        } else {
          setHealthSummary("No soil data available yet.");
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 relative w-full overflow-x-hidden">
      {/* Agricultural Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop')`, // Subtle Farm/Field Image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Gradient Overlay for Readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/90 via-white/70 to-white/50 pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-72 min-h-[calc(100vh-64px)] border-r border-border bg-card/80 backdrop-blur-sm hidden md:block">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {user.name?.charAt(0).toUpperCase() || " "}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">Farmer</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link to="/dashboard">
                  <Button variant="secondary" className="w-full justify-start gap-3 shadow-sm">
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/crop-recommender">
                  <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-green-50 hover:text-green-700">
                    <Sparkles className="w-5 h-5" />
                    Get Recommendation
                  </Button>
                </Link>
                <Link to="/soil-reports">
                  <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-blue-50 hover:text-blue-700">
                    <FileText className="w-5 h-5" />
                    Soil Reports
                  </Button>
                </Link>

                <Link to="/weather">
                  <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-orange-50 hover:text-orange-700">
                    <Cloud className="w-5 h-5" />
                    Weather Insights
                  </Button>
                </Link>

                <Link to="/feedback">
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <MessageSquare className="w-5 h-5" />
                    Feedback
                  </Button>
                </Link>
              </nav>

              <div className="mt-auto pt-8">
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground"
                  >
                    <UserCog className="w-5 h-5" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center mb-8 gap-4">
                {/* Mobile Sidebar Trigger - Moved to Left */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="icon" variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-full w-8 h-8">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                      <SheetHeader className="sr-only">
                        <SheetTitle>Dashboard Menu</SheetTitle>
                        <SheetDescription>Navigation options for the dashboard</SheetDescription>
                      </SheetHeader>
                      <div className="h-full flex flex-col p-6 bg-card/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-8">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt="User"
                              className="w-12 h-12 rounded-full object-cover border-2 border-green-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                              {user.name?.charAt(0).toUpperCase() || " "}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-foreground">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">Farmer</p>
                          </div>
                        </div>

                        <nav className="space-y-2">
                          <SheetClose asChild>
                            <Link to="/dashboard">
                              <Button variant="secondary" className="w-full justify-start gap-3 shadow-sm">
                                <LayoutDashboard className="w-5 h-5" />
                                Dashboard
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/crop-recommender">
                              <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-green-50 hover:text-green-700">
                                <Sparkles className="w-5 h-5" />
                                Get Recommendation
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/soil-reports">
                              <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-blue-50 hover:text-blue-700">
                                <FileText className="w-5 h-5" />
                                Soil Reports
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/weather">
                              <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-orange-50 hover:text-orange-700">
                                <Cloud className="w-5 h-5" />
                                Weather Insights
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/feedback">
                              <Button variant="ghost" className="w-full justify-start gap-3">
                                <MessageSquare className="w-5 h-5" />
                                Feedback
                              </Button>
                            </Link>
                          </SheetClose>

                        </nav>

                        <div className="mt-auto pt-8">
                          <SheetClose asChild>
                            <Link to="/profile">
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-muted-foreground"
                              >
                                <UserCog className="w-5 h-5" />
                                Edit Profile
                              </Button>
                            </Link>
                          </SheetClose>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome back, {user.name?.split(' ')[0] || "Farmer"}!</h1>
                  <p className="text-muted-foreground">Here's a summary of your farm's current status.</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Weather Card */}
                <Card className="p-6 relative overflow-hidden bg-white/90 backdrop-blur-sm border-blue-100 shadow-sm hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 pointer-events-none" />
                  <h3 className="text-sm text-muted-foreground mb-2 font-medium">Today's Weather</h3>
                  {weather ? (
                    <>
                      <div className="flex items-end gap-2 mb-2 relative z-10">
                        <span className="text-4xl font-bold text-slate-800">{Math.round(weather.main.temp)}°C</span>
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                          alt="weather icon"
                          className="w-10 h-10"
                        />
                      </div>
                      <p className="text-slate-600 mb-3 capitalize font-medium">{weather.weather[0].description}</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="animate-spin" /> Loading weather...
                    </div>
                  )}
                  <Link to="/weather">
                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600">
                      View Full Forecast
                    </Button>
                  </Link>
                </Card>

                {/* Soil Health Card */}
                <Card className="p-6 relative overflow-hidden bg-white/90 backdrop-blur-sm border-green-100 shadow-sm hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 pointer-events-none" />
                  <h3 className="text-sm text-muted-foreground mb-2 font-medium">Soil Health</h3>
                  <div className="flex items-end gap-2 mb-2 relative z-10">
                    <span className="text-2xl font-bold truncate text-slate-800">
                      {recommendations.length > 0 ? recommendations[0].predictedCrop : "No Data"}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3 text-sm line-clamp-2">
                    {healthSummary}
                  </p>
                  <Link to="/soil-reports">
                    <Button variant="link" className="p-0 h-auto font-semibold text-green-600">
                      View Soil Report
                    </Button>
                  </Link>
                </Card>

                {/* Active Recommendations Card */}
                <Card className="p-6 relative overflow-hidden bg-white/90 backdrop-blur-sm border-purple-100 shadow-sm hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 pointer-events-none" />
                  <h3 className="text-sm text-muted-foreground mb-2 font-medium">Active Recommendations</h3>
                  <div className="flex items-end gap-2 mb-2 relative z-10">
                    <span className="text-4xl font-bold text-slate-800">{recommendations.length}</span>
                  </div>
                  <p className="text-slate-600 mb-3">Total recommendations generated</p>
                  <Link to="/soil-reports">
                    <Button variant="link" className="p-0 h-auto font-semibold text-purple-600">
                      View Recommendations
                    </Button>
                  </Link>
                </Card>
              </div>


              {/* Mandi Prices Section */}
              <div className="mb-8">
                <MandiPrices />
              </div>

              {/* Recent Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Recent Recommendations</h2>
                  <Link to="/soil-reports">
                    <Button variant="link" className="text-primary font-semibold">
                      View All History
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-all border-slate-100 bg-white/80 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-2xl border border-green-100 shadow-sm">
                            🌱
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{rec.crop}</h3>
                            <p className="text-muted-foreground text-sm">{rec.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200"
                          >
                            {rec.status}
                          </Badge>
                          <Link to="/soil-reports">
                            <Button variant="link" className="text-primary font-semibold">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {recommendations.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-muted-foreground mb-2">No recommendations yet.</p>
                      <Link to="/crop-recommender">
                        <Button variant="outline">Start Analysis</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
