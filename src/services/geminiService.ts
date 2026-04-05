import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getStoryModeLesson(topic: string, subject: string, studentClass: string, studentName: string, personality: string = "Friendly") {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create an immersive "Story-Mode" lesson for ${studentName} (Class ${studentClass}) on the topic "${topic}" in "${subject}".
    In this story, ${studentName} is the main hero/protagonist. 
    The story should be an adventure where learning the concepts of "${topic}" is the key to solving a problem or completing a quest.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          summary: { type: Type.STRING },
          questions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: { question: { type: Type.STRING }, hint: { type: Type.STRING } },
              required: ["question", "hint"]
            }
          }
        },
        required: ["explanation", "summary", "questions"]
      }
    }
  });
  return JSON.parse(response.text);
}
// ... (Add other functions like generateDailyTasks, solveHomework)
