"use client";

import { useEffect, useState } from "react";

type Props = {
  attendeeId: string;
  registeredAt: number;
  durationMinutes: number;
};

export default function AttendanceStatusTimer({
  attendeeId,
  registeredAt,
  durationMinutes,
}: Props) {
  const calculateRemaining = () => {
    const elapsedMinutes = Math.floor(
      (Date.now() - registeredAt) / 60000
    );

    return Math.max(
      durationMinutes - elapsedMinutes,
      0
    );
  };

  const [remainingMinutes, setRemainingMinutes] =
    useState(calculateRemaining());

  useEffect(() => {
    const interval = setInterval(async () => {
      const remaining = calculateRemaining();

      setRemainingMinutes(remaining);

      if (remaining <= 0) {
        await fetch(
          `/api/attendees/${attendeeId}/present`,
          {
            method: "PATCH",
          }
        );

        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [attendeeId]);

  if (remainingMinutes <= 0) {
    return (
      <span className="text-green-600 font-bold">
        PRESENT
      </span>
    );
  }

  return (
    <span className="text-blue-600">
      {remainingMinutes} min
    </span>
  );
}