import { z } from "zod";

import { safeErrorResponse, safeParseJson, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const createNoteSchema = z.object({
  type: z.enum(["NOTE", "STRATEGY"]),
  title: z.string().min(1).max(200),
  content: z.string().max(10000),
  isPinned: z.boolean().optional(),
});

const updateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(10000).optional(),
  isPinned: z.boolean().optional(),
});

// GET /api/notes?type=NOTE|STRATEGY
export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const notes = await prisma.userNote.findMany({
    where: {
      userId: user.id,
      ...(type === "NOTE" || type === "STRATEGY" ? { type } : {}),
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });

  return Response.json({ notes });
});

// POST /api/notes
export const POST = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) return safeErrorResponse("Invalid request body", 400);

  const note = await prisma.userNote.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      isPinned: parsed.data.isPinned ?? false,
    },
  });

  return Response.json({ note }, { status: 201 });
});

// PATCH /api/notes
export const PATCH = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) return safeErrorResponse("Invalid request body", 400);

  const { id, ...updates } = parsed.data;

  // Verify ownership
  const existing = await prisma.userNote.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return safeErrorResponse("Note not found", 404);
  }

  const note = await prisma.userNote.update({
    where: { id },
    data: updates,
  });

  return Response.json({ note });
});

// DELETE /api/notes
export const DELETE = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return safeErrorResponse("Missing id", 400);

  const existing = await prisma.userNote.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return safeErrorResponse("Note not found", 404);
  }

  await prisma.userNote.delete({ where: { id } });

  return Response.json({ deleted: true });
});
