"use client";

import { useEffect, useState } from "react";

type Props = {
  attendeeId: string;
  durationMinutes: number;
};

export default function AttendanceStatusTimer({
  attendeeId,
  durationMinutes,
}: Props) {
  const [remainingMinutes, setRemainingMinutes] =
    useState(durationMinutes);

  useEffect(() => {
    const interval = setInterval(async () => {
      setRemainingMinutes((prev) => {
        if (prev <= 1) {
          fetch(`/api/attendees/${attendeeId}/present`, {
            method: "PATCH",
          });

          clearInterval(interval);

          return 0;
        }

        return prev - 1;
      });
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