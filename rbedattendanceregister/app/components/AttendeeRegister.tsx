"use client";

import { useEffect, useState } from "react";

type Props = {
  registerId: string;
};

type Attendee = {
  fullName: string;
  companyName: string;
  region: string;
  email: string;
  cellNumber: string;
  status: string;
  time: string;
};

export default function AttendeesRegistered({ registerId }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    region: "",
    email: "",
    cellNumber: "",
    status: "Present",
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

      setAttendees(data.attendees || []);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const attendee = {
      fullName: formData.fullName,
      companyName: formData.companyName,
      region: formData.region,
      email: formData.email,
      cellNumber: formData.cellNumber,
      status: formData.status,
    };

    try {
      const res = await fetch(
        `/api/registers/${registerId}/attendees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendee),
        }
      );

      if (!res.ok) {
        console.log("Failed to save attendee");
        return;
      }

      await fetchAttendees();

      setFormData({
        fullName: "",
        companyName: "",
        region: "",
        email: "",
        cellNumber: "",
        status: "Present",
      });

      setShowTable(true);
    } catch (error) {
      console.log("Save error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* FORM */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">
          Attendance Check-In
        </h1>

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

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="border p-3 rounded"
          >
            <option>Present</option>
            <option>Absent</option>
          </select>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white p-3 rounded"
          >
            Save Attendance
          </button>
        </div>
      </div>

      {/* TABLE */}
      {showTable && (
        <div className="mt-8">
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
                    <td className="border p-2">{a.status}</td>
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