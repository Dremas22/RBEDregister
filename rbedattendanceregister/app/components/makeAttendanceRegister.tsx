"use client";

import { useEffect, useState } from "react";

type Attendee = {
  name: string;
  time: string;
};

type AttendanceRegister = {
  id: string;
  name: string;
  date: string;
  location: string;
  attendees: Attendee[];
};

export default function AttendanceRegister() {
  const [registers, setRegisters] = useState<AttendanceRegister[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [selectedRegister, setSelectedRegister] =
    useState<AttendanceRegister | null>(null);

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
   * CREATE REGISTER (API + FIREBASE)
   */
  const handleSave = async () => {
    if (!name.trim() || !location.trim()) return;

    try {
      const res = await fetch("/api/registers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, location }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.error);
        return;
      }

      setRegisters((prev) => [data, ...prev]);

      setName("");
      setLocation("");
      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * DELETE (LOCAL ONLY FOR NOW)
   * (You can later connect Firebase delete API)
   */
  const handleDelete = (id: string) => {
    setRegisters((prev) => prev.filter((r) => r.id !== id));

    if (selectedRegister?.id === id) {
      setSelectedRegister(null);
    }
  };

  /**
   * VIEW REGISTER
   */
  const handleView = async (register: AttendanceRegister) => {
  const res = await fetch(`/api/registers/${register.id}`);
  const data = await res.json();

  setSelectedRegister(data);
};

  return (
    <div className="p-6">

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Add Register
      </button>

      {/* FORM */}
      {showForm && (
        <div className="mt-4 p-4 border rounded bg-white shadow">

          <input
            type="text"
            placeholder="Register Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Register
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

            <p className="mt-2 text-blue-600">
              Attendees: {reg.attendees?.length ?? 0}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">

              <button
                onClick={() => handleView(reg)}
                className="bg-gray-800 text-white px-3 py-1 text-sm rounded"
              >
                View
              </button>

              <button
                onClick={() => handleDelete(reg.id)}
                className="bg-red-600 text-white px-3 py-1 text-sm rounded"
              >
                Delete
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      {selectedRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            {/* CLOSE */}
            <button
              onClick={() => setSelectedRegister(null)}
              className="absolute right-4 top-4 text-xl text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold">
              {selectedRegister.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              📍 {selectedRegister.location}
            </p>

            <p className="mb-6 text-sm text-gray-500">
              {new Date(selectedRegister.date).toLocaleDateString()}
            </p>

            {/* EMPTY STATE */}
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
                  <li
                    key={index}
                    className="rounded-lg border bg-gray-50 p-3"
                  >
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