import { NextResponse } from "next/server";
import { z } from "zod";

const supportChatSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().min(1).max(1000),
      }),
    )
    .max(12)
    .optional(),
});

function buildFallbackReply(input: string) {
  const text = input.toLowerCase();

  if (text.includes("track") || text.includes("order status") || text.includes("order")) {
    return "To track an order, open My Account > Orders and view your order details. Payment under review orders update after admin verification.";
  }

  if (text.includes("ship") || text.includes("delivery") || text.includes("arrive")) {
    return "Shipping usually starts within 2-5 business days after payment verification. Delivery depends on destination and customs.";
  }

  if (text.includes("refund") || text.includes("return") || text.includes("cancel")) {
    return "You can check the Refund Policy page for full rules. If you share your order number, support can guide you faster.";
  }

  if (text.includes("payment") || text.includes("bank") || text.includes("card")) {
    return "Bank transfer with payment-proof upload is active. Card UI is visible, while full gateway charging is planned.";
  }

  if (text.includes("seller") || text.includes("sell")) {
    return "Customer accounts can request seller access from My Account > Profile. Admin will review and approve.";
  }

  return "I can help with orders, shipping, payments, refunds, and account support. You can also use the Contact page for direct human follow-up.";
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text.trim();
  }

  const textFromOutput =
    record.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && typeof item.text === "string")
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
      .trim() ?? "";

  return textFromOutput;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = supportChatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }

  const { message, history = [] } = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply: buildFallbackReply(message),
      source: "fallback",
    });
  }

  const model = process.env.OPENAI_SUPPORT_MODEL || "gpt-4.1-mini";
  const systemPrompt =
    "You are Deal Bazaar customer support. Be short, polite, and practical. Help with orders, shipping, payment, refunds, and account issues only. If unknown, suggest Contact page support.";

  const input = [
    {
      role: "system",
      content: [{ type: "input_text", text: systemPrompt }],
    },
    ...history.map((item) => ({
      role: item.role,
      content: [{ type: "input_text", text: item.text }],
    })),
    {
      role: "user",
      content: [{ type: "input_text", text: message }],
    },
  ];

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input,
        max_output_tokens: 220,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({
        reply: buildFallbackReply(message),
        source: "fallback",
      });
    }

    const data = (await aiResponse.json()) as unknown;
    const reply = extractOutputText(data) || buildFallbackReply(message);

    return NextResponse.json({
      reply,
      source: "ai",
    });
  } catch {
    return NextResponse.json({
      reply: buildFallbackReply(message),
      source: "fallback",
    });
  }
}
