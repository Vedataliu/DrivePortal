import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const requestUserId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (userId === requestUserId) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    const { data: userToDelete } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToDelete.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete another administrator" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      console.error("Delete User Error:", deleteError);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
