"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateRecipe(dishName: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "错误：Zeabur 环境变量 GEMINI_API_KEY 未配置" };
  }

  try {
    // ⚠️ 修改点：使用具体版本号 "gemini-1.5-flash-001"
    // 如果这个还不行，Google 账号可能有点问题，但通常这能解决 404
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    const prompt = `
      你是一个特级中餐大厨。请教我做一道菜："${dishName}"。
      
      请直接返回一个纯 JSON 字符串（不要Markdown格式），格式如下：
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
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 清洗数据
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```/, "").replace(/```$/, "");
    }
    
    const recipe = JSON.parse(cleanText);
    return { success: true, data: recipe };

  } catch (error: any) {
    console.error("AI 生成报错:", error);
    return { error: `AI 报错: ${error.message}` };
  }
}
