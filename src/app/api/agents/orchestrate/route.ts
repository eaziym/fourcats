import { NextResponse } from "next/server";
import { orchestrateAssistantRequest } from "@/lib/agents/orchestrator";
import { getUser } from "@/lib/auth/server";

export async function POST(req: Request) {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Server is missing OPENAI_API_KEY for OpenAI agents and image generation.",
      },
      { status: 503 },
    );
  }

  let message = "";
  let history: { role: "user" | "assistant"; content: string }[] = [];
  let imageBlob: Blob | null = null;
  let lat: number | undefined;
  let lng: number | undefined;
  let recentPlaces: { id: string; name: string }[] = [];

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data." },
        { status: 400 },
      );
    }

    const messageField = form.get("message");
    if (typeof messageField === "string") message = messageField.trim();

    const image = form.get("image");
    if (image instanceof Blob && image.size > 0) imageBlob = image;

    const latField = form.get("lat");
    const lngField = form.get("lng");
    if (typeof latField === "string" && latField) lat = Number(latField);
    if (typeof lngField === "string" && lngField) lng = Number(lngField);

    const historyField = form.get("history");
    if (typeof historyField === "string" && historyField) {
      try {
        history = JSON.parse(historyField) as typeof history;
      } catch {
        /* ignore */
      }
    }

    const placesField = form.get("recentPlaces");
    if (typeof placesField === "string" && placesField) {
      try {
        recentPlaces = JSON.parse(placesField) as typeof recentPlaces;
      } catch {
        /* ignore */
      }
    }
  } else {
    try {
      const body = (await req.json()) as {
        message?: string;
        history?: { role: "user" | "assistant"; content: string }[];
        lat?: number;
        lng?: number;
        recentPlaces?: { id: string; name: string }[];
      };
      message = typeof body.message === "string" ? body.message.trim() : "";
      history = body.history ?? [];
      if (typeof body.lat === "number") lat = body.lat;
      if (typeof body.lng === "number") lng = body.lng;
      recentPlaces = body.recentPlaces ?? [];
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }
  }

  const result = await orchestrateAssistantRequest({
    message,
    history,
    imageBlob,
    lat,
    lng,
    recentPlaces,
    sessionUser,
  });

  if (result.error && result.messages.length === 0) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
