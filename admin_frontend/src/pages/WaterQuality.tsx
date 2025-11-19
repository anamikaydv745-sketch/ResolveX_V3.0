import { Droplets, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const sensorData = [
  { id: "WS-01", name: "River Station Alpha", ph: 7.2, turbidity: 15, temp: 24, status: "Good", contamination: 12 },
  { id: "WS-02", name: "Lake Monitoring Point", ph: 7.8, turbidity: 22, temp: 26, status: "Moderate", contamination: 35 },
  { id: "WS-03", name: "River Station Beta", ph: 8.5, turbidity: 45, temp: 28, status: "Critical", contamination: 78 },
  { id: "WS-04", name: "Reservoir Main", ph: 7.0, turbidity: 10, temp: 23, status: "Good", contamination: 8 },
  { id: "WS-05", name: "Stream Point North", ph: 7.5, turbidity: 18, temp: 25, status: "Good", contamination: 15 },
];

const phTrendData = [
  { time: "00:00", value: 7.2 },
  { time: "04:00", value: 7.4 },
  { time: "08:00", value: 7.6 },
  { time: "12:00", value: 7.8 },
  { time: "16:00", value: 8.2 },
  { time: "20:00", value: 8.5 },
];

const contaminationData = [
  { time: "Week 1", level: 15 },
  { time: "Week 2", level: 22 },
  { time: "Week 3", level: 35 },
  { time: "Week 4", level: 45 },
];

export default function WaterQuality() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Water Quality Monitoring</h1>
          <p className="text-muted-foreground mt-1">Real-time IoT sensor data and water body analysis</p>
        </div>
        <Button>
          <Activity className="w-4 h-4 mr-2" />
          Deploy Inspection Team
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Sensors</span>
              <Droplets className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-xs text-success mt-1">All operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Critical Alerts</span>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-destructive">3</p>
            <p className="text-xs text-muted-foreground mt-1">Requires action</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg. Quality Score</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-3xl font-bold">87%</p>
            <p className="text-xs text-success mt-1">↑ 5% this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Water Bodies</span>
              <Droplets className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-muted-foreground mt-1">Under monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>pH Level Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={phTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[6, 9]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contamination Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={contaminationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Area type="monotone" dataKey="level" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sensor Stations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sensorData.map((sensor) => (
              <div key={sensor.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sensor.name}</span>
                      <Badge variant="outline">{sensor.id}</Badge>
                      <Badge variant={
                        sensor.status === "Good" ? "outline" :
                        sensor.status === "Moderate" ? "default" : "destructive"
                      }>
                        {sensor.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">pH Level</p>
                    <p className="text-lg font-bold">{sensor.ph}</p>
                    <Progress value={(sensor.ph / 14) * 100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Turbidity (NTU)</p>
                    <p className="text-lg font-bold">{sensor.turbidity}</p>
                    <Progress value={(sensor.turbidity / 50) * 100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temperature (°C)</p>
                    <p className="text-lg font-bold">{sensor.temp}</p>
                    <Progress value={(sensor.temp / 40) * 100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contamination</p>
                    <p className="text-lg font-bold">{sensor.contamination}%</p>
                    <Progress 
                      value={sensor.contamination} 
                      className="h-1 mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Placeholder */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Contamination Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Interactive heatmap showing contaminated areas</p>
              <p className="text-sm text-muted-foreground mt-1">Color-coded zones based on severity levels</p>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
