"use client";

import { useState } from "react";

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
   * CREATE REGISTER
   */
  const handleSave = () => {
    if (!name.trim() || !location.trim()) return;

    const newRegister: AttendanceRegister = {
      id: crypto.randomUUID(),
      name,
      location,
      date: new Date().toISOString(),
      attendees: [],
    };

    setRegisters((prev) => [newRegister, ...prev]);

    setName("");
    setLocation("");
    setShowForm(false);
  };

  /**
   * DELETE REGISTER
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
  const handleView = (register: AttendanceRegister) => {
    setSelectedRegister(register);
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
              Attendees: {reg.attendees.length}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">
              
              {/* VIEW */}
              <button
                onClick={() => handleView(reg)}
                className="bg-gray-800 text-white px-3 py-1 text-sm rounded"
              >
                View
              </button>

              {/* DELETE */}
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

      {/* MORE */}
      {registers.length > 20 && (
        <button className="mt-4 text-blue-600 underline">
          View More
        </button>
      )}

      {/* VIEW PANEL */}
      {selectedRegister && (
        <div className="mt-8 p-4 border rounded bg-white shadow">

          <h2 className="text-xl font-bold">
            {selectedRegister.name}
          </h2>

          <p className="text-sm text-gray-500">
            📍 {selectedRegister.location}
          </p>

          <p className="text-sm text-gray-500 mb-4">
            {new Date(selectedRegister.date).toLocaleDateString()}
          </p>

          {/* EMPTY STATE */}
          {selectedRegister.attendees.length === 0 ? (
            <p className="text-gray-500 italic">
              No one checked in yet
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedRegister.attendees.map((a, index) => (
                <li key={index} className="border p-2 rounded">
                  {a.name} — {a.time}
                </li>
              ))}
            </ul>
          )}

        </div>
      )}

    </div>
  );
}