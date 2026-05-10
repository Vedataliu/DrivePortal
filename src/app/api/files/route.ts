import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  if (role === "ADMIN") {
    const { data: files } = await supabase.from("files").select("*");
    const { data: folders } = await supabase.from("folders").select("*");
    return NextResponse.json({ files: files || [], folders: folders || [] });
  }

  const { data: userGroups } = await supabase.from("group_members").select("group_id").eq("user_id", userId);
  const groupIds = userGroups?.map(g => g.group_id) || [];

  const { data: allPerms } = await supabase.from("permissions").select("*");

  const userPerms = allPerms?.filter(p => p.user_id === userId || groupIds.includes(p.group_id)) || [];

  const allowedFileIds = userPerms.filter(p => p.target_type === "FILE").map(p => p.target_id);
  const allowedFolderIds = userPerms.filter(p => p.target_type === "FOLDER").map(p => p.target_id);

  let accessibleFolders: any[] = [];
  if (allowedFolderIds.length > 0) {
    const { data } = await supabase.from("folders").select("*").in("id", allowedFolderIds);
    if (data) accessibleFolders = data;
  }

  let accessibleFiles: any[] = [];
  
  let query = supabase.from("files").select("*");
  const conditions = [];
  if (allowedFileIds.length > 0) {
    conditions.push(`id.in.(${allowedFileIds.join(',')})`);
  }
  if (allowedFolderIds.length > 0) {
    conditions.push(`folder_id.in.(${allowedFolderIds.join(',')})`);
  }
  
  if (conditions.length > 0) {
    query = query.or(conditions.join(','));
    const { data } = await query;
    if (data) accessibleFiles = data;
  }

  return NextResponse.json({
    files: accessibleFiles,
    folders: accessibleFolders
  });
}
