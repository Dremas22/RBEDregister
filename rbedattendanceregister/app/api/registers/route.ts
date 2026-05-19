import { NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase-admin";

// GET → fetch all registers (NO attendees needed)
export async function GET() {
  try {
    const snapshot = await adminDb.collection("registers").get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        name: d.name,
        location: d.location,
        date: d.date,
        attendeesCount: d.attendees ? d.attendees.length : 0,
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch registers" },
      { status: 500 }
    );
  }
}

// POST → create register
export async function POST(req: Request) {
  try {
    const { name, location } = await req.json();

    if (!name || !location) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const ref = await adminDb.collection("registers").add({
      name,
      location,
      date: new Date(),
      attendees: [],
    });

    return NextResponse.json({
      id: ref.id,
      name,
      location,
      date: new Date().toISOString(),
      attendees: [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create register" },
      { status: 500 }
    );
  }
}