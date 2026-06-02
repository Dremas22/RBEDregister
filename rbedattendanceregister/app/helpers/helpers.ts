"use client"

import React from "react";

export const getDateTime = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

