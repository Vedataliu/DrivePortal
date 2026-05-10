import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const uploaderId = request.headers.get("x-user-id");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    let folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (folderId === "root" || !folderId) {
      folderId = null;
    }


    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("driveportal_files")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage Error:", uploadError);
      return NextResponse.json({ error: "Failed to upload to storage" }, { status: 500 });
    }


    const { data: dbFile, error: dbError } = await supabase
      .from("files")
      .insert({
        name: file.name,
        folder_id: folderId,
        size: file.size,
        type: file.type,
        storage_path: filePath,
        uploaded_by: uploaderId || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 });
    }

    return NextResponse.json({ message: "File uploaded successfully", file: dbFile }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = getServiceSupabase();
  const { data: files, error } = await supabase.from("files").select("*").order("uploaded_at", { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
  
  return NextResponse.json({ files: files || [] });
}
