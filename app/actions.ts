"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateRecipe(dishName: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "错误：Zeabur 环境变量 GEMINI_API_KEY 未配置" };
  }

  try {
    // 1. 使用 JSON 模式，这能让 AI 100% 返回合法的 JSON，不会乱说话
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      你是一个特级中餐大厨。请教我做一道菜："${dishName}"。
      请严格按照以下 JSON 格式返回数据：
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

    // 2. 直接解析，不需要再做正则替换了，因为 JSON 模式很干净
    const recipe = JSON.parse(text);
    return { success: true, data: recipe };

  } catch (error: any) {
    console.error("AI 生成详细报错:", error);
    
    // 3. ⚠️ 关键修改：把真实的错误信息返回给前端，方便调试
    // 如果是 API Key 问题，这里会直接显示 "API key not valid"
    // 如果是模型问题，会显示 "User location not supported" 等
    return { error: `AI 报错: ${error.message || JSON.stringify(error)}` };
  }
}
