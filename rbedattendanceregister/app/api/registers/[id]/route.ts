import { adminDb } from "@/app/lib/firebase-admin";
import { formatDate } from "@/app/lib/formatDate";

/**
 * GET REGISTER + ATTENDEES
 */
export async function GET(req: Request, context: any) {
  try {
    const { id } = await context.params; // ✅ FIX HERE

    const docRef = adminDb.collection("registers").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return Response.json({ error: "Register not found" }, { status: 404 });
    }

    const attendeesSnap = await adminDb
      .collection("attendees")
      .where("registerId", "==", id)
      .get();

    const attendees = attendeesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const data = docSnap.data();

    if (!data) {
      return Response.json({ error: "Register data missing" }, { status: 500 });
    }

    return Response.json({
      id: docSnap.id,
      name: data.name,
      location: data.location,
      eventDuration: data.eventDuration,
      date: formatDate(data.date),
      attendees,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch register" },
      { status: 500 },
    );
  }
}

/**
 * DELETE REGISTER
 */
export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params; // ✅ FIX HERE TOO

    const docRef = adminDb.collection("registers").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return Response.json({ error: "Register not found" }, { status: 404 });
    }

    await docRef.delete();

    return Response.json({
      success: true,
      message: "Register deleted successfully",
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete register" },
      { status: 500 },
    );
  }
}
