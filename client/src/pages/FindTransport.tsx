import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Search, Truck, Clock, CheckCircle } from "lucide-react";
import api from "@/services/api";
import { State, City } from "country-state-city";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const FindTransport = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [availableStates, setAvailableStates] = useState<any[]>([]);
    const [availableCities, setAvailableCities] = useState<any[]>([]);

    // Booking State
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({
        pickupLocation: "",
        dropoffLocation: "",
        date: "",
        cropType: "",
        weight: "",
        distance: "",
    });
    const [userBookings, setUserBookings] = useState<any[]>([]);

    useEffect(() => {
        setAvailableStates(State.getStatesOfCountry("IN"));
        // Try to prepopulate from user location
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.state) {
                setSelectedState(user.state);
                if (user.city) setSelectedCity(user.city);
            }
        }
    }, []);

    useEffect(() => {
        if (selectedState) {
            const s = availableStates.find(st => st.name === selectedState);
            if (s) setAvailableCities(City.getCitiesOfState("IN", s.isoCode));
        } else {
            setAvailableCities([]);
        }
    }, [selectedState, availableStates]);

    useEffect(() => {
        fetchVehicles();
        fetchMyBookings();
    }, [selectedState, selectedCity]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            let query = "/vehicles";
            const params = new URLSearchParams();
            if (selectedState) params.append("state", selectedState);
            if (selectedCity) params.append("city", selectedCity);

            if (params.toString()) query += `?${params.toString()}`;

            const response = await api.get(query);
            setVehicles(response.data);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            toast.error("Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const { data } = await api.get("/bookings/my");
            setUserBookings(data);
        } catch (error) {
            console.error("Error fetching bookings", error);
        }
    };

    const handleOpenBooking = (vehicle: any) => {
        console.log("Opening booking for:", vehicle);
        setSelectedVehicle(vehicle);
        setBookingDetails({
            pickupLocation: "",
            dropoffLocation: "",
            date: new Date().toISOString().split('T')[0],
            cropType: "",
            weight: "",
            distance: "",
        });
        setIsBookingOpen(true);
        console.log("Booking open state set to true");
    };

    const confirmBooking = async () => {
        if (!bookingDetails.pickupLocation || !bookingDetails.dropoffLocation || !bookingDetails.date || !bookingDetails.cropType || !bookingDetails.weight || !bookingDetails.distance) {
            toast.error("Please fill in all booking details");
            return;
        }

        const distanceVal = parseFloat(bookingDetails.distance);
        const weightVal = parseFloat(bookingDetails.weight);

        if (isNaN(distanceVal) || isNaN(weightVal)) {
            toast.error("Invalid distance or weight");
            return;
        }

        const totalPrice = distanceVal * selectedVehicle.pricePerKm;

        try {
            await api.post("/bookings", {
                transporterId: selectedVehicle.user._id,
                vehicleId: selectedVehicle._id,
                pickupLocation: bookingDetails.pickupLocation,
                dropoffLocation: bookingDetails.dropoffLocation,
                date: bookingDetails.date,
                cropType: bookingDetails.cropType,
                weight: weightVal,
                distance: distanceVal,
                totalPrice: totalPrice,
            });
            toast.success("Booking request sent successfully!");
            setIsBookingOpen(false);
            fetchMyBookings();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to book vehicle";
            toast.error(msg);
        }
    };

    const getBookingStatus = (vehicleId: string) => {
        // Check if there is a pending or accepted booking for this vehicle
        // Simplistic check: just check if ANY active booking exists for this vehicle by this user
        // Ideally backend handles filtering "bookable" vehicles, but for UI feedback:
        const booking = userBookings.find(b => b.vehicle._id === vehicleId && (b.status === 'pending' || b.status === 'accepted'));
        return booking ? booking.status : null;
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <AgriculturalBackground />
            <div className="relative z-10">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8 text-center max-w-2xl mx-auto">
                        <h1 className="text-3xl font-bold text-green-900 mb-2">Find Transport</h1>
                        <p className="text-green-700">Connect with trusted transporters to move your produce efficiently.</p>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8 max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-green-100 shadow-md">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> State</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setSelectedCity("");
                                        }}
                                    >
                                        <option value="">All States</option>
                                        {availableStates.map(s => (
                                            <option key={s.isoCode} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> City</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        disabled={!selectedState}
                                    >
                                        <option value="">All Cities</option>
                                        {availableCities.map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={fetchVehicles}>
                                    <Search className="w-4 h-4 mr-2" /> Search Vehicles
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading available vehicles...</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-12 bg-white/80 rounded-lg border border-dashed border-gray-300">
                            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
                            <p className="text-gray-500">Try adjusting your location filters to see more results.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map((vehicle) => {
                                const status = getBookingStatus(vehicle._id);
                                return (
                                    <Card key={vehicle._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <div className="h-48 overflow-hidden bg-gray-100 relative">
                                            <img
                                                src={vehicle.image || "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2671&auto=format&fit=crop"}
                                                alt={vehicle.type}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2671&auto=format&fit=crop";
                                                }}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-white/90 text-green-800 hover:bg-white border-green-200">
                                                    ₹{vehicle.pricePerKm}/km
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl">{vehicle.type}</CardTitle>
                                                    <CardDescription className="flex items-center mt-1">
                                                        <MapPin className="w-3 h-3 mr-1" /> {vehicle.city}, {vehicle.state}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline">{vehicle.capacity} Q</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm border-b pb-2">
                                                    <span className="text-gray-500">Transporter</span>
                                                    <span className="font-medium">{vehicle.user?.name || "Verified Partner"}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm border-b pb-2">
                                                    <span className="text-gray-500">Driver</span>
                                                    <span className="font-medium">{vehicle.driverName}</span>
                                                </div>
                                                {vehicle.user?.phone && (
                                                    <div className="flex items-center justify-between text-sm border-b pb-2">
                                                        <span className="text-gray-500">Contact</span>
                                                        <span className="font-medium flex items-center text-green-700">
                                                            <Phone className="w-3 h-3 mr-1" /> {vehicle.user.phone}
                                                        </span>
                                                    </div>
                                                )}

                                                {status === 'pending' ? (
                                                    <Button className="w-full mt-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-default">
                                                        <Clock className="w-4 h-4 mr-2" /> Waiting for Approval
                                                    </Button>
                                                ) : status === 'accepted' ? (
                                                    <Button className="w-full mt-2 bg-green-100 text-green-800 hover:bg-green-200 cursor-default">
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Booking Approved
                                                    </Button>
                                                ) : (
                                                    <Button className="w-full mt-2 bg-green-600 hover:bg-green-700" onClick={() => handleOpenBooking(vehicle)}>
                                                        Book Now
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {/* Booking Modal */}
                    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Book {selectedVehicle?.type}</DialogTitle>
                                <DialogDescription>
                                    Enter detailed trip information.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={bookingDetails.date}
                                            onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cropType">Crop Type</Label>
                                        <Input
                                            id="cropType"
                                            placeholder="e.g. Wheat"
                                            value={bookingDetails.cropType}
                                            onChange={(e) => setBookingDetails({ ...bookingDetails, cropType: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pickup">Pickup Location</Label>
                                    <Input
                                        id="pickup"
                                        placeholder="Farm Address / Location"
                                        value={bookingDetails.pickupLocation}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, pickupLocation: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dropoff">Dropoff Location</Label>
                                    <Input
                                        id="dropoff"
                                        placeholder="Mandi / Market Location"
                                        value={bookingDetails.dropoffLocation}
                                        onChange={(e) => setBookingDetails({ ...bookingDetails, dropoffLocation: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="weight">Total Weight (Q)</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            placeholder="e.g. 50"
                                            value={bookingDetails.weight}
                                            onChange={(e) => setBookingDetails({ ...bookingDetails, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="distance">Est. Distance (km)</Label>
                                        <Input
                                            id="distance"
                                            type="number"
                                            placeholder="e.g. 25"
                                            value={bookingDetails.distance}
                                            onChange={(e) => setBookingDetails({ ...bookingDetails, distance: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {bookingDetails.distance && selectedVehicle && (
                                    <div className="bg-green-50 p-4 rounded-lg mt-2 text-center border border-green-200">
                                        <p className="text-sm text-green-700">Estimated Price</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            ₹{(parseFloat(bookingDetails.distance) * selectedVehicle.pricePerKm).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-green-600">(@ ₹{selectedVehicle.pricePerKm}/km)</p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={confirmBooking} className="bg-green-600 hover:bg-green-700 w-full">
                                    Confirm Booking Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default FindTransport;
