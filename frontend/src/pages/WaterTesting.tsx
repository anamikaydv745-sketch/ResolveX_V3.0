// --- Imports ---
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// <-- (Imports are unchanged from your last version)
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


//  (PredictionResult type is unchanged)
type PredictionResult = {
  status: "Good" | "Poor" | "Moderate";
  ph: number | null;
  turbidity: number | null;
  coliform: string;
  recommendations: string[];
};

const WaterTesting = () => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  // --- Form States ---
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [coliform, setColiform] = useState("");
  // <-- REMOVED: oxygen, temperature, nitrate states
  // const [oxygen, setOxygen] = useState("");
  // const [temperature, setTemperature] = useState("");
  // const [nitrate, setNitrate] = useState("");

  // <-- NEW: Added states for new parameters
  const [tds, setTds] = useState("");
  const [conductivity, setConductivity] = useState("");
  const [hardness, setHardness] = useState("");

  // --- UI/Modal States ---
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);

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

  

  
  // <-- (handleSubmit is unchanged, but updated the commented-out reset line)
  // --- Remove: generateMockPrediction and its usage --- //

// --- Add: API Call to backend for prediction --- //
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setPredictionResult(null);

  try {
    // Prepare request payload
    const payload = {
      ph,
      turbidity,
      tds,
      conductivity,
      hardness,
      coliform, // "absent", "present", "high"
      location,
      source,
    };
    // Call to Flask backend
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    setPredictionResult(result);
    setIsModalOpen(true);

    toast({
      title: "Prediction Complete!",
      description: "Your water quality analysis is ready.",
    });

  } catch (error) {
    toast({
      title: "Submission Failed",
      description: "Could not process your data. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
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
                      {/* Location (Unchanged) */}
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

                      {/* Water Source (Unchanged) */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="source"
                          className="text-base font-semibold"
                        >
                          Water Source Type{" "}
                          <span className="text-destructive">*</span>
                        </Label>
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

                      {/* <-- MODIFIED: Test Parameters Grid --> */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Test Parameters
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* pH Level (Unchanged) */}
                          <div className="space-y-2">
                            <Label htmlFor="ph">
                              pH Level{" "}
                              <span className="text-muted-foreground text-sm">
                                (0-14)
                              </span>
                            </Label>
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

                          {/* <-- NEW: TDS --> */}
                          <div className="space-y-2">
                            <Label htmlFor="tds">
                              TDS{" "}
                              <span className="text-muted-foreground text-sm">
                                (mg/l)
                              </span>
                            </Label>
                            <Input
                              id="tds"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 10000"
                              value={tds}
                              onChange={(e) => setTds(e.target.value)}
                            />
                          </div>

                          {/* Turbidity (Unchanged) */}
                          <div className="space-y-2">
                            <Label htmlFor="turbidity">
                              Turbidity{" "}
                              <span className="text-muted-foreground text-sm">
                                (NTU)
                              </span>
                            </Label>
                            <Input
                              id="turbidity"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 5.0"
                              value={turbidity}
                              onChange={(e) => setTurbidity(e.target.value)}
                            />
                          </div>

                          {/* <-- NEW: Conductivity --> */}
                          <div className="space-y-2">
                            <Label htmlFor="conductivity">
                              Conductivity{" "}
                              <span className="text-muted-foreground text-sm">
                                (μS/cm)
                              </span>
                            </Label>
                            <Input
                              id="conductivity"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 400"
                              value={conductivity}
                              onChange={(e) => setConductivity(e.target.value)}
                            />
                          </div>

                          {/* <-- NEW: Hardness --> */}
                          <div className="space-y-2">
                            <Label htmlFor="hardness">
                              Hardness{" "}
                              <span className="text-muted-foreground text-sm">
                                (mg/L)
                              </span>
                            </Label>
                            <Input
                              id="hardness"
                              type="number"
                              step="0.1"
                              placeholder="e.g., 150"
                              value={hardness}
                              onChange={(e) => setHardness(e.target.value)}
                            />
                          </div>

                          {/* Coliform (Unchanged) */}
                          <div className="space-y-2">
                            <Label htmlFor="coliform">Coliform Presence</Label>
                            <Select
                              value={coliform}
                              onValueChange={setColiform}
                            >
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

                          {/* <-- REMOVED: Dissolved Oxygen, Temperature, Nitrate --> */}
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

                      {/* Submit Button (Unchanged) */}
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        variant="secondary"
                        disabled={isSubmitting}
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

                {/* <-- MODIFIED: Water Quality Guidelines card --> */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Water Quality Guidelines</CardTitle>
                    <CardDescription>
                      Reference values for safe drinking water
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* pH Level (Unchanged) */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          pH Level
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: 6.5 - 8.5
                        </p>
                      </div>

                      {/* Turbidity (Unchanged) */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Turbidity
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: &lt; 5 NTU
                        </p>
                      </div>
                      
                      {/* Coliform (Unchanged) */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Coliform
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: Absent
                        </p>
                      </div>

                      {/* <-- NEW: TDS Guideline --> */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          TDS
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: &lt; 500 ppm
                        </p>
                      </div>
                      
                      {/* <-- NEW: Hardness Guideline --> */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Hardness
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Safe: 75 - 150 mg/L
                        </p>
                      </div>

                      {/* <-- NEW: Conductivity Guideline --> */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="font-semibold text-foreground mb-1">
                          Conductivity
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Varies (often 200-800 μS/cm)
                        </p>
                      </div>

                      {/* <-- REMOVED: Dissolved Oxygen, Nitrate, Temperature Guidelines --> */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ... (Other TabsContent are unchanged) ... */}
            <TabsContent value="analytics">
              <WaterAnalytics />
            </TabsContent>

            <TabsContent value="heatmap">
              <WaterQualityHeatMap />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* --- (Prediction Result Modal is unchanged, it only uses ph, turbidity, coliform) --- */}
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
  <Button
    type="button"
    variant="destructive"
    onClick={async () => {
      try {
        const payload = {
          testingLocation: location,
          waterSourceType: source,
          phLevel: ph,
          tds,
          turbidity,
          conductivity,
          hardness,
          coliformPresence: coliform,
          status: predictionResult.status,
          recommendations: predictionResult.recommendations,
          oauthAccessToken: accessToken, 
        };

        const res = await fetch(`${import.meta.env.VITE_NODE_API_BASE}/api/water/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // 2. Post to n8n webhook URL (new call to send email)
        const n8nRes = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" ,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok || n8nRes.ok) {
          toast({
            title: "Report Sent",
            description:
              "Your report has been sent to the authorities. You can now track your report.",
          });
        } else {
          toast({
            title: "Failed to Notify",
            description: "There was an issue sending the report.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Unable to contact server.",
          variant: "destructive",
        });
      }
    }}
  >
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