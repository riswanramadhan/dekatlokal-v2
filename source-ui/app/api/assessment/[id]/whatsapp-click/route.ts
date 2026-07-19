import { NextResponse } from "next/server";
import { markAssessmentWhatsappClick } from "@/features/digital-checkup/server/persistence";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const responseId = Number(id);

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(responseId)) {
    return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  }

  try {
    await markAssessmentWhatsappClick(responseId);

    return NextResponse.json({ success: true });
  } catch {
    console.error("[API] Failed to update hasClickedWhatsapp");
    return NextResponse.json(
      { message: "Gagal memperbarui data." },
      { status: 500 }
    );
  }
}
