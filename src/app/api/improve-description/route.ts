import { NextResponse } from "next/server";
import { buildImproveDescriptionPrompt } from "@/lib/ai/improveDescriptionPrompt";

const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY chưa được cấu hình trên server." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Description không được để trống." },
        { status: 400 }
      );
    }

    const prompt = buildImproveDescriptionPrompt(text);

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Carpe Diem Upload",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      console.error("OpenRouter API error:", res.status, json);
      return NextResponse.json(
        {
          error:
            json?.error?.message ??
            "Không thể gọi OpenRouter. Vui lòng thử lại sau.",
        },
        { status: res.status || 502 }
      );
    }

    const content =
      json.choices?.[0]?.message?.content ??
      (Array.isArray(json.choices?.[0]?.message?.content)
        ? json.choices[0].message.content
            .map((p: { text?: string }) => p.text ?? "")
            .join("\n")
        : null);

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Không nhận được nội dung mô tả hợp lệ từ OpenRouter." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: content.trim() });
  } catch (err) {
    console.error("Improve description API error:", err);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý yêu cầu." },
      { status: 500 }
    );
  }
}

