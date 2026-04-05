import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getStoryModeLesson(topic: string, subject: string, studentClass: string, studentName: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create an immersive "Story-Mode" lesson for ${studentName} on ${topic}. ${studentName} is the hero of this adventure...`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}
// ... (Other functions like generateDailyTasks, solveHomework, etc.)
