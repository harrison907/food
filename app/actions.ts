"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateRecipe(dishName: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "错误：Zeabur 环境变量 GEMINI_API_KEY 未配置" };
  }

  try {
    // ⚠️ 终极修正：使用 gemini-1.5-flash，但去掉所有花哨配置
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 提示词：强制 AI 只吐出 JSON，不要废话
    const prompt = `
      你是一个特级中餐大厨。请教我做一道菜："${dishName}"。
      
      请直接返回一个纯 JSON 字符串，格式如下：
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
      
      注意：不要使用 Markdown 格式（不要写 \`\`\`json），直接以 { 开头，以 } 结尾。
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 手动清洗数据：防止 AI 还是不听话加了 markdown
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```/, "").replace(/```$/, "");
    }
    
    // 尝试解析
    const recipe = JSON.parse(cleanText);
    return { success: true, data: recipe };

  } catch (error: any) {
    console.error("AI 生成报错:", error);
    return { error: `AI 报错 (Flash): ${error.message}` };
  }
}
