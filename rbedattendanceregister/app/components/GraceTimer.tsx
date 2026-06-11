"use client";

import { useEffect, useState } from "react";

type Props = {
  attendeeId: string;
};

export default function GraceTimer({
  attendeeId,
}: Props) {
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    const interval = setInterval(async () => {
      setSeconds((prev) => {
        if (prev <= 1) {
          fetch(`/api/attendees/${attendeeId}`, {
            method: "DELETE",
          });

          clearInterval(interval);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [attendeeId]);

  return (
    <span className="text-red-600 font-bold">
      Return To Location ({seconds}s)
    </span>
  );
}