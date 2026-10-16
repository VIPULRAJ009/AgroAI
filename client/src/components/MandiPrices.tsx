import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import api from "@/services/api";
import axios from 'axios';

// Constants
const METHOD_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const PLACEHOLDER_LOCATION = {
    latitude: 31.3260,
    longitude: 75.5762,
    district: "Jalandhar"
};

interface MarketData {
    commodity: string;
    market: string;
    modal_price: string;
    arrival_date: string;
    min_price: string;
    max_price: string;
}

const MandiPrices = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [district, setDistrict] = useState<string>("");
    const [prices, setPrices] = useState<MarketData[]>([]);
    const [source, setSource] = useState<"gps" | "default">("gps");

    useEffect(() => {
        initMandiPrices();
    }, []);

    const initMandiPrices = async () => {
        setLoading(true);
        setError(null);
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        await fetchDistrictAndPrices(latitude, longitude);
                        setSource("gps");
                    },
                    async (err) => {
                        console.warn("Geolocation denied/error:", err);
                        // Fallback to Jalandhar
                        setDistrict(PLACEHOLDER_LOCATION.district);
                        setSource("default");
                        await fetchPrices(PLACEHOLDER_LOCATION.district);
                    }
                );
            } else {
                // Fallback if no geolocation support
                setDistrict(PLACEHOLDER_LOCATION.district);
                setSource("default");
                await fetchPrices(PLACEHOLDER_LOCATION.district);
            }
        } catch (err) {
            console.error("Initialization error:", err);
            setError("Failed to load market data.");
            setLoading(false);
        }
    };

    const fetchDistrictAndPrices = async (lat: number, lon: number) => {
        try {
            // Reverse Geocoding
            const geoRes = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );

            let districtName = geoRes.data.address.state_district || geoRes.data.address.city || geoRes.data.address.county || "";

            // Data Cleaning: Remove "District"
            districtName = districtName.replace(/\s*District/i, "").trim();

            if (!districtName) {
                // Fallback if API returns weird data
                districtName = PLACEHOLDER_LOCATION.district;
                setSource("default");
            }

            setDistrict(districtName);
            await fetchPrices(districtName);

        } catch (err) {
            console.error("Geocoding error:", err);
            // Even if geocoding fails, fallback to default
            setDistrict(PLACEHOLDER_LOCATION.district);
            setSource("default");
            await fetchPrices(PLACEHOLDER_LOCATION.district);
        }
    };

    const fetchPrices = async (districtName: string) => {
        try {
            // Use backend proxy to avoid CORS
            const response = await api.get('/market', {
                params: {
                    filters: {
                        district_name: districtName
                    },
                    limit: 20
                }
            });

            const records = response.data.records.map((record: any) => ({
                commodity: record.commodity,
                market: record.market,
                modal_price: record.modal_price,
                arrival_date: record.arrival_date,
                min_price: record.min_price,
                max_price: record.max_price
            }));

            setPrices(records);
        } catch (err) {
            console.error("API Fetch error:", err);
            setError("Failed to fetch prices from government server.");
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        initMandiPrices();
    };

    if (loading) {
        return (
            <Card className="w-full h-64 flex items-center justify-center bg-white/50 backdrop-blur-sm border-orange-100">
                <div className="flex flex-col items-center gap-2 text-orange-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-medium">Fetching live market rates...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-white/90 backdrop-blur-sm border-orange-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-orange-50 bg-orange-50/30 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xl text-orange-950 flex items-center gap-2">
                            🌾 Market Rates near <span className="text-orange-600 underline decoration-dotted underline-offset-4">{district}</span>
                        </CardTitle>
                        {source === 'default' && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200" title="Using default location due to permission denial or error">
                                Default Location
                            </Badge>
                        )}
                    </div>
                    <button
                        onClick={refresh}
                        className="p-2 hover:bg-orange-100 rounded-full text-orange-600 transition-colors"
                        title="Refresh Prices"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {error ? (
                    <div className="p-8 text-center text-red-500 bg-red-50/50 flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8" />
                        <p>{error}</p>
                        <button onClick={refresh} className="text-sm underline">Try Again</button>
                    </div>
                ) : prices.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground bg-slate-50">
                        <p>No recent data found for {district}.</p>
                        <p className="text-xs mt-1">Try refreshing or checking back later.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-orange-50/50 hover:bg-orange-50/50">
                                    <TableHead className="text-orange-900 font-semibold">Commodity</TableHead>
                                    <TableHead className="text-orange-900 font-semibold">Market</TableHead>
                                    <TableHead className="text-right text-orange-900 font-semibold">Price (₹/Q)</TableHead>
                                    <TableHead className="text-right text-orange-900 font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prices.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-orange-50/30 transition-colors">
                                        <TableCell className="font-medium text-slate-800">{item.commodity}</TableCell>
                                        <TableCell className="text-slate-600">{item.market}</TableCell>
                                        <TableCell className="text-right font-bold text-green-700">₹{item.modal_price}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">{item.arrival_date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MandiPrices;
