import { MapPin, Filter, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";


const defaultLocation: LatLngExpression = [28.6129, 77.2295]; // Example coords


const wasteReports = [
  { id: "WR-2401", type: "Plastic Waste", location: "Sector 15, Block A", status: "In Progress", severity: "High", date: "2024-01-15", image: "📷" },
  { id: "WR-2400", type: "Organic Waste", location: "Green Park", status: "Pending", severity: "Medium", date: "2024-01-15", image: "📷" },
  { id: "WR-2399", type: "Electronic Waste", location: "Tech Hub Area", status: "Assigned", severity: "High", date: "2024-01-14", image: "📷" },
  { id: "WR-2398", type: "Mixed Waste", location: "Park Avenue", status: "Resolved", severity: "Medium", date: "2024-01-14", image: "📷" },
  { id: "WR-2397", type: "Metal Waste", location: "Industrial Zone", status: "In Progress", severity: "Low", date: "2024-01-14", image: "📷" },
  { id: "WR-2396", type: "Plastic Waste", location: "Market Area", status: "Pending", severity: "High", date: "2024-01-13", image: "📷" },
];

const wasteStats = [
  { type: "Plastic", count: 456, percentage: 35, color: "bg-chart-1" },
  { type: "Organic", count: 389, percentage: 30, color: "bg-chart-2" },
  { type: "Metal", count: 260, percentage: 20, color: "bg-chart-3" },
  { type: "Electronic", count: 195, percentage: 15, color: "bg-chart-4" },
];

export default function WasteManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Waste Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage citizen waste reports</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="plastic">Plastic</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="metal">Metal</SelectItem>
              <SelectItem value="electronic">Electronic</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Waste Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wasteStats.map((stat) => (
          <Card key={stat.type}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.type} Waste</span>
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.percentage}% of total</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Map Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Waste Reports Map View
            </CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter Locations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden border">
  <MapContainer
    center={defaultLocation}
    zoom={14}
    scrollWheelZoom={true}
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="© OpenStreetMap contributors"
    />
    <Marker position={defaultLocation}>
      <Popup>Bharat Mandapam NewDelhi</Popup>
    </Marker>
  </MapContainer>
</div>


        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Waste Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wasteReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
                    {report.image}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{report.id}</span>
                      <Badge variant={
                        report.severity === "High" ? "destructive" :
                        report.severity === "Medium" ? "default" : "secondary"
                      }>
                        {report.severity}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{report.type}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{report.location}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    report.status === "Resolved" ? "outline" :
                    report.status === "In Progress" ? "default" :
                    report.status === "Assigned" ? "secondary" : "secondary"
                  } className="min-w-24 justify-center">
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">Assign Team</Button>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
