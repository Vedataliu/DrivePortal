import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data: users, error } = await supabase.from("users").select("id, email, name, role").order("created_at", { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
  
  return NextResponse.json({ users: users || [] });
}
