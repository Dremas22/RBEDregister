import { adminDb } from "@/app/lib/firebase-admin";

export async function GET(req: Request, context: any) {
  try {
    const { id } = await context.params;

    const registerRef = adminDb.collection("registers").doc(id);
    const registerDoc = await registerRef.get();

    if (!registerDoc.exists) {
      return Response.json(
        { error: "Register not found" },
        { status: 404 }
      );
    }

    const attendeesSnap = await adminDb
      .collection("attendees")
      .where("registerId", "==", id)
      .get();

    const attendees = attendeesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json({
      id: registerDoc.id,
      ...registerDoc.data(),
      attendees,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch register" },
      { status: 500 }
    );
  }
}