import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const apiKey = process.env.OCR_SPACE_API_KEY;

    if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 })
    }

    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Missing OCR API key" }), { status: 400 })
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
    

    const body = new URLSearchParams();
    body.append("apikey", apiKey);
    body.append("base64Image", base64Image);
    body.append("language", "jpn");
    body.append("detectOrientation", "true");
    body.append("scale", "true");
    body.append("isTable", "true");
    body.append("OCREngine", "2");

    const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body
    });

    const result = await response.json();
    return Response.json(result);
}