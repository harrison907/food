import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>; // ⚠️ Next.js 15 必须改成 Promise
}

export default async function RecipeDetail(props: PageProps) {
  // ⚠️ 这里必须先 await props.params
  const params = await props.params;
  const { id } = params;
  
  let meal = null;

  // 1. 本地模拟数据兜底
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
    // 2. 真实互联网请求
    try {
      console.log("正在服务器请求ID:", id); // 添加日志方便在 Zeabur 后台看
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`, {
        cache: 'no-store' // 强制不缓存，确保每次都拿最新数据
      });
      const data = await res.json();
      const rawMeal = data.meals?.[0];

      if (rawMeal) {
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
      console.error("Fetch Error:", error);
    }
  }

  // 如果真的没找到，显示 404
  if (!meal) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl">未找到该美食教程</h1>
        <p className="text-gray-500 mt-2">ID: {id}</p>
        <Link href="/" className="text-orange-500 mt-4 block">返回广场</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <nav className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-orange-500 font-bold hover:underline flex items-center gap-1">
            <span>←</span> 返回美食广场
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <Image
                src={meal.strMealThumb}
                alt={meal.strMeal}
                fill
                className="object-cover"
                priority
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
