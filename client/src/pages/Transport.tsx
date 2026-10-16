import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Calendar, IndianRupee, User } from "lucide-react";
import { State, City } from "country-state-city";
import api from "@/services/api";
import { toast } from "sonner";
import AgriculturalBackground from "@/components/AgriculturalBackground";

interface Vehicle {
    _id: string;
    type: string;
    capacity: number;
    pricePerKm: number;
    driverName: string;
    licensePlate: string;
    city: string;
    state: string;
    image?: string;
    user: {
        _id: string;
        name: string;
        phone: string;
    };
}

const Transport = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [availableStates, setAvailableStates] = useState<any[]>([]);
    const [availableCities, setAvailableCities] = useState<any[]>([]);

    // Booking Form State
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [bookingData, setBookingData] = useState({
        pickupLocation: "",
        dropoffLocation: "",
        date: "",
    });
    const [openBooking, setOpenBooking] = useState(false);

    useEffect(() => {
        setAvailableStates(State.getStatesOfCountry("IN"));
        // Load default user location if available
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.state) {
                setSelectedState(user.state);
                // Trigger city load
                const stateObj = State.getStatesOfCountry("IN").find(s => s.name === user.state);
                if (stateObj) {
                    const cities = City.getCitiesOfState("IN", stateObj.isoCode);
                    setAvailableCities(cities);
                    if (user.city) setSelectedCity(user.city);
                }
            }
        }
        fetchVehicles(); // Initial fetch
    }, []);

    useEffect(() => {
        if (selectedState) {
            const stateObj = availableStates.find(s => s.name === selectedState);
            if (stateObj) {
                setAvailableCities(City.getCitiesOfState("IN", stateObj.isoCode));
            }
        }
    }, [selectedState, availableStates]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            let query = "/vehicles";
            const params = new URLSearchParams();
            if (selectedCity) params.append("city", selectedCity);
            if (selectedState) params.append("state", selectedState);
            if (params.toString()) query += `?${params.toString()}`;

            const { data } = await api.get(query);
            setVehicles(data);
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
            toast.error("Failed to load available vehicles");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVehicles();
    };

    const handleBook = async () => {
        if (!selectedVehicle || !bookingData.pickupLocation || !bookingData.dropoffLocation || !bookingData.date) {
            toast.error("Please fill all booking details");
            return;
        }

        try {
            await api.post("/bookings", {
                transporterId: selectedVehicle.user._id || selectedVehicle.user, // Handle populated vs id
                vehicleId: selectedVehicle._id,
                ...bookingData,
            });
            toast.success("Booking request sent successfully!");
            setOpenBooking(false);
            setBookingData({ pickupLocation: "", dropoffLocation: "", date: "" });
        } catch (error) {
            console.error("Booking Error", error);
            toast.error("Failed to send booking request");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <AgriculturalBackground />
            <div className="relative z-10">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-green-900 mb-6 flex items-center gap-2">
                        <Truck className="w-8 h-8" />
                        Find Transport
                    </h1>

                    {/* Filter Section */}
                    <Card className="mb-8 bg-white/90 backdrop-blur">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="space-y-2 flex-1">
                                    <Label>State</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setSelectedCity("");
                                        }}
                                    >
                                        <option value="">Select State</option>
                                        {availableStates.map(s => (
                                            <option key={s.isoCode} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>City</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        disabled={!selectedState}
                                    >
                                        <option value="">Select City</option>
                                        {availableCities.map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    Search Vehicles
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Vehicles List */}
                    {loading ? (
                        <div className="text-center py-20">Loading vehicles...</div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-lg">
                            <h3 className="text-xl text-gray-600">No vehicles found in this location.</h3>
                            <p className="text-gray-500">Try broadening your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map((vehicle) => (
                                <Card key={vehicle._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-40 bg-gray-200 relative">
                                        {vehicle.image ? (
                                            <img src={vehicle.image} alt={vehicle.type} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200">
                                                <Truck className="w-16 h-16" />
                                            </div>
                                        )}
                                        <Badge className="absolute top-2 right-2 bg-green-600">
                                            {vehicle.type}
                                        </Badge>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>{vehicle.driverName}</span>
                                            <span className="text-sm font-normal text-gray-500 flex items-center">
                                                <User className="w-3 h-3 mr-1" /> Transporter
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-green-600" />
                                            {vehicle.city}, {vehicle.state}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-green-600" />
                                            Capacity: {vehicle.capacity} Quintals
                                        </div>
                                        <div className="flex items-center gap-2 font-semibold text-green-700">
                                            <IndianRupee className="w-4 h-4" />
                                            ₹{vehicle.pricePerKm} / km
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">
                                            License: {vehicle.licensePlate}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Sheet open={openBooking && selectedVehicle?._id === vehicle._id} onOpenChange={(open) => {
                                            setOpenBooking(open);
                                            if (open) setSelectedVehicle(vehicle);
                                            else setSelectedVehicle(null);
                                        }}>
                                            <SheetTrigger asChild>
                                                <Button className="w-full bg-green-600 hover:bg-green-700">Book Now</Button>
                                            </SheetTrigger>
                                            <SheetContent side="bottom" className="h-[80vh] sm:h-auto sm:max-w-md">
                                                <SheetHeader>
                                                    <SheetTitle>Book {vehicle.type} - {vehicle.driverName}</SheetTitle>
                                                </SheetHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Pickup Location</Label>
                                                        <Input
                                                            placeholder="Enter farm address..."
                                                            value={bookingData.pickupLocation}
                                                            onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Dropoff Location (Mandi)</Label>
                                                        <Input
                                                            placeholder="Enter Mandi name..."
                                                            value={bookingData.dropoffLocation}
                                                            onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={bookingData.date}
                                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                                        />
                                                    </div>
                                                    <Button onClick={handleBook} className="w-full bg-green-600">
                                                        Confirm Booking Request
                                                    </Button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transport;
