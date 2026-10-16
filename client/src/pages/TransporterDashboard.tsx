import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, Phone } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { State, City } from "country-state-city";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import MarketRatesViewer from "@/components/MarketRatesViewer";

const TransporterDashboard = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("bookings");

    // Add Vehicle Form
    const [newVehicle, setNewVehicle] = useState({
        type: "",
        capacity: "",
        pricePerKm: "",
        driverName: "",
        licensePlate: "",
        image: "",
        city: "",
        state: "",
    });
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedState, setSelectedState] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [availableStates, setAvailableStates] = useState<any[]>([]);
    const [availableCities, setAvailableCities] = useState<any[]>([]);
    const [userName, setUserName] = useState("Transporter");

    useEffect(() => {
        setAvailableStates(State.getStatesOfCountry("IN"));
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.state) {
                setSelectedState(user.state);
                setNewVehicle(prev => ({ ...prev, state: user.state, city: user.city || "" }));
            }
            if (user.name) {
                setUserName(user.name);
            }
        }
        fetchVehicles();
        fetchBookings();

        // Auto-refresh bookings every 5 seconds
        const interval = setInterval(fetchBookings, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedState) {
            const s = availableStates.find(st => st.name === selectedState);
            if (s) setAvailableCities(City.getCitiesOfState("IN", s.isoCode));
        }
    }, [selectedState, availableStates]);

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get("/vehicles/my");
            setVehicles(data);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const { data } = await api.get("/bookings/my");
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the addition of a new vehicle by validating input fields, preparing form data,
     * sending a POST request to the server, and updating the UI accordingly.
     * 
     * - Validates that all required fields in `newVehicle` are filled.
     * - Appends vehicle data and image (if provided) to a FormData object.
     * - Sends the data to the `/vehicles` endpoint using a multipart/form-data request.
     * - On success, displays a success toast, closes the add vehicle modal, refreshes the vehicle list,
     *   and resets the form fields.
     * - On failure, displays an error toast with the appropriate message.
     * 
     * @async
     * @function
     * @returns {Promise<void>}
     */
    const handleAddVehicle = async () => {
        // Validation
        if (!newVehicle.type || !newVehicle.capacity || !newVehicle.pricePerKm || !newVehicle.driverName || !newVehicle.licensePlate || !newVehicle.city || !newVehicle.state) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('type', newVehicle.type);
            formData.append('capacity', newVehicle.capacity);
            formData.append('pricePerKm', newVehicle.pricePerKm);
            formData.append('driverName', newVehicle.driverName);
            formData.append('licensePlate', newVehicle.licensePlate);
            formData.append('city', newVehicle.city);
            formData.append('state', newVehicle.state);

            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (newVehicle.image) {
                formData.append('image', newVehicle.image);
            }

            await api.post("/vehicles", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success("Vehicle added successfully");
            setIsAddOpen(false);
            fetchVehicles();
            fetchBookings();
            // Reset form
            setNewVehicle({ ...newVehicle, type: "", capacity: "", pricePerKm: "", driverName: "", licensePlate: "", image: "" });
            setSelectedFile(null);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || "Failed to add vehicle";
            toast.error(message);
        }
    };

    const handleDeleteVehicle = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/vehicles/${id}`);
            toast.success("Vehicle deleted");
            setVehicles(prev => prev.filter(v => v._id !== id));
        } catch (error) {
            toast.error("Failed to delete vehicle");
        }
    };

    const handleBookingStatus = async (id: string, status: string) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            toast.success(`Booking ${status}`);
            fetchVehicles();
            fetchBookings();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <AgriculturalBackground />
            <div className="relative z-10">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-green-900">Welcome, {userName}</h1>
                            <p className="text-green-700">Manage your fleet and bookings</p>
                        </div>
                        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <SheetTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                                    <Plus className="w-4 h-4" /> Add Vehicle
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-[900px] overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Add New Vehicle</SheetTitle>
                                </SheetHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                                    {/* Left Column: Form */}
                                    <div className="space-y-4 order-2 md:order-1">
                                        <div className="space-y-2">
                                            <Label>Vehicle Type</Label>
                                            <Input
                                                placeholder="e.g. Truck, Tractor"
                                                value={newVehicle.type}
                                                onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Capacity (Quintals)</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 50"
                                                value={newVehicle.capacity}
                                                onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Price (₹ per km)</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 25"
                                                value={newVehicle.pricePerKm}
                                                onChange={(e) => setNewVehicle({ ...newVehicle, pricePerKm: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Driver Name</Label>
                                            <Input
                                                value={newVehicle.driverName}
                                                onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>License Plate</Label>
                                            <Input
                                                value={newVehicle.licensePlate}
                                                onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Vehicle Image</Label>
                                            <div className="space-y-2">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setSelectedFile(e.target.files[0]);
                                                        }
                                                    }}
                                                    className="cursor-pointer"
                                                />
                                                <div className="text-center text-xs text-muted-foreground my-1">- OR -</div>
                                                <Input
                                                    placeholder="Paste Image URL"
                                                    value={newVehicle.image}
                                                    onChange={(e) => setNewVehicle({ ...newVehicle, image: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={newVehicle.state}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setNewVehicle({ ...newVehicle, state: val, city: "" });
                                                    setSelectedState(val);
                                                }}
                                            >
                                                <option value="">Select State</option>
                                                {availableStates.map(s => (
                                                    <option key={s.isoCode} value={s.name}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={newVehicle.city}
                                                onChange={(e) => setNewVehicle({ ...newVehicle, city: e.target.value })}
                                                disabled={!newVehicle.state}
                                            >
                                                <option value="">Select City</option>
                                                {availableCities.map(c => (
                                                    <option key={c.name} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <Button onClick={handleAddVehicle} className="w-full bg-green-600 mt-4">Save Vehicle</Button>
                                    </div>

                                    {/* Right Column: Live Preview */}
                                    <div className="md:border-l md:pl-8 order-1 md:order-2 mb-6 md:mb-0">
                                        <h3 className="text-lg font-semibold mb-4 text-muted-foreground hidden md:block">Live Preview</h3>
                                        <div className="sticky top-4">
                                            <Card className="w-full max-w-sm mx-auto transform transition-all hover:scale-105 duration-300">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg flex justify-between">
                                                        {newVehicle.type || "Vehicle Type"}
                                                        <Badge variant="outline" className="text-xs font-normal">
                                                            {newVehicle.licensePlate || "XX-00-XX-0000"}
                                                        </Badge>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {newVehicle.city || "City"}, {newVehicle.state || "State"}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="text-sm space-y-4">
                                                    {(selectedFile || newVehicle.image) && (
                                                        <div className="w-full h-40 rounded-md overflow-hidden bg-gray-100 mb-4">
                                                            <img
                                                                src={selectedFile ? URL.createObjectURL(selectedFile) : newVehicle.image}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2671&auto=format&fit=crop";
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-muted-foreground block">Driver</span>
                                                            <span className="font-medium block truncate">{newVehicle.driverName || "Driver Name"}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-muted-foreground block">Capacity</span>
                                                            <span className="font-medium block">{newVehicle.capacity || "0"} Q</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
                                                        <span className="text-green-700 font-medium">Rate per km</span>
                                                        <span className="text-green-800 font-bold text-lg">₹{newVehicle.pricePerKm || "0"}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <p className="text-xs text-center text-muted-foreground mt-4 md:block hidden">
                                                This is how your vehicle card will appear to farmers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="w-full">
                        <div className="grid w-full grid-cols-2 max-w-[400px] bg-slate-100 p-1 rounded-lg mb-6">
                            <button
                                onClick={() => setActiveTab("bookings")}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === "bookings" ? "bg-white shadow text-green-700" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab("vehicles")}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === "vehicles" ? "bg-white shadow text-green-700" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                My Vehicles
                            </button>
                            <button
                                onClick={() => setActiveTab("market-rates")}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === "market-rates" ? "bg-white shadow text-green-700" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Market Rates
                            </button>
                        </div>

                        {activeTab === "bookings" && (
                            <div className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Booking Requests</CardTitle>
                                        <CardDescription>Manage your transport requests here.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {bookings.length === 0 ? (
                                            <p className="text-gray-500 py-8 text-center">No bookings yet.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {bookings.map((booking) => (
                                                    <div key={booking._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-gray-50">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                        booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {booking.status}
                                                                </span>
                                                                <span className="text-sm text-gray-400">
                                                                    {new Date(booking.date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-semibold">{booking.farmer?.name} needs {booking.vehicle?.type}</h4>
                                                            <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                                                                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> From: {booking.pickupLocation}</div>
                                                                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> To: {booking.dropoffLocation}</div>
                                                            </div>
                                                            {booking.farmer?.phone && (
                                                                <div className="flex items-center gap-1 text-sm text-green-700">
                                                                    <Phone className="w-3 h-3" /> {booking.farmer.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {booking.status === 'pending' && (
                                                            <div className="flex gap-2 mt-4 md:mt-0">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={() => handleBookingStatus(booking._id, 'rejected')}
                                                                >
                                                                    Reject
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() => handleBookingStatus(booking._id, 'accepted')}
                                                                >
                                                                    Accept
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === "vehicles" && (
                            <div className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {vehicles.map((vehicle) => (
                                        <Card key={vehicle._id}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex justify-between">
                                                    {vehicle.type}
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteVehicle(vehicle._id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </CardTitle>
                                                <CardDescription>{vehicle.licensePlate}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="text-sm space-y-2">
                                                {vehicle.image && (
                                                    <div className="w-full h-40 rounded-md overflow-hidden bg-gray-100 mb-4">
                                                        <img
                                                            src={vehicle.image}
                                                            alt={vehicle.type}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2671&auto=format&fit=crop";
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span>Driver:</span>
                                                    <span className="font-medium">{vehicle.driverName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Capacity:</span>
                                                    <span className="font-medium">{vehicle.capacity} Q</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Rate:</span>
                                                    <span className="font-medium">₹{vehicle.pricePerKm}/km</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "market-rates" && (
                            <div className="mt-6">
                                <MarketRatesViewer />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransporterDashboard;
