import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextServer } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET() {
  const prompt = "Halo sebutkan provinsi di pulau jawa, kirimkan response nya dalam bentuk json ya";

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt) 
  const response = await result.response

  const text = response.text()


  return Response.json({text})
}
