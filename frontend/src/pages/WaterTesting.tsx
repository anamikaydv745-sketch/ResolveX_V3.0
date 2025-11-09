// --- Imports ---
import { useState } from "react";
// <-- NEW: Added Loader2 for loading spinner, CheckCircle and XCircle for modal
import {
  Droplet,
  MapPin,
  AlertTriangle,
  TrendingDown,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// <-- NEW: Added Dialog components for the modal
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import WaterAnalytics from "@/components/WaterAnalytics";
import WaterQualityHeatMap from "@/components/WaterQualityHeatMap";

// <-- NEW: Define a type for our prediction results
type PredictionResult = {
  status: "Good" | "Poor" | "Moderate";
  ph: number | null;
  turbidity: number | null;
  coliform: string;
  recommendations: string[];
};

const WaterTesting = () => {
  const { toast } = useToast();

  // --- Form States ---
  const [location, setLocation] = useState("");
  const [source, setSource] = useState(""); // <-- NEW
  const [ph, setPh] = useState(""); // <-- NEW
  const [turbidity, setTurbidity] = useState(""); // <-- NEW
  const [oxygen, setOxygen] = useState(""); // <-- NEW
  const [temperature, setTemperature] = useState(""); // <-- NEW
  const [nitrate, setNitrate] = useState(""); // <-- NEW
  const [coliform, setColiform] = useState(""); // <-- NEW

  // --- UI/Modal States ---
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- NEW: For submit loader
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- NEW: To control modal
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null); // <-- NEW: To hold modal data

  // --- Geolocation Function (Unchanged) ---
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `Lat: ${position.coords.latitude.toFixed(
            4
          )}, Long: ${position.coords.longitude.toFixed(4)}`;
          setLocation(coords);
          toast({
            title: "Location Captured",
            description: coords,
          });
          setIsFetchingLocation(false);
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
          });
          setIsFetchingLocation(false);
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
    }
  };

  // <-- NEW: Mock prediction function to simulate analysis
  const generateMockPrediction = (): PredictionResult => {
    const numPh = parseFloat(ph) || 7;
    const numTurbidity = parseFloat(turbidity) || 1;
    const numNitrate = parseFloat(nitrate) || 1;

    let status: PredictionResult["status"] = "Good";
    let recommendations: string[] = ["Water appears safe for general use."];

    if (
      numPh < 6.5 ||
      numPh > 8.5 ||
      numTurbidity > 5 ||
      numNitrate > 10 ||
      coliform === "present" ||
      coliform === "high"
    ) {
      status = "Poor";
      recommendations = [
        "Action Required: Water is not safe for consumption.",
        "Notify local health authorities immediately.",
        "Boil water before use.",
      ];
    } else if (numPh < 7 || numTurbidity > 3) {
      status = "Moderate";
      recommendations = [
        "Water quality is moderate. Monitor closely.",
        "Consider using a water filter for drinking.",
      ];
    }

    return {
      status,
      ph: parseFloat(ph) || null,
      turbidity: parseFloat(turbidity) || null,
      coliform: coliform || "N/A",
      recommendations,
    };
  };

  // <-- MODIFIED: Updated handleSubmit to show loader and trigger modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPredictionResult(null);

    // Simulate an API call for prediction (2-second delay)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Generate the mock prediction
      const result = generateMockPrediction();
      setPredictionResult(result);
      setIsModalOpen(true); // Open the modal

      toast({
        title: "Prediction Complete!",
        description: "Your water quality analysis is ready.",
      });

      // Optional: Reset form fields after successful submission
      // setLocation(""); setSource(""); setPh(""); setTurbidity("");
      // setOxygen(""); setTemperature(""); setNitrate(""); setColiform("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not process your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Stop the loader
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* ... (Header text and TabsList are unchanged) ... */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Water Quality Monitoring
            </h1>
            <p className="text-lg text-muted-foreground">
              Log water test results to help monitor and protect your
              community's water sources
            </p>
          </div>

          <Tabs defaultValue="log-data" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="log-data">Log Data</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            </TabsList>

            <TabsContent value="log-data" className="space-y-8">
              <div className="max-w-4xl mx-auto">
                <Card className="shadow-elevated">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Digital Input Dashboard
                    </CardTitle>
                    <CardDescription>
                      Enter readings from your water testing kit or IoT sensors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Location (This section was already correct) */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="location"
                          className="text-base font-semibold"
                        >
                          Testing Location{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="location"
                            placeholder="e.g., River Bank or fetched coordinates"
                            className="flex-1"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            disabled={isFetchingLocation}
                          >
                            <MapPin
                              className={`h-4 w-4 ${
                                isFetchingLocation ? "animate-spin" : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </div>

                      {/* Water Source */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="source"
                          className="text-base font-semibold"
                        >
                          Water Source Type{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        {/* <-- MODIFIED: Added value and onValueChange */}
                        <Select
                          required
                          value={source}
                          onValueChange={setSource}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select water source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="river">River</SelectItem>
                            <SelectItem value="lake">Lake</SelectItem>
                            <SelectItem value="groundwater">
                              Groundwater/Well
                            </SelectItem>
                            <SelectItem value="tap">Tap Water</SelectItem>
                            <SelectItem value="industrial">
                              Industrial Discharge
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Test Parameters Grid */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Test Parameters
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* pH Level */}
                          <div className="space-y-2">
                            <Label htmlFor="ph">
                              pH Level{" "}
                              <span className="text-muted-foreground text-sm">
                                (0-14)
                              </span>
                            </Label>
                            {/* <-- MODIFIED: Added value and onChange */}
                            <Input
                              id="ph"
                              type="number"
                              step="0.1"
                              min="0"
                              max="14"
                              placeholder="e.g., 7.2"
                              value={ph}
                              onChange={(e) => setPh(e.target.value)}
                            />
                          </div>

                          {/* Turbidity */}
                          <div className="space-y-2">
                            <Label htmlFor="turbidity">
                              Turbidity{" "}
                              <span className="text-muted-foreground text-sm">
                                (NTU)
                              </span>
                            </Label>
                            {/* <-- MODIFIED: Added value and onChange */}
                            <Input
                              id="turbidity"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 5.0"
                              value={turbidity}
                              onChange={(e) => setTurbidity(e.target.value)}
                            />
                          </div>

                          {/* Dissolved Oxygen */}
                          <div className="space-y-2">
                            <Label htmlFor="oxygen">
                              Dissolved Oxygen{" "}
                              <span className="text-muted-foreground text-sm">
                                (mg/L)
                              </span>
                            </Label>
                            {/* <-- MODIFIED: Added value and onChange */}
                            <Input
                              id="oxygen"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 8.5"
                              value={oxygen}
                              onChange={(e) => setOxygen(e.target.value)}
                            />
                          </div>

                          {/* Temperature */}
                          <div className="space-y-2">
                            <Label htmlFor="temperature">
                              Temperature{" "}
                              <span className="text-muted-foreground text-sm">
                                (°C)
                              </span>
                            </Label>
                            {/* <-- MODIFIED: Added value and onChange */}
                            <Input
                              id="temperature"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 25.0"
                              value={temperature}
                              onChange={(e) => setTemperature(e.target.value)}
                            />
                          </div>

                          {/* Nitrate */}
                          <div className="space-y-2">
                            <Label htmlFor="nitrate">
                              Nitrate{" "}
                              <span className="text-muted-foreground text-sm">
                                (mg/L)
                              </span>
                            </Label>
                            {/* <-- MODIFIED: Added value and onChange */}
                            <Input
                              id="nitrate"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 10.0"
                              value={nitrate}
                              onChange={(e) => setNitrate(e.target.value)}
                            />
                          </div>

                          {/* Coliform */}
                          <div className="space-y-2">
                            <Label htmlFor="coliform">Coliform Presence</Label>
                            {/* <-- MODIFIED: Added value and onValueChange */}
                            <Select value={coliform} onValueChange={setColiform}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="high">
                                  High Levels
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* ... (IoT Sensor and Alert Info blocks are unchanged) ... */}
                      <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 flex items-start gap-3">
                        <Droplet className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-secondary-foreground mb-1">
                            IoT Sensor Integration
                          </p>
                          <p className="text-muted-foreground">
                            Have IoT sensors? Connect them to automatically sync
                            real-time water quality data with our platform for
                            continuous monitoring.
                          </p>
                        </div>
                      </div>

                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-accent-foreground mb-1">
                            Automatic Alerts
                          </p>
                          <p className="text-muted-foreground">
                            If readings indicate unsafe water quality, SMS/email
                            alerts will be sent to registered citizens and local
                            authorities automatically.
                          </p>
                        </div>
                      </div>


                      {/* <-- MODIFIED: Submit Button with loader */}
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        variant="secondary"
                        disabled={isSubmitting} // <-- Disable when loading
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Data...
                          </>
                        ) : (
                          "Log Water Test Data"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* ... (Water Quality Guidelines card is unchanged) ... */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Water Quality Guidelines</CardTitle>
                    <CardDescription>
                      Reference values for safe drinking water
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          pH Level
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: 6.5 - 8.5
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Turbidity
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: &lt; 5 NTU
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Dissolved Oxygen
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: &gt; 6 mg/L
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Nitrate
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: &lt; 10 mg/L
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Coliform
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: Absent
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Temperature
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Normal: 20-30°C
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <WaterAnalytics />
            </TabsContent>

            <TabsContent value="heatmap">
              <WaterQualityHeatMap />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* --- NEW: Prediction Result Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Water Quality Prediction</DialogTitle>
            <DialogDescription>
              Analysis based on the data provided for{" "}
              {location || "your location"}.
            </DialogDescription>
          </DialogHeader>

          {!predictionResult ? (
            // Loader inside modal (in case result is null)
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            // Prediction Result Content
            <div className="space-y-4">
              {/* Status Badge */}
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  predictionResult.status === "Good"
                    ? "bg-green-100 dark:bg-green-900/50"
                    : predictionResult.status === "Moderate"
                    ? "bg-yellow-100 dark:bg-yellow-900/50"
                    : "bg-red-100 dark:bg-red-900/50"
                }`}
              >
                {predictionResult.status === "Good" && (
                  <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-400" />
                )}
                {predictionResult.status === "Moderate" && (
                  <AlertTriangle className="h-6 w-6 text-yellow-700 dark:text-yellow-400" />
                )}
                {predictionResult.status === "Poor" && (
                  <XCircle className="h-6 w-6 text-red-700 dark:text-red-400" />
                )}
                <span
                  className={`font-bold text-lg ${
                    predictionResult.status === "Good"
                      ? "text-green-800 dark:text-green-300"
                      : predictionResult.status === "Moderate"
                      ? "text-yellow-800 dark:text-yellow-300"
                      : "text-red-800 dark:text-red-300"
                  }`}
                >
                  Prediction: {predictionResult.status}
                </span>
              </div>

              {/* Summary of Key Inputs */}
              <div>
                <h4 className="font-semibold mb-2 text-foreground">
                  Summary of Inputs
                </h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>pH: {predictionResult.ph ?? "N/A"}</li>
                  <li>
                    Turbidity: {predictionResult.turbidity ?? "N/A"} (NTU)
                  </li>
                  <li>Coliform: {predictionResult.coliform}</li>
                </ul>
              </div>

              {/* Recommended Actions */}
              <div>
                <h4 className="font-semibold mb-2 text-foreground">
                  Recommended Actions
                </h4>
                <ul className="space-y-1">
                  {predictionResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-foreground">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-start gap-2 mt-4">
            {/* Conditional "Notify" button for poor quality */}
            {predictionResult?.status === "Poor" && (
              <Button type="button" variant="destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Notify Authorities
              </Button>
            )}
            <Button type="button" variant="secondary">
              Share Report
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaterTesting;