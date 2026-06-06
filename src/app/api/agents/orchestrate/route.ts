import {
  type OrchestrateProgressEvent,
  type OrchestrateResult,
  orchestrateAssistantRequest,
} from "@/lib/agents/orchestrator";
import { getUser } from "@/lib/auth/server";

type OrchestratePayload = {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  imageBlob: Blob | null;
  lat?: number;
  lng?: number;
  recentPlaces: { id: string; name: string }[];
};

async function parseOrchestrateRequest(
  req: Request,
): Promise<OrchestratePayload> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new Error("Invalid form data.");
    }

    const messageField = form.get("message");
    const message =
      typeof messageField === "string" ? messageField.trim() : "";

    const image = form.get("image");
    const imageBlob = image instanceof Blob && image.size > 0 ? image : null;

    let lat: number | undefined;
    let lng: number | undefined;
    const latField = form.get("lat");
    const lngField = form.get("lng");
    if (typeof latField === "string" && latField) lat = Number(latField);
    if (typeof lngField === "string" && lngField) lng = Number(lngField);

    let history: OrchestratePayload["history"] = [];
    const historyField = form.get("history");
    if (typeof historyField === "string" && historyField) {
      try {
        history = JSON.parse(historyField) as OrchestratePayload["history"];
      } catch {
        /* ignore */
      }
    }

    let recentPlaces: OrchestratePayload["recentPlaces"] = [];
    const placesField = form.get("recentPlaces");
    if (typeof placesField === "string" && placesField) {
      try {
        recentPlaces = JSON.parse(placesField) as OrchestratePayload["recentPlaces"];
      } catch {
        /* ignore */
      }
    }

    return { message, history, imageBlob, lat, lng, recentPlaces };
  }

  try {
    const body = (await req.json()) as {
      message?: string;
      history?: OrchestratePayload["history"];
      lat?: number;
      lng?: number;
      recentPlaces?: OrchestratePayload["recentPlaces"];
    };
    return {
      message: typeof body.message === "string" ? body.message.trim() : "",
      history: body.history ?? [],
      imageBlob: null,
      lat: typeof body.lat === "number" ? body.lat : undefined,
      lng: typeof body.lng === "number" ? body.lng : undefined,
      recentPlaces: body.recentPlaces ?? [],
    };
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

type StreamEvent =
  | OrchestrateProgressEvent
  | ({ type: "complete" } & OrchestrateResult)
  | { type: "error"; error: string };

export async function POST(req: Request) {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          "Server is missing OPENAI_API_KEY for OpenAI agents and image generation.",
      },
      { status: 503 },
    );
  }

  let payload: OrchestratePayload;
  try {
    payload = await parseOrchestrateRequest(req);
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await orchestrateAssistantRequest(
          {
            ...payload,
            sessionUser,
          },
          (event) => {
            controller.enqueue(
              encoder.encode(`${JSON.stringify(event)}\n`),
            );
          },
        );

        if (result.error && result.messages.length === 0) {
          const errorEvent: StreamEvent = {
            type: "error",
            error: result.error,
          };
          controller.enqueue(
            encoder.encode(`${JSON.stringify(errorEvent)}\n`),
          );
        } else {
          const completeEvent: StreamEvent = { type: "complete", ...result };
          controller.enqueue(
            encoder.encode(`${JSON.stringify(completeEvent)}\n`),
          );
        }
      } catch (error) {
        const errorEvent: StreamEvent = {
          type: "error",
          error:
            error instanceof Error ? error.message : "Orchestration failed.",
        };
        controller.enqueue(encoder.encode(`${JSON.stringify(errorEvent)}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
