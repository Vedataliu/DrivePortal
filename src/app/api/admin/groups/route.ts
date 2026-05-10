import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { data: group, error } = await supabase
      .from("groups")
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }

    return NextResponse.json({ message: "Group created successfully", group }, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = getServiceSupabase();
  const { data: groups, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
  
  return NextResponse.json({ groups: groups || [] });
}
