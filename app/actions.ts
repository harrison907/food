"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// 初始化 Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateRecipe(dishName: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "API Key 未配置" };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 核心：精心设计的提示词（Prompt），强迫 AI 返回我们要的 JSON 格式
    const prompt = `
      你是一个特级中餐大厨。请教我做一道菜："${dishName}"。
      
      请严格按照以下 JSON 格式返回数据，不要包含 Markdown 格式（如 \`\`\`json），只要纯 JSON 字符串：
      {
        "id": "ai-${Date.now()}",
        "name": "${dishName}",
        "image": "https://source.unsplash.com/800x600/?${dishName},food", 
        "category": "AI推荐",
        "area": "智能生成",
        "ingredients": [
          { "name": "食材名", "measure": "用量" }
        ],
        "instructions": "这里写详细的烹饪步骤，分行写。"
      }
      
      注意：
      1. 如果这道菜不存在或不能吃，ingredients 返回空数组。
      2. image 字段请直接使用上面的格式，不要改动。
      3. instructions 步骤要清晰。
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 清理一下可能带有的 markdown 符号
    const jsonStr = text.replace(/```json|```/g, "").trim();
    
    const recipe = JSON.parse(jsonStr);
    return { success: true, data: recipe };

  } catch (error) {
    console.error("AI生成失败:", error);
    return { error: "AI 暂时想不起来做法，请稍后再试。" };
  }
}
