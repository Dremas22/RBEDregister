import { adminDb } from "@/app/lib/firebase-admin";

export async function POST(req: Request, context: any) {
  try {
    // ✅ FIX: await params (Next.js 16 requirement)
    const { id } = await context.params;

    const body = await req.json();

    const registerRef = adminDb.collection("registers").doc(id);
    const registerDoc = await registerRef.get();

    if (!registerDoc.exists) {
      return Response.json(
        { error: "Register not found" },
        { status: 404 }
      );
    }

    const attendee = {
      registerId: id,
      fullName: body.fullName,
      companyName: body.companyName,
      region: body.region,
      email: body.email,
      cellNumber: body.cellNumber,
      status: body.status,
      time: new Date().toLocaleTimeString(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb
      .collection("attendees")
      .add(attendee);

    return Response.json({
      success: true,
      id: docRef.id,
      attendee,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to save attendee" },
      { status: 500 }
    );
  }
}