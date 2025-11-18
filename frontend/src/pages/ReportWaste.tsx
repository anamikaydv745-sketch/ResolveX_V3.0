import { useState, ChangeEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Camera,
  MapPin,
  Upload,
  AlertCircle,
  Loader2,
  Video,
  XCircle,
  CheckCircle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { CameraModal } from "@/components/CameraModal";
import { VideoModal } from "@/components/VideoModal";

const ReportWaste = () => {
  const { toast } = useToast();
  const { accessToken } = useAuth();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState<string>("");
  const [wasteType, setWasteType] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_BASE;
  const NODE_API = import.meta.env.VITE_NODE_API_BASE;

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const long = position.coords.longitude.toFixed(4);
          const locationString = `Lat: ${lat}, Long: ${long}`;
          setLocation(locationString);
          toast({
            title: "Location Captured",
            description: locationString,
          });
        },
        () => {
          toast({
            title: "Location Error",
            description:
              "Unable to get your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    }
  };


  const runAnalysis = async (analysisFile: File) => {
    if (files.length > 0) return;
    setIsAnalyzing(true);
    getCurrentLocation();
  
    try {
      // Send file to backend for classification
      const formData = new FormData();
      formData.append("file", analysisFile);
      formData.append("kind", "image");
  
      const res = await fetch(`${BACKEND_URL}/process`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
  
      if (data.status === "spam") {
        toast({
          title: "Spam / Irrelevant Photo",
          description: data.message || "Please upload another, clearer waste photo.",
          variant: "destructive",
        });
        // Discard the not-relevant image:
        setFiles([]);
        setPreviews([]);
        setWasteType("");
        // Don't proceed
        return;
      } else {
        // Waste detected: auto-select type
        setWasteType(data.issue_category);
        toast({
          title: "AI Analysis Complete",
          description: `Detected waste type: ${data.issue_category}`,
        });
      }
    } catch {
      toast({
        title: "AI Error",
        description: "Could not analyze image. Please select type manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  

  const addFilesToReport = (newFiles: File[]) => {
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

    const firstImage = newFiles.find((f) => f.type.startsWith("image/"));
    if (firstImage && files.length === 0) runAnalysis(firstImage);
    else if (files.length === 0 && newFiles.length > 0) getCurrentLocation();
  };

  const removeFile = (indexToRemove: number) => {
    const previewToRemove = previews[indexToRemove];
    URL.revokeObjectURL(previewToRemove);
    setFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) addFilesToReport(Array.from(uploadedFiles));
  };

  const handleCapture = (file: File) => {
    addFilesToReport([file]);
    setIsCameraOpen(false);
  };

  const handleVideoCapture = (file: File) => {
    addFilesToReport([file]);
    setIsVideoModalOpen(false);
  };

  // 🚨 Spam Detection Logic
  const checkForSpam = async (): Promise<boolean> => {
    try {
      const reader = new FileReader();
      const base64File = await new Promise<string>((resolve) => {
        if (!files[0]) return resolve("");
        reader.onload = () =>
          resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(files[0]);
      });

      const res = await fetch(`${BACKEND_URL}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: wasteType,
          description,
          landmark,
          images: base64File ? [base64File] : [],
        }),
      });
      

      const data = await res.json();

      if (data.status === "spam") {
        toast({
          title: "⚠️ Spam Detected",
          description: data.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Spam Check Error:", error);
      toast({
        title: "Error Checking Spam",
        description: "Could not verify your report. Try again.",
        variant: "destructive",
      });
      return false;
    }
  };


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = error => reject(error);
    });
  };


  // 🚀 Submit Report (after spam check)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.length) {
      toast({
        title: "Missing Media",
        description: "Please upload or capture at least one image.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("wasteType", wasteType);
      formData.append("location", location);
      formData.append("landmark", landmark);
      formData.append("description", description);
      files.forEach((file) => formData.append("media", file));

      const res = await fetch(`${NODE_API}/api/waste/report`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Submission failed");

      // Convert files to base64 for n8n payload
      const base64Files = await Promise.all(files.map(fileToBase64));

      // Prepare payload for n8n webhook
      const n8nPayload = {
        wasteType,
        location,
        landmark,
        description,
        media: base64Files,
        oauthAccessToken: accessToken, // include accessToken as requested
      };


      // Send to n8n webhook
      const n8nRes = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL2, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // pass token in header as well
        },
        body: JSON.stringify(n8nPayload),
      });

      if (!n8nRes.ok) {
        toast({
          title: "Notification Failed",
          description: "Could not notify authorities via webhook.",
          variant: "destructive",
        });
      }



      toast({
        title: "✅ Report Submitted",
        description: "Your waste report has been successfully stored.",
      });

      // Reset form
      setFiles([]);
      setPreviews([]);
      setLocation("");
      setWasteType("");
      setLandmark("");
      setDescription("");
    } catch (err: unknown) {
    console.error(err);
    const message =
      err instanceof Error
        ? err.message
        : "Unable to submit report. Try again later.";

    toast({
      title: "Submission Failed",
      description: message,
      variant: "destructive",
    });
  }
  finally {
      setIsAnalyzing(false);
    }
};


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Report a Waste Issue
            </h1>
            <p className="text-lg text-muted-foreground">
              Help keep our community clean by reporting waste issues in
              your area
            </p>
          </div>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="text-2xl">
                Smart Waste Reporting Form
              </CardTitle>
              <CardDescription>
                Add photos or a video. Our AI will analyze the first image
                and tag the location.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isAnalyzing} className="space-y-6 group">
                  {/* Media Upload */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Media (Photos/Video)
                      <span className="text-destructive">*</span>
                    </Label>

                    {previews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((previewUrl, index) => {
                          const file = files[index];
                          return (
                            <div
                              key={index}
                              className="relative aspect-square rounded-lg overflow-hidden"
                            >
                              {file.type.startsWith("image/") ? (
                                <img
                                  src={previewUrl}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={previewUrl}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                onClick={() => removeFile(index)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-auto p-6 flex-col gap-2"
                        onClick={() => setIsCameraOpen(true)}
                        disabled={isAnalyzing}
                      >
                        <Camera className="h-10 w-10 text-primary" />
                        <span className="font-medium">Take Photo</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-auto p-6 flex-col gap-2"
                        onClick={() => setIsVideoModalOpen(true)}
                        disabled={isAnalyzing}
                      >
                        <Video className="h-10 w-10 text-primary" />
                        <span className="font-medium">Record Video</span>
                      </Button>

                      <label
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-base cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        ) : (
                          <Upload className="h-10 w-10 text-muted-foreground" />
                        )}
                        <span className="font-medium">Upload Files</span>
                      </label>
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isAnalyzing}
                      />
                    </div>
                  </div>

                  {/* Waste Type */}
                  <div className="space-y-2">
                    <Label htmlFor="wasteType" className="text-base font-semibold">
                      Waste Type
                      <span className="text-muted-foreground text-sm">
                        (Auto-detected)
                      </span>
                    </Label>
                    <Select
                      onValueChange={setWasteType}
                      value={wasteType}
                      disabled={isAnalyzing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="AI will select waste category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Biomedical">Biomedical</SelectItem>
                        <SelectItem value="Plastic">Plastic</SelectItem>
                        <SelectItem value="Organic">Organic</SelectItem>
                        <SelectItem value="E-Waste">E-Waste</SelectItem>
                        <SelectItem value="Construction">
                          Construction
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base font-semibold">
                      Location (GPS Auto-tagged)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        placeholder="Location will be auto-filled..."
                        className="flex-1"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={isAnalyzing}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={isAnalyzing}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Landmark */}
                  <div className="space-y-2">
                    <Label htmlFor="landmark" className="text-base font-semibold">
                      Nearest Landmark
                    </Label>
                    <Input
                      id="landmark"
                      placeholder="e.g., Near City Park"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Additional Details
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue..."
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isAnalyzing}
                    />
                  </div>
                </fieldset>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-accent mb-1">
                      AI Priority Detection
                    </p>
                    <p className="text-muted-foreground">
                      High-priority reports (biomedical/hazardous) are
                      escalated automatically.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  variant="hero"
                  disabled={isAnalyzing || files.length === 0}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onCapture={handleVideoCapture}
      />
    </div>
  );
};

export default ReportWaste;
