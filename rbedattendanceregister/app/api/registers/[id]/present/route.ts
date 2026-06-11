import { adminDb } from "@/app/lib/firebase-admin";

export async function PATCH(
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params;

    await adminDb
      .collection("attendees")
      .doc(id)
      .update({
        status: "PRESENT",
      });

    return Response.json({
      success: true,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}