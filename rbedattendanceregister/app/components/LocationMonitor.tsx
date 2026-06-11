"use client";

import { useEffect, useState } from "react";
import { isWithinRadius } from "@/app/lib/checkLocation";
import GraceTimer from "./GraceTimer";

type Props = {
  attendeeId: string;
  eventLocation: {
    lat: number;
    lng: number;
  };
};

export default function LocationMonitor({
  attendeeId,
  eventLocation,
}: Props) {
  const [outside, setOutside] =
    useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const inside = isWithinRadius(
            userLocation,
            eventLocation,
            500
          );

          setOutside(!inside);
        }
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [eventLocation]);

  if (outside) {
    return (
      <GraceTimer attendeeId={attendeeId} />
    );
  }

  return null;
}