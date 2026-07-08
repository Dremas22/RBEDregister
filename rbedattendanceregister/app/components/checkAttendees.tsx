"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // =========================
  // 📊 EXPORT TO EXCEL
  // =========================
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendees);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, `${registerInfo?.name || "attendees"}-report.xlsx`);
  };

  // =========================
  // 🔵 SHARE FUNCTION
  // =========================
  const shareRegister = async () => {
    const url = window.location.href;

    const shareText = `Check out this event register: ${registerInfo?.name}`;

    // Mobile / modern browsers
    if (navigator.share) {
      try {
        await navigator.share({
          title: registerInfo?.name,
          text: shareText,
          url,
        });
        return;
      } catch (err) {
        console.log("Share cancelled");
      }
    }

    // Fallback (WhatsApp / Email)
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(
      shareText + " " + url,
    )}`;

    window.open(whatsapp, "_blank");
  };

  // =========================
  // ⬇️ DOWNLOAD JSON (optional)
  // =========================
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text(registerInfo?.name || "Attendees Report", 14, 15);

    // Date
    doc.setFontSize(11);
    doc.text(
      registerInfo?.date
        ? new Date(registerInfo.date).toLocaleDateString()
        : "",
      14,
      22,
    );

    // Table data
    const tableData = attendees.map((a) => [
      a.fullName,
      a.companyName,
      a.region,
      a.email,
      a.cellNumber,
      a.status,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [
        ["Full Name", "Company", "Region", "Email", "Cell Number", "Status"],
      ],
      body: tableData,
      styles: {
        fontSize: 9,
      },
    });

    doc.save(`${registerInfo?.name || "attendees"}.pdf`);
  };

  return (
    <div className="p-2 mt-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 ">
        <div className="shrink-0">
          <Image
            src="/images/rbedlogo.png"
            alt="RBED Logo"
            width={250}
            height={250}
            priority
            className="object-contain w-28 md:w-36 lg:w-44 h-auto"
          />
        </div>

        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
          <h1 className="font-bold text-blue-600 text-[26px] ml-20">
            {registerInfo?.name || "Loading event..."}
          </h1>

          <p className="font-bold text-blue-600 text-[24px]">
            {registerInfo?.date
              ? new Date(registerInfo.date).toLocaleDateString()
              : ""}
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* <button
          onClick={shareRegister}
          className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          Share
        </button> */}

        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          Export Excel
        </button>

        <button
          onClick={downloadPDF}
          className="bg-gray-600 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          Download PDF
        </button>
      </div>

      {/* STATES */}
      {loading && <div className="text-gray-500">Loading attendees...</div>}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {!loading && !error && attendees.length === 0 && (
        <div className="text-gray-500 italic">
          No attendees have registered yet.
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && attendees.length > 0 && (
        <div className="relative w-full max-w-6xl max-h-[70vh] 
        overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
          
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border p-2">Full Name</th>
                  <th className="border p-2">Company</th>
                  <th className="border p-2">Region</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Cell Number</th>
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
          </div>
        
      )}
    </div>
  );
};

export default CheckAttendees;
