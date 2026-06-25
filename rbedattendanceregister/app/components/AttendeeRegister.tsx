"use client";

import { useEffect, useState, useRef } from "react";
import { RBED_LOCATIONS } from "@/app/lib/rbedLocations";
import { isWithinRadius } from "@/app/lib/checkLocation";
import AttendanceStatusTimer from "./AttendeeStatusTimer";
import Image from "next/image";

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
  registeredAt: number;
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
    eventDuration: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    region: "",
    email: "",
    cellNumber: "",
  });

  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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
        eventDuration: data.eventDuration,
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
      email: formData.email.trim().toLowerCase(),
      cellNumber: formData.cellNumber,
    };

    const res = await fetch(`/api/registers/${registerId}/attendees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendee),
    });

    const data = await res.json();

    // 🔴 HANDLE DUPLICATE FIRST (STOP EVERYTHING)
    if (res.status === 409) {
      setDuplicateEmail(attendee.email);

      // clear previous timer if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDuplicateEmail(null);
      }, 5000);

      await fetchAttendees();

      setShowForm(false);
      setShowTable(true);

      return false;
    }

    if (!res.ok) {
      alert(data?.error || "Failed to save attendee");
      return false;
    }

    // ✅ SUCCESS PATH ONLY
    setDuplicateEmail(null);

    await fetchAttendees();

    setShowForm(false);
    setShowTable(true);

    return true;
  };

  const handleSave = async () => {
    try {
      // Email validation
      if (!formData.email.trim()) {
        alert("Email is required");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Required fields validation
      if (
        !formData.fullName ||
        !formData.companyName ||
        !formData.region ||
        !formData.cellNumber
      ) {
        alert("Please complete all fields");
        return;
      }

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
        const msg = document.createElement("div");

        msg.innerText =
          "Please go to the required location before registering attendance";

        msg.style.position = "fixed";
        msg.style.bottom = "20px";
        msg.style.left = "50%";
        msg.style.transform = "translateX(-50%)";
        msg.style.background = "red";
        msg.style.color = "white";
        msg.style.padding = "10px 20px";
        msg.style.borderRadius = "8px";
        msg.style.zIndex = "9999";
        msg.style.fontWeight = "bold";

        document.body.appendChild(msg);

        setTimeout(() => {
          if (document.body.contains(msg)) {
            document.body.removeChild(msg);
          }
        }, 5000);

        return;
      }

      // Save attendee
      await saveAttendeeToFirestore();
    } catch (error) {
      console.error(error);

      alert("Location permission is required to register attendance");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow">
          <div className="shrink-0">
            <div className="flex items-center justify-center gap-8 mb-12">
              <Image
                src="/images/rbedlogo.png"
                alt="RBED Logo"
                width={250}
                height={250}
                priority
                className="object-contain w-28 md:w-36 lg:w-44 h-auto"
              />
            </div>

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

            <p style={{ fontSize: "26px" }} className="font-bold text-blue-600">
              {registerInfo?.date
                ? new Date(registerInfo.date).toLocaleDateString()
                : ""}
            </p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : attendees.length === 0 ? (
            <p className="italic text-gray-500">No attendees yet.</p>
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
                    <td
                      className={`border p-2 ${
                        duplicateEmail === a.email
                          ? "font-bold text-red-600 text-lg animate-pulse"
                          : ""
                      }`}
                    >
                      {a.email}
                    </td>
                    <td className="border p-2">{a.cellNumber}</td>

                    <td className="border p-2">
                      {a.status === "COUNTING" ? (
                        <AttendanceStatusTimer
                          attendeeId={a.id}
                          registeredAt={a.registeredAt}
                          durationMinutes={
                            registerInfo?.eventDuration
                              ? (registerInfo.eventDuration * 60) / 2
                              : 60
                          }
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
          {duplicateEmail && (
            <div className="mb-4 p-4 bg-red-100 border border-red-500 rounded">
              <p className="font-bold text-red-700 text-xl">
                Email already registered:
                {duplicateEmail}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
