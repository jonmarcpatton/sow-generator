import { generateProposalAI } from "@/lib/generateProposalAI";

const MAX_NOTES_LENGTH = 20000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Discovery notes are required." }, { status: 400 });
  }

  const notes =
    typeof body === "object" && body !== null && "notes" in body
      ? (body as { notes: unknown }).notes
      : undefined;

  if (typeof notes !== "string" || notes.trim().length === 0) {
    return Response.json({ error: "Discovery notes are required." }, { status: 400 });
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    return Response.json(
      { error: "Discovery notes are too long. Please shorten them." },
      { status: 400 },
    );
  }

  try {
    const proposal = await generateProposalAI(notes);
    return Response.json(proposal, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "We couldn't generate the statement of work. Please try again." },
      { status: 500 },
    );
  }
}
