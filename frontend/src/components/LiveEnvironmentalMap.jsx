import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- New Imports ---
import ReactDOMServer from "react-dom/server";
import { FaTrash } from "react-icons/fa";
import { IoWater } from "react-icons/io5";

// --- Updated Icon Definitions ---
// Use L.DivIcon to render React components as icons
const wasteIcon = new L.DivIcon({
  html: ReactDOMServer.renderToString(
    // Using green to match your cluster color
    <FaTrash style={{ color: "#22c55e", fontSize: "24px" }} />
  ),
  // Set className to '' to remove Leaflet's default white box and border
  className: "",
  iconSize: [24, 24], // Size of the icon
  iconAnchor: [12, 12], // Center the icon on the coordinate
});

const waterIcon = new L.DivIcon({
  html: ReactDOMServer.renderToString(
    // Using blue to match your cluster color
    <IoWater style={{ color: "#3b82f6", fontSize: "24px" }} />
  ),
  // Set className to '' to remove Leaflet's default white box and border
  className: "",
  iconSize: [24, 24], // Size of the icon
  iconAnchor: [12, 12], // Center the icon on the coordinate
});
// --- End of Updated Definitions ---

const LiveEnvironmentalMap = () => {
  // Focus near Bharat Mandapam , New Delhi
  const center = [28.6129, 77.2273];

  // Waste reports — Delhi (around Bharat Mandapam)
const wasteReports = [
  { id: 1, position: [28.6129, 77.2273], description: "Garbage accumulation near Bharat Mandapam" },
  { id: 2, position: [28.6205, 77.2334], description: "Overflowing dustbins near Supreme Court Road" },
  { id: 3, position: [28.6091, 77.2295], description: "Waste dumping spotted near India Gate lawns" },
  { id: 4, position: [28.6136, 77.2409], description: "Plastic waste near Purana Qila gate" },
  { id: 5, position: [28.6182, 77.2231], description: "Roadside waste near Pragati Maidan metro" },
];

// Water issue reports — Delhi
const waterReports = [
  { id: 1, position: [28.6148, 77.2380], description: "Contaminated water sample near Purana Qila lake" },
  { id: 2, position: [28.6101, 77.2291], description: "High TDS water found near India Gate" },
  { id: 3, position: [28.6194, 77.2366], description: "Pipeline leakage reported near Supreme Court" },
  { id: 4, position: [28.6167, 77.2318], description: "Strange odor in tap water near Pragati Maidan" },
  { id: 5, position: [28.6212, 77.2255], description: "Water discoloration near ITPO complex" },
];


  return (
    <div className="relative w-full h-full">
      {/* Floating Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md rounded-lg shadow-md border border-gray-200 px-4 py-3 text-sm">
        <h3 className="font-semibold text-gray-800 mb-2 text-center">Legend</h3>
        <div className="flex items-center gap-2 mb-1">
          {/* Using the icon directly in the legend for consistency */}
          <FaTrash style={{ color: "#22c55e" }} />
          <span className="text-gray-700">Waste Reports</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Using the icon directly in the legend for consistency */}
          <IoWater style={{ color: "#3b82f6" }} />
          <span className="text-gray-700">Water Reports</span>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Waste Issue Cluster (Green) */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) =>
            L.divIcon({
              html: `<div style="
                      background-color: #22c55e;
                      color: white;
                      border-radius: 50%;
                      width: 38px;
                      height: 38px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      border: 2px solid white;
                      font-weight: bold;">
                      ${cluster.getChildCount()}
                    </div>`,
              className: "waste-cluster",
              iconSize: [38, 38],
            })
          }
        >
          {wasteReports.map((report) => (
            <Marker key={`waste-${report.id}`} position={report.position} icon={wasteIcon}>
              <Tooltip>
                <b className="text-green-600">Waste Issue</b>
                <p>{report.description}</p>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Water Issue Cluster (Blue) */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) =>
            L.divIcon({
              html: `<div style="
                      background-color: #3b82f6;
                      color: white;
                      border-radius: 50%;
                      width: 38px;
                      height: 38px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      border: 2px solid white;
                      font-weight: bold;">
                      ${cluster.getChildCount()}
                    </div>`,
              className: "water-cluster",
              iconSize: [38, 38],
            })
          }
        >
          {waterReports.map((report) => (
            <Marker key={`water-${report.id}`} position={report.position} icon={waterIcon}>
              <Tooltip>
                <b className="text-blue-600">Water Quality Issue</b>
                <p>{report.description}</p>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default LiveEnvironmentalMap;