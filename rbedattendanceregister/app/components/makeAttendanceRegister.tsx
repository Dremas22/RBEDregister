"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import CheckAttendees from "./checkAttendees";
import { Copy } from "lucide-react";

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
  const [eventDuration, setEventDuration] = useState(1);

  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(null);

  // QR MODAL STATE
  const [selectedQRRegister, setSelectedQRRegister] =
    useState<AttendanceRegister | null>(null);

  /**
   * LOAD REGISTERS
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
        headers: { "Content-Type": "application/json" },
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
   * DELETE REGISTER
   */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/registers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) return;

      setRegisters((prev) => prev.filter((r) => r.id !== id));

      if (selectedQRRegister?.id === id) {
        setSelectedQRRegister(null);
      }
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const handleViewAttendees = (registerId: string) => {
    setSelectedRegisterId(registerId);
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
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
            className="border p-2 w-full mb-3"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            type="number"
            min={1}
            max={8}
            className="border p-2 w-full mb-3"
            value={eventDuration}
            onChange={(e) => setEventDuration(Number(e.target.value))}
          />

          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Register
          </button>

          <button
            onClick={() => setShowForm(false)}
            className="ml-2 bg-gray-600 text-white px-4 py-2 rounded"
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
            className="p-4 border-4 border-blue-500 rounded shadow hover:shadow-md"
          >
            <h2 className="font-bold">{reg.name}</h2>

            <p className="text-sm text-[#0047b7] font-bold">
              {new Date(reg.date).toLocaleDateString()}
            </p>

            <p className="text-xs mt-2">📍 {reg.location}</p>

            {/* QR CODE */}
            {reg.link && (
              <div className="mt-3 flex flex-col items-start">
                <div
                  onClick={() => setSelectedQRRegister(reg)}
                  className="cursor-pointer"
                >
                  <QRCode value={reg.link} size={80} />
                </div>

                <p className="text-xs mt-2 text-gray-500 break-all">
                  {reg.link}
                </p>

                <button
                  onClick={() => handleCopy(reg.link!)}
                  className="flex items-center gap-1 text-xs mt-2 bg-gray-400 px-2 py-1 rounded"
                >
                  <Copy size={14} /> Copy Link
                </button>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleViewAttendees(reg.id)}
                className="bg-[#0047b7] text-white px-3 py-1 text-sm rounded-md cursor-pointer"
              >
                View Attendees
              </button>

              <button
                onClick={() => handleDelete(reg.id)}
                className="bg-yellow-400 text-red-800 px-3 py-1 text-sm rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ATTENDEES MODAL */}
      {selectedRegisterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedRegisterId(null)}
              className="absolute right-4 top-4 text-xl text-gray-500"
            >
              ✕
            </button>

            <CheckAttendees registerId={selectedRegisterId} name={"Joe Doe"} date={"2023-10-15"}/>
          </div>
        </div>
      )}

      {/* QR OVERLAY */}
      {selectedQRRegister && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl p-6">

            {/* CLOSE */}
            <button
              onClick={() => setSelectedQRRegister(null)}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            {/* PRINT */}
            <button
              onClick={() => window.print()}
              className="absolute top-4 left-4 bg-gray-200 px-3 py-1 rounded"
            >
              🖨 Print
            </button>

            {/* HEADER */}
            <h2 className="font-bold text-2xl text-center mt-6">
              {selectedQRRegister.name}
            </h2>

            <p className="text-sm text-gray-500 text-center">
              {new Date(selectedQRRegister.date).toLocaleDateString()}
            </p>

            {/* QR */}
            <div className="flex justify-center mt-6">
              <QRCode value={selectedQRRegister.link || ""} size={300} />
            </div>

            {/* LINK */}
            <p className="text-green-600 text-lg text-center mt-4 break-all">
              {selectedQRRegister.link}
            </p>

            {/* COPY */}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => handleCopy(selectedQRRegister.link!)}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                <Copy size={16} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}