import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, MapPin, Loader2, Sprout, TrendingUp, Droplets, Thermometer, Wind, Beaker } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import { motion, AnimatePresence } from "framer-motion";

interface Report {
  _id: string;
  fieldName: string;
  createdAt: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  predictedCrop: string;
}

const SoilReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get("/predict/history");
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (report: Report) => {
    try {
      setGeneratingId(report._id);
      const { data } = await api.post("/predict/report", report);

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 167, 69); // Green color
      doc.text("Soil Analysis & Crop Report", 20, 20);

      // Meta Info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Field Name: ${report.fieldName}`, 20, 35);
      doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 20, 42);
      doc.text(`Recommended Crop: ${report.predictedCrop}`, 20, 49);

      // Parameters Table-like structure
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55, 190, 55);

      doc.setFontSize(10);
      doc.text(`Nitrogen: ${report.nitrogen}`, 20, 62);
      doc.text(`Phosphorus: ${report.phosphorus}`, 70, 62);
      doc.text(`Potassium: ${report.potassium}`, 120, 62);

      doc.text(`pH Level: ${report.ph}`, 20, 69);
      doc.text(`Temperature: ${report.temperature}°C`, 70, 69);
      doc.text(`Humidity: ${report.humidity}%`, 120, 69);

      doc.line(20, 75, 190, 75);

      // AI Analysis Content
      doc.setFontSize(14);
      doc.setTextColor(40, 167, 69);
      doc.text("Detailed Analysis", 20, 85);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      // Split text to fit page
      const splitText = doc.splitTextToSize(data.report, 170);
      let y = 95;

      // Add text with pagination
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], 20, y);
        y += 7;
      }

      doc.save(`Soil_Report_${report.fieldName.replace(/\s+/g, '_')}.pdf`);
      toast.success("Report generated successfully!");

      // Trigger Email
      try {
        await api.post("/predict/email-report", {
          ...report,
          cropName: report.predictedCrop,
          soilData: report,
          aiReport: data.report
        });
        toast.success("Report emailed to you!");
      } catch (emailError) {
        console.error("Failed to email report", emailError);
        toast.error("Report generated but failed to email.");
      }

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingId(null);
    }
  };

  const getAverage = (key: keyof Report) => {
    if (reports.length === 0) return 0;
    const sum = reports.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
    return (sum / reports.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      <AgriculturalBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-green-500 drop-shadow-sm mb-3 tracking-tight">
                Soil  <span className="text-4xl md:text-5xl font-extrabold text-green-700 drop-shadow-sm mb-3 tracking-tight">Reports</span>
              </h1>
              <p className="text-green-50 text-lg font-medium opacity-90">
                Manage your field data and generate insights
              </p>
            </div>
            <Link to="/crop-recommender">
              <Button size="lg" className="bg-white/10 hover:bg-white/20 text-green-600 border border-green-600 backdrop-blur-sm shadow-xl transition-all duration-300 group">
                <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                New Analysis
              </Button>
            </Link>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Reports", value: reports.length, icon: FileText, color: "text-blue-500", bg: "from-blue-50 to-white", border: "border-blue-100" },
              { label: "Avg Nitrogen", value: getAverage('nitrogen'), icon: Sprout, color: "text-green-500", bg: "from-green-50 to-white", border: "border-green-100" },
              { label: "Avg Phosphorus", value: getAverage('phosphorus'), icon: TrendingUp, color: "text-purple-500", bg: "from-purple-50 to-white", border: "border-purple-100" },
              { label: "Avg Potassium", value: getAverage('potassium'), icon: Sprout, color: "text-orange-500", bg: "from-orange-50 to-white", border: "border-orange-100" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              >
                <Card className={`p-6 border ${stat.border} shadow-sm bg-gradient-to-br ${stat.bg} backdrop-blur-md transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-600">{stat.label}</h3>
                    <div className={`p-2 rounded-full bg-white shadow-sm ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Reports List */}
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"
            >
              <FileText className="w-6 h-6 text-green-600" /> Recent Analysis
            </motion.h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                <p className="text-slate-600 font-medium animate-pulse">Fetching your reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl"
              >
                <Sprout className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Found</h3>
                <p className="text-slate-600 mb-6">Start by creating your first soil analysis.</p>
                <Link to="/crop-recommender">
                  <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 border-none">
                    Start Analysis
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {reports.map((report, index) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <Card className="overflow-hidden border-none shadow-lg bg-white/95 backdrop-blur-xl hover:shadow-2xl hover:bg-white transition-all duration-300 group relative">
                        {/* Left green accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-green-600" />

                        <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                              <div className="bg-green-50 p-3 rounded-2xl shadow-inner">
                                <Sprout className="w-8 h-8 text-green-600" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-green-700 transition-colors">
                                  {report.fieldName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                  <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 px-3 py-1 text-sm">
                                    Recommended: {report.predictedCrop}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-4 gap-x-8 border-t border-slate-100 pt-6">
                              {/* Stat Items */}
                              {[
                                { label: "pH Level", value: report.ph, icon: Beaker, color: "text-teal-600" },
                                { label: "Nitrogen", value: report.nitrogen, icon: Sprout, color: "text-blue-600" },
                                { label: "Phosphorus", value: report.phosphorus, icon: Sprout, color: "text-purple-600" },
                                { label: "Potassium", value: report.potassium, icon: Sprout, color: "text-pink-600" },
                                { label: "Temp", value: `${report.temperature}°C`, icon: Thermometer, color: "text-orange-600" },
                                { label: "Humidity", value: `${report.humidity}%`, icon: Droplets, color: "text-cyan-600" },
                              ].map((stat, i) => (
                                <div key={i} className="flex flex-col">
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{stat.label}</p>
                                  <p className={`font-bold text-lg md:text-xl ${stat.color} flex items-center gap-1.5`}>
                                    {/* Note: Icons can optionally be shown here, simplified for cleaner look */}
                                    {stat.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 lg:items-end justify-center lg:border-l lg:border-slate-100 lg:pl-8">
                            <Button
                              variant="default"
                              size="lg"
                              className="w-full lg:w-auto bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95 group/btn"
                              onClick={() => handleGenerateReport(report)}
                              disabled={generatingId === report._id}
                            >
                              {generatingId === report._id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-2 group-hover/btn:-translate-y-0.5 transition-transform" />
                              )}
                              {generatingId === report._id ? "Generating..." : "Download Report"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Start of dummy icon component to prevent crash if Beaker is not imported
// Actually Beaker is in lucide-react but was not in list. Adding it now.
// Checked import list: Beaker IS used in my code below but not imported at top.
// Wait, I need to make sure I import `Beaker` at the top. I see I missed it in the imports.
// I will fix imports in the same write.

export default SoilReports;
