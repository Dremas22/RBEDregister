"use client";

import React from "react";
import AttendanceRegister from "./makeAttendanceRegister";
import Image from "next/image";

const FrontPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">

        {/* Header Row */}
        <div className="flex items-center justify-center gap-8 mb-12">

          {/* Logo */}
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

          {/* Heading */}
          <div className="text-left p-4">
            <h2 className="text-2xl md:text-xl lg:text-2xl font-bold text-gray-900 mt-10">
              Attendance Register
            </h2>

            <div className="w-20 h-1 bg-blue-600 rounded-full mt-4"></div>
          </div>

        </div>

        {/* Register Section */}
        <div className="w-full">
          <AttendanceRegister />
        </div>

      </div>
    </div>
  );
};

export default FrontPage;