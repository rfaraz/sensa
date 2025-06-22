// app/api/extract-claude/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {transcript, elapsedTime } = body;

  const prompt = `
        You are a medical triage assistant. A transcript of a patient voice call is provided below.

        Your task is to analyze it and return a JSON object with the following structure:

        {
        "patientData": {
            "name": string,
            "age": number,
            "gender": string,
            "phone": string (or "Unknown"),
            "callDate": string (YYYY-MM-DD),
            "duration": ${elapsedTime} ,
            "urgency": "High" | "Medium" | "Low"
        },
        "extractedSymptoms": [
            {
            "symptom": string,
            "severity": string,
            "duration": string,
            "location": string,
            "description": string
            }
        ],
        "transcript": string, // cleaned up and readable full transcript
        "actions": [string] // list of actions taken or N/A if none
        "clinicalNotes": {
            "assessment": string,
            "concerns": string,
            "plan": string
        }
        }

        Please infer or approximate any missing fields (e.g., phone = "Unknown", callTime = "Unknown", etc.). Only return valid JSON with no extra commentary.

        Transcript:
        ${transcript}
    Fill in any missing values with "N/A"
    `;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-20250514",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
//   console.log("Claude response data:", data); // Debugging output

  // Extract Claude's response text
  let message = data?.content?.[0]?.text?.trim() || "{}";

  // Strip markdown formatting
  message = message.trim();
  if (message.startsWith("```json")) {
  message = message.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (message.startsWith("```")) {
  message = message.replace(/^```/, "").replace(/```$/, "").trim();
  }
  console.log("Claude response:", message); // Print output

  try {
    const parsed = JSON.parse(message);
    return NextResponse.json({ result: parsed });
  } catch (error) {
    console.error("Error parsing Claude output:", error);
    return NextResponse.json({
      error: "Failed to parse Claude output",
      raw: message,
    }, { status: 500 });
  }
}
