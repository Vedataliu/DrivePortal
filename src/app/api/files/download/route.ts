import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("fileId");
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId || !fileId) {
    return NextResponse.json({ error: "Unauthorized or Missing File ID" }, { status: 400 });
  }

  const supabase = getServiceSupabase();


  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (fileError || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }


  if (role !== "ADMIN") {
    // Get user's groups
    const { data: userGroups } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);
      
    const groupIds = userGroups?.map(g => g.group_id) || [];

    // Check direct file access
    let hasAccess = false;

    // Check file permission
    const { data: filePerms } = await supabase
      .from("permissions")
      .select("*")
      .eq("target_id", fileId)
      .eq("target_type", "FILE");

    if (filePerms && filePerms.some(p => p.user_id === userId || groupIds.includes(p.group_id))) {
       hasAccess = true;
    }

    // Check folder permission if file is in a folder
    if (!hasAccess && file.folder_id) {
       const { data: folderPerms } = await supabase
        .from("permissions")
        .select("*")
        .eq("target_id", file.folder_id)
        .eq("target_type", "FOLDER");
        
       if (folderPerms && folderPerms.some(p => p.user_id === userId || groupIds.includes(p.group_id))) {
         hasAccess = true;
       }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden: You do not have access to this file." }, { status: 403 });
    }
  }


  const { data: storageData, error: storageError } = await supabase.storage
    .from("driveportal_files")
    .download(file.storage_path);

  if (storageError || !storageData) {
    console.error("Storage download error:", storageError);
    return NextResponse.json({ error: "Failed to read file from storage" }, { status: 500 });
  }

  const arrayBuffer = await storageData.arrayBuffer();

  const response = new NextResponse(arrayBuffer);
  response.headers.set("Content-Type", file.type || "application/octet-stream");
  
  // BRD Requirement 5.1: Force download using Content-Disposition
  response.headers.set("Content-Disposition", `attachment; filename="${file.name}"`);
  
  return response;
}
