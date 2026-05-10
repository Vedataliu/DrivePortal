import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const userId = request.headers.get("x-user-id");

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { data: folder, error } = await supabase
      .from("folders")
      .insert({
        name,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
    }

    return NextResponse.json({ message: "Folder created successfully", folder }, { status: 201 });
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = getServiceSupabase();
  const { data: folders, error } = await supabase.from("folders").select("*").order("created_at", { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
  
  return NextResponse.json({ folders: folders || [] });
}
