"use client"

import React from "react"
import AttendanceRegister from "./makeAttendanceRegister";


const FrontPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center mt-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Attendance Register</h1>
        <AttendanceRegister />  
    </div>
  )
}   
export default FrontPage