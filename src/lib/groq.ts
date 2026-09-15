import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "unconfigured-key",
});

export const GROQ_MODEL = "qwen/qwen3.8-27b";