import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { groupId, userId } = await request.json();

    if (!groupId || !userId) {
      return NextResponse.json({ error: "Group ID and User ID are required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { data: member, error } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: userId })
      .select()
      .single();

    if (error) {

      if (error.code === '23505') {
         return NextResponse.json({ error: "User is already in this group" }, { status: 400 });
      }
      console.error("DB Error:", error);
      return NextResponse.json({ error: "Failed to add user to group" }, { status: 500 });
    }

    return NextResponse.json({ message: "User added to group successfully", member }, { status: 201 });
  } catch (error) {
    console.error("Add group member error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
