import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { targetId, targetType, userId, groupId, role = "VIEW" } = await request.json();

    if (!targetId || !targetType) {
      return NextResponse.json({ error: "Target ID and Target Type are required" }, { status: 400 });
    }

    if (!userId && !groupId) {
      return NextResponse.json({ error: "Either User ID or Group ID must be provided" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { data: permission, error } = await supabase
      .from("permissions")
      .insert({ 
        target_id: targetId, 
        target_type: targetType, 
        user_id: userId || null, 
        group_id: groupId || null, 
        role 
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint if we have one, otherwise just generic error
      console.error("DB Error:", error);
      return NextResponse.json({ error: "Failed to assign permission" }, { status: 500 });
    }

    return NextResponse.json({ message: "Permission assigned successfully", permission }, { status: 201 });
  } catch (error) {
    console.error("Assign permission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
