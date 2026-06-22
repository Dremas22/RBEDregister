import { adminDb } from "@/app/lib/firebase-admin";

export async function POST(req: Request, context: any) {
  try {
    const { id } = await context.params;

    const body = await req.json();

    // ✅ Normalize email (critical)
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 🔥 FIX: deterministic ID (prevents duplicates permanently)
    const attendeeId = `${id}_${email}`;

    const attendeeRef = adminDb
      .collection("attendees")
      .doc(attendeeId);

    const existing = await attendeeRef.get();

    if (existing.exists) {
      return Response.json(
        {
          error: "EMAIL_EXISTS",
          message:
            "This email is already registered for this event",
          attendeeId,
          attendee: existing.data(),
        },
        { status: 409 }
      );
    }

    const attendee = {
      registerId: id,
      fullName: body.fullName,
      companyName: body.companyName,
      region: body.region,
      email,
      cellNumber: body.cellNumber,
      time: new Date().toLocaleTimeString(),
      createdAt: new Date().toISOString(),
      attendedMinutes: 0,
      status: "COUNTING",
      graceMinutes: 5,
      isInsideLocation: true,
    };

    await attendeeRef.set(attendee);

    return Response.json({
      success: true,
      id: attendeeId,
      attendee,
    });
  } catch (error) {
    console.error("POST_ATTENDEE_ERROR", error);

    return Response.json(
      { error: "Failed to save attendee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params;

    await adminDb
      .collection("attendees")
      .doc(id)
      .delete();

    return Response.json({
      success: true,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete attendee" },
      { status: 500 }
    );
  }
}