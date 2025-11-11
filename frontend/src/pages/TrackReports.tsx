import React, { useState } from "react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dummy Data: Waste
const wasteReports = [
  {
    id: 1,
    title: "Garbage Dump",
    location: "Delhi",
    date: "2025-01-15",
    description:
      "Large pile of garbage dumped near homes, causing bad smell and attracting animals. Needs immediate municipal cleaning to avoid diseases.",
    status: "Pending",
    progress: 1,
    history: [
      { date: "2025-01-15", update: "Report submitted by user" },
      { date: "2025-01-16", update: "Assigned to waste management department" },
    ],
  },
  {
    id: 2,
    title: "Plastic Waste on Road",
    location: "Mumbai",
    date: "2025-01-14",
    description:
      "Plastic bottles and wrappers blocking roadside drainage, which may cause waterlogging and increase mosquito breeding.",
    status: "In Progress",
    progress: 2,
    history: [
      { date: "2025-01-14", update: "Report submitted" },
      { date: "2025-01-15", update: "Municipal team dispatched" },
      { date: "2025-01-16", update: "Cleanup in progress" },
    ],
  },
  {
    id: 3,
    title: "Overflowing Dustbin",
    location: "Pune",
    date: "2025-01-12",
    description:
      "Dustbin is overflowing and trash is spreading nearby. Municipal team has been notified for clearance.",
    status: "Verified",
    progress: 3,
    history: [
      { date: "2025-01-12", update: "Report submitted" },
      { date: "2025-01-13", update: "Cleanup completed" },
      { date: "2025-01-14", update: "Verified by city official" },
    ],
  },
];

// Dummy Data: Water
const waterReports = [
  {
    id: 1,
    title: "Dirty River Water",
    location: "Varanasi",
    date: "2025-01-10",
    description:
      "Significant amount of floating waste. Water is dark and foul smelling, possibly mixed with sewage. Needs urgent cleaning.",
    status: "Pending",
    progress: 1,
    history: [
      { date: "2025-01-10", update: "Report submitted" },
      { date: "2025-01-11", update: "Forwarded to water department" },
    ],
  },
  {
    id: 2,
    title: "Contaminated Tap Water",
    location: "Bangalore",
    date: "2025-01-12",
    description:
      "Tap water has bad smell and yellow tint. Water samples collected and testing underway by authorities.",
    status: "In Progress",
    progress: 2,
    history: [
      { date: "2025-01-12", update: "Report submitted" },
      { date: "2025-01-13", update: "Water testing in progress" },
    ],
  },
  {
    id: 3,
    title: "Oil in Lake",
    location: "Hyderabad",
    date: "2025-01-14",
    description:
      "Oil patches floating in lake. Environmental team responded and cleaned most affected areas.",
    status: "Verified",
    progress: 3,
    history: [
      { date: "2025-01-14", update: "Reported by citizen" },
      { date: "2025-01-15", update: "Cleanup operation completed" },
      { date: "2025-01-16", update: "Verified by authority" },
    ],
  },
];

// Color for badge
const getStatusColor = (status: string) => {
  if (status === "Verified") return "bg-green-600";
  if (status === "In Progress") return "bg-blue-500";
  return "bg-yellow-500";
};

// 🔹 Vertical Timeline Tracker (like delivery tracking)
const StatusTracker = ({ progress }: { progress: number }) => {
  const steps = [
    { title: "Reported", desc: "Your issue has been reported." },
    { title: "In Progress", desc: "Our team is working on it." },
    { title: "Verified", desc: "Issue resolved and verified." },
  ];

  return (
    <div className="relative mt-5 border-l-4 border-gray-200 ml-3">
      {steps.map((step, index) => {
        const isActive = progress >= index + 1;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative pl-6 pb-6 last:pb-0">
            {/* Dot */}
            <div
              className={`absolute -left-[11px] w-4 h-4 rounded-full border-4 ${
                isActive
                  ? "bg-green-600 border-green-200"
                  : "bg-gray-300 border-gray-100"
              }`}
            ></div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`absolute left-0 top-4 w-[2px] h-full ${
                  isActive ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}

            <div className="ml-2">
              <p
                className={`font-semibold text-sm ${
                  isActive ? "text-green-700" : "text-gray-500"
                }`}
              >
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function TrackReports() {
  const [openReport, setOpenReport] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  const allReports = [
    ...wasteReports.map((r) => ({ ...r, type: "Waste" })),
    ...waterReports.map((r) => ({ ...r, type: "Water" })),
  ];

  const filteredReports =
    category === "All"
      ? allReports
      : category === "Waste"
      ? wasteReports.map((r) => ({ ...r, type: "Waste" }))
      : waterReports.map((r) => ({ ...r, type: "Water" }));

  const visibleReports = filteredReports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Track Your <span className="text-green-700">Reports</span>
        </h1>
        <p className="text-gray-600 mb-6">
          Monitor the status and progress of your submitted waste and water reports.
        </p>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-8 bg-white shadow-sm p-4 rounded-lg">
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-1 focus:ring-green-600 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="All">All Categories</option>
            <option value="Waste">Waste</option>
            <option value="Water">Water</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="grid grid-cols-1 gap-6">
          {visibleReports.map((r) => (
            <Card
              key={r.id + r.title}
              className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all"
            >
              <CardHeader className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {r.title}
                  </CardTitle>
                  <Badge
                    className={`${getStatusColor(
                      r.status
                    )} text-white text-xs px-3 py-1 rounded-md`}
                  >
                    {r.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📅 {r.date}</p>
                  <p>📍 {r.location}</p>
                </div>

                {/* 🔹 Replaced horizontal tracker with vertical timeline */}
                <StatusTracker progress={r.progress} />

                <Button
                  variant="outline"
                  className={`mt-3 ${
                    r.type === "Water"
                      ? "text-blue-700 border-blue-600 hover:bg-blue-600 hover:text-white"
                      : "text-green-700 border-green-600 hover:bg-green-600 hover:text-white"
                  }`}
                  onClick={() =>
                    setOpenReport(openReport === r.id ? null : r.id)
                  }
                >
                  {openReport === r.id ? "Hide Details" : "View Details"}
                </Button>

                {openReport === r.id && (
                  <div
                    className={`mt-3 p-3 rounded-lg border ${
                      r.type === "Water"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <p className="text-sm text-gray-700 mb-3">{r.description}</p>
                    <h4 className="font-semibold text-sm mb-2">
                      Tracking Details:
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {r.history.map((h, i) => (
                        <li key={i}>
                          <span className="font-medium">{h.date}:</span>{" "}
                          {h.update}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {visibleReports.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              No reports found for the selected filters.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
