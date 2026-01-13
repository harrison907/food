export interface Recipe {
  id: string;
  name: string;
  image: string;
  category: string;
  area: string;
  ingredients: { name: string; measure: string }[];
  instructions: string;
}

export const chineseRecipes: Recipe[] = [
  {
    id: "1",
    name: "秘制可乐鸡翅",
    image: "https://www.themealdb.com/images/media/meals/usywpp1511189717.jpg",
    category: "家常菜",
    area: "中国",
    ingredients: [
      { name: "鸡翅中", measure: "10个" },
      { name: "可口可乐", measure: "1罐" },
      { name: "姜", measure: "3片" },
      { name: "料酒", measure: "1勺" },
      { name: "生抽", measure: "2勺" },
    ],
    instructions: "1. 鸡翅洗净划两刀。\n2. 冷水下锅焯水。\n3. 煎至两面金黄。\n4. 倒入可乐和调料。\n5. 小火慢炖20分钟，大火收汁。"
  },
  {
    id: "2",
    name: "西红柿炒鸡蛋",
    image: "https://www.themealdb.com/images/media/meals/1529446137.jpg", 
    category: "家常菜",
    area: "中国",
    ingredients: [
      { name: "鸡蛋", measure: "3个" },
      { name: "西红柿", measure: "2个" },
    ],
    instructions: "1. 鸡蛋炒熟盛出。\n2. 炒西红柿出汁。\n3. 倒入鸡蛋混合，加盐出锅。"
  }
];
