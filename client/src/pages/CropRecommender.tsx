import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Sprout, Droplets, Thermometer, Wind, Beaker, CloudSun, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import api from "@/services/api";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";

const CropRecommender = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fieldName: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);


  const handleAutoFill = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please login to use this feature");
      return;
    }

    const user = JSON.parse(userData);
    if (!user.city) {
      toast.error("Please update your profile with a city to use this feature");
      return;
    }

    try {
      setIsAutoFilling(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${user.city}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
      );

      setFormData(prev => ({
        ...prev,
        temperature: response.data.main.temp.toFixed(1),
        humidity: response.data.main.humidity.toString(),
      }));
      toast.success(`Weather data fetched for ${user.city}`);
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast.error("Failed to fetch weather data");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        fieldName: formData.fieldName,
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        ph: Number(formData.ph),
        rainfall: Number(formData.rainfall),
      };

      // 1. Call ML Model Directly
      console.log("Calling ML Model...");
      const mlPayload = {
        N: payload.nitrogen,
        P: payload.phosphorus,
        K: payload.potassium,
        temperature: payload.temperature,
        humidity: payload.humidity,
        ph: payload.ph,
        rainfall: payload.rainfall
      };

      const mlResponse = await axios.post(import.meta.env.VITE_CROP_PREDICTION_API_URL, mlPayload);
      console.log("ML Response:", mlResponse.data);

      let predictedCrop = mlResponse.data.prediction;
      // Handle array response from ML model
      if (Array.isArray(predictedCrop)) {
        predictedCrop = predictedCrop[0];
      }

      if (!predictedCrop) {
        throw new Error("No prediction received from ML model");
      }

      // 2. Save to Backend History
      console.log("Saving to backend...");
      const { data } = await api.post("/predict/save", {
        ...payload,
        predictedCrop
      });
      console.log("Saved to backend:", data);

      navigate("/results", {
        state: {
          formData,
          prediction: { prediction: predictedCrop },
          recommendationId: data._id,
          type: "crop"
        }
      });
    } catch (error: any) {
      console.error("Error in recommendation process:", error);
      toast.error(error.response?.dataURL?.message || error.message || "Failed to get recommendation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background relative selection:bg-green-500/20">
      <LoadingScreen isLoading={isLoading} />
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
        {/* Left Side - Visuals & Info */}
        <div className="hidden lg:flex lg:col-span-5 bg-slate-900 relative overflow-hidden flex-col justify-center p-12 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 backdrop-blur-sm mb-8 border border-green-500/30">
              <Sparkles className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Smart Farming <br />
              <span className="text-green-400">Decision Support</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-md leading-relaxed">
              Leverage advanced machine learning to determine the perfect crop for your specific soil and environmental conditions.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Sprout className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Soil Analysis</h3>
                  <p className="text-sm text-slate-400">NPK values & pH levels</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Wind className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Environmental Data</h3>
                  <p className="text-sm text-slate-400">Temperature, Humidity & Rainfall</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:col-span-7 h-full overflow-y-auto bg-slate-50 p-6 lg:p-12 block">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Crop Predictor</h2>
                <p className="text-slate-500">Fill in the details below to get your recommendation.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
              >
                {isAutoFilling ? (
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin dark:border-green-400 dark:border-t-transparent" />
                ) : (
                  <CloudSun className="w-4 h-4" />
                )}
                Auto-fill Weather
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fieldName" className="text-slate-700 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" /> Field Name
                  </Label>
                  <Input
                    id="fieldName"
                    name="fieldName"
                    type="text"
                    placeholder="e.g., North Field"
                    value={formData.fieldName}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>

                {/* Nitrogen */}
                <div className="space-y-2">
                  <Label htmlFor="nitrogen" className="text-slate-700 font-medium flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" /> Nitrogen (N)
                  </Label>
                  <Input
                    id="nitrogen"
                    name="nitrogen"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 90"
                    value={formData.nitrogen}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>

                {/* Phosphorus */}
                <div className="space-y-2">
                  <Label htmlFor="phosphorus" className="text-slate-700 font-medium flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-purple-600" /> Phosphorus (P)
                  </Label>
                  <Input
                    id="phosphorus"
                    name="phosphorus"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 42"
                    value={formData.phosphorus}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>

                {/* Potassium */}
                <div className="space-y-2">
                  <Label htmlFor="potassium" className="text-slate-700 font-medium flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-pink-600" /> Potassium (K)
                  </Label>
                  <Input
                    id="potassium"
                    name="potassium"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 43"
                    value={formData.potassium}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>

                {/* pH */}
                <div className="space-y-2">
                  <Label htmlFor="ph" className="text-slate-700 font-medium flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-teal-600" /> pH Level
                  </Label>
                  <Input
                    id="ph"
                    name="ph"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 6.5"
                    value={formData.ph}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-slate-700 font-medium flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-600" /> Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 20.8"
                    value={formData.temperature}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>

                {/* Humidity */}
                <div className="space-y-2">
                  <Label htmlFor="humidity" className="text-slate-700 font-medium flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-600" /> Humidity (%)
                  </Label>
                  <Input
                    id="humidity"
                    name="humidity"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 82"
                    value={formData.humidity}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>

                {/* Rainfall */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rainfall" className="text-slate-700 font-medium flex items-center gap-2">
                    <Wind className="w-4 h-4 text-indigo-600" /> Rainfall (mm)
                  </Label>
                  <Input
                    id="rainfall"
                    name="rainfall"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 202.9"
                    value={formData.rainfall}
                    onChange={handleChange}
                    required
                    className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg shadow-lg hover:shadow-green-600/20 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Predict Crop
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 border-slate-200 hover:bg-slate-100 text-slate-600"
                  onClick={() => setFormData({
                    fieldName: "",
                    nitrogen: "",
                    phosphorus: "",
                    potassium: "",
                    temperature: "",
                    humidity: "",
                    ph: "",
                    rainfall: "",
                  })}
                >
                  Reset
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommender;
