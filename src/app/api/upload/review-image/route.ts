import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { bytesToMb, isValidImageType } from "@/lib/utils";

const MAX_FILE_MB = 5;

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!isValidImageType(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WEBP files are allowed." },
      { status: 400 },
    );
  }

  if (bytesToMb(file.size) > MAX_FILE_MB) {
    return NextResponse.json(
      { error: `File must be smaller than ${MAX_FILE_MB}MB.` },
      { status: 400 },
    );
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const filePath = `${auth.user.id}/${randomUUID()}.${extension}`;

  const { error } = await auth.supabase.storage
    .from("review-images")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = auth.supabase.storage.from("review-images").getPublicUrl(filePath);

  return NextResponse.json({
    path: filePath,
    url: data.publicUrl,
  });
}
