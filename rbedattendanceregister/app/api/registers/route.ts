import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase-admin";
import { formatDate } from "@/app/lib/formatDate";

// GET → fetch all registers (NO attendees needed)
export async function GET() {
  try {
    const snapshot = await adminDb.collection("registers").get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        name: d.name,
        date: formatDate(d.date),
        attendeesCount: d.attendees ? d.attendees.length : 0,
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch registers" },
      { status: 500 },
    );
  }
}

// POST → create register
export async function POST(req: Request) {
  try {
    const { name, eventDuration, date } = await req.json();

    if (!name || !eventDuration || !date)  {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (eventDuration < 1 || eventDuration > 8) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 8 hours" },
        { status: 400 },
      );
    }

    const ref = await adminDb.collection("registers").add({
      name,
      eventDuration,
      date: new Date(date),
    });

    return NextResponse.json({
      id: ref.id,
      name,
      date: new Date(date).toISOString(),
      attendees: [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create register" },
      { status: 500 },
    );
  }
}
