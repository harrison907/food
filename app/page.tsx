"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { chineseRecipes, Recipe } from "@/data/recipes";
import { generateRecipe } from "./actions"; // 引入刚才写的 AI 函数

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [meals, setMeals] = useState<Recipe[]>([]);
  
  // 新增的状态
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    setMeals(chineseRecipes);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError("");

    if (!searchTerm.trim()) {
      setMeals(chineseRecipes);
      return;
    }

    // 1. 先在本地搜
    const localResults = chineseRecipes.filter((recipe) =>
      recipe.name.includes(searchTerm) || 
      recipe.category.includes(searchTerm)
    );

    if (localResults.length > 0) {
      setMeals(localResults);
    } else {
      // 2. 本地没有，召唤 AI 大厨！
      setMeals([]); // 清空列表
      setIsAiLoading(true); // 显示加载中
      
      // 调用服务端 AI
      const result = await generateRecipe(searchTerm);
      
      if (result.success && result.data) {
        // AI 成功返回，直接展示！
        setMeals([result.data]); 
      } else {
        setAiError("AI 大厨没能生成这道菜，可能太生僻了。");
      }
      
      setIsAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">🤖 AI 美食小厨房</h1>
        <p className="text-gray-600 mb-8">
          本地精选 + <span className="text-purple-600 font-bold">AI 实时生成</span>
          <br/>
          <span className="text-xs text-gray-400">想吃什么随便搜，AI 现场教你做</span>
        </p>

        <form onSubmit={handleSearch} className="flex max-w-lg mx-auto gap-2">
          <input
            type="text"
            placeholder="搜个离谱的试试？如：奥特曼炒蛋"
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            disabled={isAiLoading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            {isAiLoading ? "生成中..." : "AI 搜索"}
          </button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* 加载动画 */}
        {isAiLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-purple-600 font-medium">AI 正在思考配方，请稍候...</p>
            <p className="text-gray-400 text-sm mt-2">正在查询食材库、计算卡路里、编写步骤...</p>
          </div>
        )}

        {/* 错误提示 */}
        {aiError && (
          <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl">
            {aiError}
          </div>
        )}

        {/* 结果展示 */}
        {!isAiLoading && meals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <Link
                // 注意：如果点击详情页，详情页也需要逻辑来处理AI生成的数据（通常需要传入整个对象，或者临时存起来）
                // 简化版：我们这里为了演示，暂时还是跳到 id 页。
                // 进阶版：因为AI生成的数据不在本地库，刷新详情页会404。
                // 技巧：我们可以直接把 AI 生成的数据用 encodeURIComponent 传参，或者把详情页逻辑也改成“如果找不到ID就现场生成”。
                // 为了不让代码太复杂，我们这里简单处理：点击卡片跳详情页，详情页如果没ID，再次调用AI。
                href={`/recipe/${meal.id}?name=${meal.name}`} 
                key={meal.id}
                className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
              >
                <div className="relative h-48 w-full bg-gray-200">
                  {/* AI 生成的图片通常是随机图，这里做个兜底 */}
                  <Image
                    src={meal.image}
                    alt={meal.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    unoptimized // 允许外部链接
                  />
                  {meal.id.startsWith('ai-') && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow">
                      AI 生成
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-gray-800 text-lg mb-1 truncate">
                    {meal.name}
                  </h2>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      {meal.category}
                    </span>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {meal.area}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
