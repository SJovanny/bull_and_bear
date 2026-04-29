import { z } from "zod";

import { safeErrorResponse, safeParseJson, withAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const notesSchema = z.object({
  content: z.string().max(5000),
});

export const PATCH = withAuth(async (request, { user }) => {
  const { data: body, error } = await safeParseJson(request);
  if (error) return error;

  const parsed = notesSchema.safeParse(body);
  if (!parsed.success) {
    return safeErrorResponse("Invalid request body", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { importantNotes: parsed.data.content },
  });

  return Response.json({ ok: true });
});
