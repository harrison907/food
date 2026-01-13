"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateRecipe(dishName: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "错误：Zeabur 环境变量 GEMINI_API_KEY 未配置" };
  }

  try {
    // ⚠️ 修改点 1：换用最稳定的 "gemini-pro" 模型
    // ⚠️ 修改点 2：去掉 responseMimeType 配置（因为老模型不支持这个参数，加上会报错）
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      你是一个特级中餐大厨。请教我做一道菜："${dishName}"。
      
      请务必只返回纯 JSON 字符串，不要包含 Markdown 标记（如 \`\`\`json ），不要包含任何其他文字。
      格式如下：
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

    // 数据清洗：有时候 AI 会忍不住加 markdown 符号，我们手动去掉它
    const cleanText = text.replace(/```json|```/g, "").trim();

    const recipe = JSON.parse(cleanText);
    return { success: true, data: recipe };

  } catch (error: any) {
    console.error("AI 生成报错:", error);
    
    // 如果 gemini-pro 也失败了，把具体原因返回出来
    return { error: `AI 报错: ${error.message || "未知错误"}` };
  }
}
