import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Project type ──────────────────────────────────────────────────────────
export type ProjectType = "Residential" | "Commercial" | "Mixed-Use" | "Hospitality" | "Cultural";

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  image_url: string;       // full public URL from Supabase Storage
  stream_url: string;
  type: ProjectType;
  location: string;
  year: string;
  featured: boolean;
  sort_order: number;
  created_at?: string;
}

// ── Projects CRUD ──────────────────────────────────────────────────────────
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) console.error("getProjects:", error.message);
  return data ?? [];
}

export async function createProject(
  fields: Omit<Project, "id" | "created_at" | "image_url">,
  imageFile: File
): Promise<{ error: string | null }> {
  // 1. Upload image to Storage bucket "project-images"
  const ext  = imageFile.name.split(".").pop() ?? "jpg";
  const path = `${fields.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("project-images")
    .upload(path, imageFile, { upsert: false, contentType: imageFile.type });

  if (uploadErr) return { error: uploadErr.message };

  // 2. Get public URL
  const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(path);
  const image_url = urlData.publicUrl;

  // 3. Insert row
  const { error: insertErr } = await supabase.from("projects").insert([{ ...fields, image_url }]);
  return { error: insertErr?.message ?? null };
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  // Get the row first to find image path
  const { data } = await supabase.from("projects").select("image_url").eq("id", id).single();

  // Delete storage file if it's our bucket
  if (data?.image_url) {
    const url   = new URL(data.image_url);
    const parts = url.pathname.split("/project-images/");
    if (parts.length === 2) {
      await supabase.storage.from("project-images").remove([parts[1]]);
    }
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateProjectOrder(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, i) => supabase.from("projects").update({ sort_order: i }).eq("id", id))
  );
}

// ── Visitor insert ─────────────────────────────────────────────────────────
export interface VisitorEntry {
  name: string; email: string; contact: string;
  project: string; project_id: string;
}

export async function saveVisitor(data: VisitorEntry) {
  const { error } = await supabase.from("visitors").insert([{
    ...data, timestamp: new Date().toISOString(),
  }]);
  return { error: error?.message ?? null };
}

// ── Dashboard data ─────────────────────────────────────────────────────────
export async function getVisitors() {
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("timestamp", { ascending: false });
  return { data: data ?? [], error };
}

export async function getVisitorStats() {
  const { data } = await supabase
    .from("visitors")
    .select("project, project_id, timestamp, email");
  if (!data) return { total: 0, unique: 0, byProject: [], recent7: 0 };

  const total   = data.length;
  const unique  = new Set(data.map((v: { email: string }) => v.email)).size;
  const recent7 = data.filter((v: { timestamp: string }) => {
    return (Date.now() - new Date(v.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const byProject = Object.entries(
    data.reduce((acc: Record<string, number>, v: { project: string }) => {
      acc[v.project] = (acc[v.project] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([project, count]) => ({ project, count: count as number }))
    .sort((a, b) => b.count - a.count);

  return { total, unique, byProject, recent7 };
}
