import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

// 这是一个服务端组件 (Server Component)
export default async function RecipeDetail({ params }: PageProps) {
  const { id } = params;
  let meal = null;

  // 如果是我们的 Mock 数据
  if (id === "mock-coke-wings") {
    meal = {
      strMeal: "秘制可乐鸡翅",
      strMealThumb: "https://www.themealdb.com/images/media/meals/usywpp1511189717.jpg",
      strCategory: "中餐",
      strArea: "China",
      strInstructions: "1. 鸡翅洗净划两刀。\r\n2. 冷水下锅焯水，捞出沥干。\r\n3. 锅中放油，煎至两面金黄。\r\n4. 加入葱姜蒜，倒入一罐可乐。\r\n5. 小火慢炖20分钟，大火收汁即可。",
      ingredients: [
        { name: "鸡翅", measure: "8个" },
        { name: "可乐", measure: "1罐" },
        { name: "姜片", measure: "3片" },
        { name: "酱油", measure: "2勺" },
      ]
    };
  } else {
    // 真实的互联网搜索
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await res.json();
      const rawMeal = data.meals?.[0];

      if (rawMeal) {
        // 数据清洗：把 API 中散乱的配料表整理一下
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ingredient = rawMeal[`strIngredient${i}`];
          const measure = rawMeal[`strMeasure${i}`];
          if (ingredient && ingredient.trim() !== "") {
            ingredients.push({ name: ingredient, measure: measure });
          }
        }

        meal = {
          strMeal: rawMeal.strMeal,
          strMealThumb: rawMeal.strMealThumb,
          strCategory: rawMeal.strCategory,
          strArea: rawMeal.strArea,
          strInstructions: rawMeal.strInstructions,
          ingredients: ingredients
        };
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  }

  if (!meal) {
    return <div className="p-10 text-center">未找到该美食教程</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <nav className="p-4 border-b">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-orange-500 font-bold hover:underline">
            ← 返回美食广场
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 左侧：图片 */}
          <div>
            <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={meal.strMealThumb}
                alt={meal.strMeal}
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-6 flex gap-3">
               <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {meal.strCategory}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {meal.strArea}
              </span>
            </div>
          </div>

          {/* 右侧：配料表 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{meal.strMeal}</h1>
            <h3 className="text-xl font-semibold mb-3 border-l-4 border-orange-500 pl-3">所需食材</h3>
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

        {/* 底部：制作步骤 */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 border-l-4 border-orange-500 pl-3">制作步骤</h3>
          <div className="bg-gray-50 p-6 rounded-xl text-gray-700 leading-relaxed whitespace-pre-line">
            {meal.strInstructions}
          </div>
        </div>
      </main>
    </div>
  );
}