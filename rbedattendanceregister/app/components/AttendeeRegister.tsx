"use client";

import { useEffect, useState } from "react";
import { RBED_LOCATIONS } from "@/app/lib/rbedLocations";
import { isWithinRadius } from "@/app/lib/checkLocation";
import AttendanceStatusTimer from "./AttendeeStatusTimer";

type Props = {
  registerId: string;
  name: string;
  date: string;
};

type Attendee = {
  id: string;
  fullName: string;
  companyName: string;
  region: string;
  email: string;
  cellNumber: string;
  status: string;
  time: string;
};

export default function AttendeesRegistered({ registerId, name }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [registerInfo, setRegisterInfo] = useState<{
    name: string;
    date: string;
    location: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    region: "",
    email: "",
    cellNumber: "",
  });

  if (!registerId) {
    return <div>Missing register ID</div>;
  }

  useEffect(() => {
    fetchAttendees();
  }, [registerId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/registers/${registerId}`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch register:", data);
        return;
      }

      // ✅ store attendees
      setAttendees(data.attendees || []);

      // ✅ store register metadata (name + date)
      setRegisterInfo({
        name: data.name,
        date: data.date,
        location: data.location,
      });
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

  const saveAttendeeToFirestore = async () => {
    const attendee = {
      fullName: formData.fullName,
      companyName: formData.companyName,
      region: formData.region,
      email: formData.email,
      cellNumber: formData.cellNumber,
    };

    const res = await fetch(`/api/registers/${registerId}/attendees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attendee),
    });

    if (!res.ok) return;

    await fetchAttendees();
    setShowForm(false);
    setShowTable(true);
  };

  const handleSave = async () => {
    try {
      const position = await getUserLocation();

      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const eventLocation = RBED_LOCATIONS.find(
        (l) => l.name === registerInfo?.location,
      );

      if (!eventLocation) {
        alert("Invalid event location");
        return;
      }

      const allowed = isWithinRadius(userLocation, eventLocation, 500);

      if (!allowed) {
        // ⛔ IMPORTANT: only blocks saving, does NOT break app
        const msg = document.createElement("div");
        msg.innerText = "Please go to the required location";

        msg.style.position = "fixed";
        msg.style.bottom = "20px";
        msg.style.left = "50%";
        msg.style.transform = "translateX(-50%)";
        msg.style.background = "red";
        msg.style.color = "white";
        msg.style.padding = "10px";
        msg.style.borderRadius = "8px";
        msg.style.zIndex = "9999";

        document.body.appendChild(msg);

        setTimeout(() => {
          document.body.removeChild(msg);
        }, 5000);

        return;
      }

      // ✅ ONLY IF VALID LOCATION → proceed normally
      await saveAttendeeToFirestore();
    } catch (err) {
      alert("Location permission required");
    }
  };
  return (
    <div className="max-w-4xl mx-auto">
      {/* FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-center gap-4 mb-6">
            <h1 style={{ fontSize: "26px" }} className="text-5xl font-bold">
              {registerInfo?.name || "Loading event..."}
            </h1>

            <p style={{ fontSize: "26px" }} className="text-gray-500">
              {registerInfo?.date
                ? new Date(registerInfo.date).toLocaleDateString()
                : ""}
            </p>
          </div>

          <div className="grid gap-4">
            <input
              placeholder="Full Names"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="Region"
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="Cell Number"
              value={formData.cellNumber}
              onChange={(e) =>
                setFormData({ ...formData, cellNumber: e.target.value })
              }
              className="border p-3 rounded"
            />

            <button
              onClick={handleSave}
              className="bg-blue-600 text-white p-3 rounded"
            >
              Save Attendance
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      {/* TABLE */}
{showTable && (
  <div className="mt-8">
    <div className="flex items-center gap-4 mb-6">
      <h1
        style={{ fontSize: "26px" }}
        className="font-bold text-blue-600"
      >
        {registerInfo?.name || "Loading event..."}
      </h1>

      <p
        style={{ fontSize: "26px" }}
        className="font-bold text-blue-600"
      >
        {registerInfo?.date
          ? new Date(registerInfo.date).toLocaleDateString()
          : ""}
      </p>
    </div>

    {loading ? (
      <p>Loading...</p>
    ) : attendees.length === 0 ? (
      <p className="italic text-gray-500">
        No attendees yet.
      </p>
    ) : (
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Region</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Cell</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {attendees.map((a, i) => (
            <tr key={i}>
              <td className="border p-2">{a.fullName}</td>
              <td className="border p-2">{a.companyName}</td>
              <td className="border p-2">{a.region}</td>
              <td className="border p-2">{a.email}</td>
              <td className="border p-2">{a.cellNumber}</td>

              <td className="border p-2">
                {a.status === "COUNTING" ? (
                  <AttendanceStatusTimer
                    attendeeId={a.id}
                    durationMinutes={60}
                  />
                ) : (
                  a.status
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}
    </div>
  );
}
