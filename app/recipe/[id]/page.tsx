import Image from "next/image";
import Link from "next/link";
import { chineseRecipes } from "@/data/recipes";
import { generateRecipe } from "../../actions"; // 引入 AI

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>; // 获取 URL 里的 ?name=xxx
}

export default async function RecipeDetail(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id } = params;
  const { name } = searchParams;

  let meal = chineseRecipes.find((r) => r.id === id);

  // 如果本地没找到，且 ID 是 AI 生成的格式，且有菜名，则再次请求 AI
  if (!meal && id.startsWith('ai-') && name) {
    const result = await generateRecipe(decodeURIComponent(name));
    if (result.success) {
      meal = result.data;
    }
  }

  if (!meal) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl">未找到该菜谱或生成失败</h1>
        <Link href="/" className="text-orange-500 mt-4 block">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <nav className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-orange-500 font-bold hover:underline flex items-center gap-1">
            <span>←</span> 返回
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg bg-gray-100">
               {/* 这里的图片因为是 source.unsplash 随机图，可能不稳定，但能用 */}
              <Image
                src={meal.image}
                alt={meal.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              {id.startsWith('ai-') && (
                <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  🤖 AI 实时生成中
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
               <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {meal.category}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {meal.area}
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{meal.name}</h1>
            <h3 className="text-xl font-semibold mb-3 border-l-4 border-orange-500 pl-3">准备食材</h3>
            <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {meal.ingredients.map((ing: any, index: number) => (
                <li key={index} className="flex justify-between border-b border-gray-200 last:border-0 pb-2 last:pb-0 text-black">
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-gray-500">{ing.measure}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 border-l-4 border-orange-500 pl-3">烹饪步骤</h3>
          <div className="bg-gray-50 p-6 rounded-xl text-gray-700 leading-relaxed whitespace-pre-line">
            {meal.instructions}
          </div>
        </div>
      </main>
    </div>
  );
}
