"use client";

import { useEffect, useState } from "react";

type Attendee = {
  id?: string;
  fullName: string;
  companyName: string;
  region: string;
  email: string;
  cellNumber: string;
  status: string;
  time: string;
};

type Props = {
  registerId: string;
  name: string;
  date: string;
};

const CheckAttendees = ({ registerId }: Props) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [registerInfo, setRegisterInfo] = useState<{
    name: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    if (!registerId) return;
    fetchAttendees();
  }, [registerId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/registers/${registerId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch attendees");
      }

      setAttendees(data.attendees || []);

      // 🔥 THIS IS THE MISSING PIECE
      setRegisterInfo({
        name: data.name,
        date: data.date,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center  gap-4 mb-6">
        <h1 style={{ fontSize: "26px" }} className="font-bold text-blue-600">
          {registerInfo?.name || "Loading event..."}
          </h1>

        <p  style={{ fontSize: "24px" }} className="font-bold text-blue-600">
          {registerInfo?.date
            ? new Date(registerInfo.date).toLocaleDateString()
            : ""}
        </p>
      </div>
      {/* LOADING STATE */}
      {loading && <div className="text-gray-500">Loading attendees...</div>}

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && attendees.length === 0 && (
        <div className="text-gray-500 italic">
          No attendees have registered yet.
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && attendees.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Full Name</th>
                <th className="border p-2">Company</th>
                <th className="border p-2">Region</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Cell Number</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Time</th>
              </tr>
            </thead>

            <tbody>
              {attendees.map((a, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-2">{a.fullName}</td>
                  <td className="border p-2">{a.companyName}</td>
                  <td className="border p-2">{a.region}</td>
                  <td className="border p-2">{a.email}</td>
                  <td className="border p-2">{a.cellNumber}</td>
                  <td className="border p-2">{a.status}</td>
                  <td className="border p-2">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CheckAttendees;
