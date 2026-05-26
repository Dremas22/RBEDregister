import { adminDb } from "@/app/lib/firebase-admin";

/**
 * GET REGISTER + ATTENDEES
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // REGISTER
    const docRef = adminDb.collection("registers").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return Response.json(
        { error: "Register not found" },
        { status: 404 }
      );
    }

    // ATTENDEES
    const attendeesSnap = await adminDb
      .collection("attendees") // ✅ FIXED
      .where("registerId", "==", id)
      .get();

    const attendees = attendeesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json({
      id: docSnap.id,
      ...docSnap.data(),
      attendees,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      { error: "Failed to fetch register" },
      { status: 500 }
    );
  }
}

/**
 * DELETE REGISTER
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const docRef = adminDb.collection("registers").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return Response.json(
        { error: "Register not found" },
        { status: 404 }
      );
    }

    await docRef.delete();

    return Response.json({
      success: true,
      message: "Register deleted successfully",
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete register" },
      { status: 500 }
    );
  }
}