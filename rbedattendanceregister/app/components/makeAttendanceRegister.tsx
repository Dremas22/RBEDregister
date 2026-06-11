"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import CheckAttendees from "./checkAttendees";
;

type Attendee = {
  name: string;
  time: string;
  date: string;
};

type AttendanceRegister = {
  id: string;
  name: string;
  date: string;
  location: string;
  link?: string;
  attendees: Attendee[];
};

export default function AttendanceRegister() {
  const [registers, setRegisters] = useState<AttendanceRegister[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(
    null,
  );

  const [selectedRegister, setSelectedRegister] =
    useState<AttendanceRegister | null>(null);
  const [eventDuration, setEventDuration] = useState(1);

  /**
   * LOAD REGISTERS FROM FIREBASE
   */
  useEffect(() => {
    const fetchRegisters = async () => {
      try {
        const res = await fetch("/api/registers");
        const data = await res.json();
        setRegisters(data);
      } catch (err) {
        console.log("Failed to load registers", err);
      }
    };

    fetchRegisters();
  }, []);

  /**
   * CREATE REGISTER
   */
  const handleSave = async () => {
    if (!name.trim() || !location.trim()) return;

    try {
      const res = await fetch("/api/registers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          location,
          eventDuration,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.error);
        return;
      }

      const link = `${window.location.origin}/attendance/${data.id}`;

      setRegisters((prev) => [{ ...data, link }, ...prev]);

      setName("");
      setLocation("");
      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  };
  /**
 SelectedRegisterId(registerId);
};

  /**
   * DELETE (LOCAL ONLY)
   */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/registers/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.error || "Failed to delete register");
        return;
      }

      // REMOVE FROM UI
      setRegisters((prev) => prev.filter((r) => r.id !== id));

      // CLOSE MODAL IF OPEN
      if (selectedRegister?.id === id) {
        setSelectedRegister(null);
      }
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  /**
   * VIEW ATTENDEEs
   */
  const handleViewAttendees = (registerId: string) => {
    setSelectedRegisterId(registerId);
  };

  return (
    <div className="p-6">
      {/* CREATE BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        + Create Event Register
      </button>

      {/* FORM */}
      {showForm && (
        <div className="mt-4 p-4 border rounded bg-white shadow">
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full mb-3"
          />

          <input
            type="number"
            min={1}
            max={8}
            value={eventDuration}
            onChange={(e) => setEventDuration(Number(e.target.value))}
            placeholder="Event Duration (1–8 hours)"
            className="border p-2 w-full mb-3"
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 w-full mb-3"
          />

          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Save Register
          </button>

          <button
            onClick={() => setShowForm(false)}
            className="ml-2 bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {registers.slice(0, 20).map((reg) => (
          <div
            key={reg.id}
            className="p-4 border rounded shadow hover:shadow-md"
          >
            <h2 className="font-bold">{reg.name}</h2>

            <p className="text-sm text-gray-500">
              {new Date(reg.date).toLocaleDateString()}
            </p>

            <p className="text-xs mt-2">📍 {reg.location}</p>

            {/* QR CODE + LINK */}
            {reg.link && (
              <div className="mt-3 flex flex-col items-start">
                <QRCode value={reg.link} size={80} />

                <p className="text-xs mt-2 text-gray-500 break-all">
                  {reg.link}
                </p>

                <button
                  onClick={() => navigator.clipboard.writeText(reg.link!)}
                  className="text-xs mt-2 bg-gray-400 px-2 py-1 rounded cursor-pointer cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleViewAttendees(reg.id)}
                className="bg-gray-800 text-white px-3 py-1 text-sm rounded cursor-pointer"
              >
                View Attendees
              </button>

              <button
                onClick={() => handleDelete(reg.id)}
                className="bg-red-600 text-white px-3 py-1 text-sm rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRegisterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedRegisterId(null)}
              className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <CheckAttendees registerId={selectedRegisterId} name="John Doe" date="2023-10-15" />
          </div>
        </div>
      )}

      {/* MODAL */}
      {selectedRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedRegister(null)}
              className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold">{selectedRegister.name}</h2>

            <p className="mt-1 text-sm text-gray-500">
              📍 {selectedRegister.location}
            </p>

            <p className="mb-6 text-sm text-gray-500">
              {new Date(selectedRegister.date).toLocaleDateString()}
            </p>

            {!selectedRegister.attendees ||
            selectedRegister.attendees.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
                <p className="text-lg italic text-gray-500">
                  No one checked in yet
                </p>
              </div>
            ) : (
              <ul className="max-h-[300px] space-y-2 overflow-y-auto">
                {selectedRegister.attendees.map((a, index) => (
                  <li key={index} className="rounded-lg border bg-gray-50 p-3">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-gray-500">{a.time}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
