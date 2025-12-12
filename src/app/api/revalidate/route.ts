import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { env } from "~/env";

type RevalidateBody = {
  secret?: string;
  slug?: string;
  path?: string;
};

export async function POST(request: NextRequest) {
  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    // ignore
  }

  if (!env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATION_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!body?.secret || body.secret !== env.REVALIDATION_SECRET) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  const pathsToRevalidate: string[] = [];

  if (body.path && typeof body.path === "string") {
    pathsToRevalidate.push(body.path);
  }

  if (body.slug && typeof body.slug === "string") {
    pathsToRevalidate.push(`/event/${body.slug}`);
  }

  // The home page renders events too.
  pathsToRevalidate.push("/");

  // Ensure uniqueness + basic sanity.
  const uniquePaths = Array.from(new Set(pathsToRevalidate)).filter(
    (p) => typeof p === "string" && p.startsWith("/"),
  );

  if (uniquePaths.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Missing 'slug' or 'path'" },
      { status: 400 },
    );
  }

  for (const p of uniquePaths) {
    revalidatePath(p);
  }

  return NextResponse.json({ ok: true, revalidated: uniquePaths });
}


