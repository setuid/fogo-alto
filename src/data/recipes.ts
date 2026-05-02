export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  name_pt: string;
  name_en: string;
  yields_servings: number;
  ingredients_pt: RecipeIngredient[];
  ingredients_en: RecipeIngredient[];
  steps_pt: string[];
  steps_en: string[];
  prep_minutes: number;
  tips_pt?: string[];
  tips_en?: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: 'farofa_simples',
    name_pt: 'Farofa simples',
    name_en: 'Simple farofa',
    yields_servings: 8,
    prep_minutes: 15,
    ingredients_pt: [
      { name: 'Farinha de mandioca torrada', quantity: '500 g' },
      { name: 'Cebola picada', quantity: '1 unidade' },
      { name: 'Manteiga', quantity: '4 colheres de sopa' },
      { name: 'Bacon em cubos', quantity: '150 g' },
      { name: 'Sal', quantity: 'a gosto' },
    ],
    ingredients_en: [
      { name: 'Toasted cassava flour', quantity: '500 g' },
      { name: 'Diced onion', quantity: '1 unit' },
      { name: 'Butter', quantity: '4 tbsp' },
      { name: 'Diced bacon', quantity: '150 g' },
      { name: 'Salt', quantity: 'to taste' },
    ],
    steps_pt: [
      'Frite o bacon até dourar e reserve.',
      'Na mesma panela, derreta a manteiga e doure a cebola.',
      'Adicione a farinha aos poucos, mexendo sempre, até dourar.',
      'Devolva o bacon, ajuste o sal e sirva quente.',
    ],
    steps_en: [
      'Fry bacon until crisp and set aside.',
      'In the same pan, melt the butter and brown the onion.',
      'Add the flour gradually, stirring constantly, until golden.',
      'Return the bacon, adjust salt, and serve warm.',
    ],
  },
  {
    id: 'vinagrete',
    name_pt: 'Vinagrete',
    name_en: 'Vinagrete (Brazilian salsa)',
    yields_servings: 8,
    prep_minutes: 10,
    ingredients_pt: [
      { name: 'Tomate sem semente em cubos', quantity: '4 unidades' },
      { name: 'Cebola roxa picada', quantity: '1 unidade' },
      { name: 'Pimentão verde picado', quantity: '1/2 unidade' },
      { name: 'Vinagre de vinho', quantity: '4 colheres de sopa' },
      { name: 'Azeite', quantity: '4 colheres de sopa' },
      { name: 'Salsinha picada', quantity: '1/2 maço' },
      { name: 'Sal e pimenta', quantity: 'a gosto' },
    ],
    ingredients_en: [
      { name: 'Seeded, diced tomato', quantity: '4 units' },
      { name: 'Diced red onion', quantity: '1 unit' },
      { name: 'Diced green bell pepper', quantity: '1/2 unit' },
      { name: 'Wine vinegar', quantity: '4 tbsp' },
      { name: 'Olive oil', quantity: '4 tbsp' },
      { name: 'Chopped parsley', quantity: '1/2 bunch' },
      { name: 'Salt and pepper', quantity: 'to taste' },
    ],
    steps_pt: [
      'Misture tomate, cebola, pimentão e salsinha em uma tigela.',
      'Tempere com vinagre, azeite, sal e pimenta.',
      'Deixe descansar 10 minutos antes de servir.',
    ],
    steps_en: [
      'Combine tomato, onion, pepper, and parsley in a bowl.',
      'Dress with vinegar, olive oil, salt, and pepper.',
      'Let it rest for 10 minutes before serving.',
    ],
  },
  {
    id: 'pao_alho_caseiro',
    name_pt: 'Pão de alho caseiro',
    name_en: 'Homemade garlic bread',
    yields_servings: 6,
    prep_minutes: 20,
    ingredients_pt: [
      { name: 'Pão francês', quantity: '6 unidades' },
      { name: 'Manteiga', quantity: '200 g' },
      { name: 'Alho amassado', quantity: '6 dentes' },
      { name: 'Salsinha picada', quantity: '2 colheres de sopa' },
      { name: 'Queijo parmesão ralado', quantity: '4 colheres de sopa' },
      { name: 'Sal', quantity: 'a gosto' },
    ],
    ingredients_en: [
      { name: 'French rolls', quantity: '6 units' },
      { name: 'Butter', quantity: '200 g' },
      { name: 'Crushed garlic', quantity: '6 cloves' },
      { name: 'Chopped parsley', quantity: '2 tbsp' },
      { name: 'Grated parmesan', quantity: '4 tbsp' },
      { name: 'Salt', quantity: 'to taste' },
    ],
    steps_pt: [
      'Misture manteiga, alho, salsinha, parmesão e sal.',
      'Faça cortes nos pães sem separar as fatias e recheie com a manteiga.',
      'Embrulhe em papel alumínio e leve ao fogo indireto por 8 min.',
      'Abra o papel e deixe dourar mais 2 minutos.',
    ],
    steps_en: [
      'Mix butter, garlic, parsley, parmesan, and salt.',
      'Slice rolls without separating and stuff with the butter.',
      'Wrap in foil and grill on indirect heat for 8 min.',
      'Open the foil and let brown for 2 more minutes.',
    ],
  },
  {
    id: 'molho_campanha',
    name_pt: 'Molho à campanha',
    name_en: 'Campanha sauce',
    yields_servings: 8,
    prep_minutes: 10,
    ingredients_pt: [
      { name: 'Tomate em cubos', quantity: '3 unidades' },
      { name: 'Cebola roxa picada', quantity: '1 unidade' },
      { name: 'Pimentão verde e vermelho', quantity: '1/2 de cada' },
      { name: 'Vinagre de maçã', quantity: '3 colheres de sopa' },
      { name: 'Azeite', quantity: '4 colheres de sopa' },
      { name: 'Sal e pimenta', quantity: 'a gosto' },
    ],
    ingredients_en: [
      { name: 'Diced tomato', quantity: '3 units' },
      { name: 'Diced red onion', quantity: '1 unit' },
      { name: 'Green and red bell pepper', quantity: '1/2 each' },
      { name: 'Apple cider vinegar', quantity: '3 tbsp' },
      { name: 'Olive oil', quantity: '4 tbsp' },
      { name: 'Salt and pepper', quantity: 'to taste' },
    ],
    steps_pt: [
      'Pique todos os ingredientes em cubinhos do mesmo tamanho.',
      'Tempere e deixe descansar pelo menos 30 minutos antes de servir.',
    ],
    steps_en: [
      'Dice all ingredients to the same size.',
      'Season and let it rest for at least 30 minutes before serving.',
    ],
  },
  {
    id: 'maionese_batata',
    name_pt: 'Maionese de batata',
    name_en: 'Potato salad',
    yields_servings: 8,
    prep_minutes: 30,
    ingredients_pt: [
      { name: 'Batata em cubos', quantity: '1 kg' },
      { name: 'Cenoura em cubos', quantity: '2 unidades' },
      { name: 'Ovos cozidos', quantity: '3 unidades' },
      { name: 'Maionese', quantity: '300 g' },
      { name: 'Cebola picada', quantity: '1 unidade' },
      { name: 'Salsinha picada', quantity: '2 colheres de sopa' },
      { name: 'Sal', quantity: 'a gosto' },
    ],
    ingredients_en: [
      { name: 'Diced potato', quantity: '1 kg' },
      { name: 'Diced carrot', quantity: '2 units' },
      { name: 'Boiled eggs', quantity: '3 units' },
      { name: 'Mayonnaise', quantity: '300 g' },
      { name: 'Diced onion', quantity: '1 unit' },
      { name: 'Chopped parsley', quantity: '2 tbsp' },
      { name: 'Salt', quantity: 'to taste' },
    ],
    steps_pt: [
      'Cozinhe batata e cenoura em água com sal até ficarem firmes.',
      'Escorra, esfrie e leve à geladeira por 30 minutos.',
      'Misture com cebola, ovos picados, salsinha e maionese.',
      'Ajuste o sal e sirva gelada.',
    ],
    steps_en: [
      'Boil potato and carrot in salted water until firm.',
      'Drain, cool, and chill for 30 minutes.',
      'Mix with onion, chopped eggs, parsley, and mayonnaise.',
      'Adjust salt and serve chilled.',
    ],
  },
  {
    id: 'arroz_branco',
    name_pt: 'Arroz branco soltinho',
    name_en: 'Fluffy white rice',
    yields_servings: 6,
    prep_minutes: 25,
    ingredients_pt: [
      { name: 'Arroz tipo 1', quantity: '2 xícaras' },
      { name: 'Água fervente', quantity: '4 xícaras' },
      { name: 'Alho picado', quantity: '2 dentes' },
      { name: 'Cebola picada', quantity: '1/2 unidade' },
      { name: 'Óleo', quantity: '2 colheres de sopa' },
      { name: 'Sal', quantity: 'a gosto' },
    ],
    ingredients_en: [
      { name: 'Long-grain white rice', quantity: '2 cups' },
      { name: 'Boiling water', quantity: '4 cups' },
      { name: 'Minced garlic', quantity: '2 cloves' },
      { name: 'Diced onion', quantity: '1/2 unit' },
      { name: 'Oil', quantity: '2 tbsp' },
      { name: 'Salt', quantity: 'to taste' },
    ],
    steps_pt: [
      'Refogue cebola e alho no óleo até dourar.',
      'Adicione o arroz lavado e refogue por 1 minuto.',
      'Acrescente a água fervente e o sal, tampe e cozinhe em fogo baixo por 15 min.',
      'Solte com um garfo e sirva.',
    ],
    steps_en: [
      'Sauté onion and garlic in oil until golden.',
      'Add the rinsed rice and stir for 1 minute.',
      'Add boiling water and salt, cover, and simmer on low for 15 min.',
      'Fluff with a fork and serve.',
    ],
  },
];

export function findRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((recipe) => recipe.id === id);
}
