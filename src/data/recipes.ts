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
  {
    id: 'banana_canela',
    name_pt: 'Banana com canela e açúcar',
    name_en: 'Banana with cinnamon & sugar',
    yields_servings: 6,
    prep_minutes: 12,
    ingredients_pt: [
      { name: 'Bananas-da-terra ou nanicas firmes', quantity: '6 unidades' },
      { name: 'Manteiga', quantity: '2 colheres de sopa' },
      { name: 'Açúcar', quantity: '4 colheres de sopa' },
      { name: 'Canela em pó', quantity: '1 colher de chá' },
    ],
    ingredients_en: [
      { name: 'Firm bananas (plantain or regular)', quantity: '6 units' },
      { name: 'Butter', quantity: '2 tbsp' },
      { name: 'Sugar', quantity: '4 tbsp' },
      { name: 'Ground cinnamon', quantity: '1 tsp' },
    ],
    steps_pt: [
      'Corte as bananas ao meio, no comprimento.',
      'Misture o açúcar com a canela em uma tigela.',
      'Derreta a manteiga em uma frigideira em fogo médio.',
      'Doure as bananas dos dois lados e polvilhe a mistura de açúcar e canela.',
      'Sirva quentes. Ficam ótimas com sorvete de creme.',
    ],
    steps_en: [
      'Halve the bananas lengthwise.',
      'Mix sugar and cinnamon in a small bowl.',
      'Melt butter in a skillet over medium heat.',
      'Brown bananas on both sides and dust with the sugar-cinnamon mix.',
      'Serve warm. Pairs beautifully with vanilla ice cream.',
    ],
    tips_pt: ['Bananas firmes seguram melhor o ponto', 'Pode flambar com cachaça no final'],
    tips_en: ['Firm bananas hold up better', 'Optionally flambé with cachaça to finish'],
  },
  {
    id: 'salada_frutas',
    name_pt: 'Salada de frutas',
    name_en: 'Fruit salad',
    yields_servings: 8,
    prep_minutes: 20,
    ingredients_pt: [
      { name: 'Manga em cubos', quantity: '1 unidade' },
      { name: 'Maçã em cubos', quantity: '2 unidades' },
      { name: 'Banana em rodelas', quantity: '3 unidades' },
      { name: 'Morango cortado', quantity: '1 caixa' },
      { name: 'Uva sem semente', quantity: '1 cacho pequeno' },
      { name: 'Suco de laranja', quantity: '1 xícara' },
      { name: 'Mel', quantity: '2 colheres de sopa' },
    ],
    ingredients_en: [
      { name: 'Diced mango', quantity: '1 unit' },
      { name: 'Diced apple', quantity: '2 units' },
      { name: 'Sliced banana', quantity: '3 units' },
      { name: 'Sliced strawberries', quantity: '1 box' },
      { name: 'Seedless grapes', quantity: '1 small bunch' },
      { name: 'Orange juice', quantity: '1 cup' },
      { name: 'Honey', quantity: '2 tbsp' },
    ],
    steps_pt: [
      'Lave bem todas as frutas.',
      'Corte tudo em cubos / pedaços parecidos.',
      'Misture o suco de laranja com o mel.',
      'Junte tudo em uma tigela grande, regue com o suco e leve à geladeira por 30 min.',
    ],
    steps_en: [
      'Wash all fruits thoroughly.',
      'Cut everything in similar-sized pieces.',
      'Stir orange juice with honey.',
      'Combine in a big bowl, drizzle the juice, and chill for 30 min.',
    ],
  },
  {
    id: 'pave',
    name_pt: 'Pavê de chocolate',
    name_en: 'Chocolate pavê',
    yields_servings: 10,
    prep_minutes: 30,
    ingredients_pt: [
      { name: 'Biscoito champagne', quantity: '2 pacotes' },
      { name: 'Leite condensado', quantity: '1 lata' },
      { name: 'Leite', quantity: '2 xícaras' },
      { name: 'Chocolate em pó', quantity: '4 colheres de sopa' },
      { name: 'Gemas', quantity: '3 unidades' },
      { name: 'Creme de leite', quantity: '1 lata' },
      { name: 'Café forte (frio)', quantity: '1 xícara, pra molhar os biscoitos' },
    ],
    ingredients_en: [
      { name: 'Ladyfinger biscuits', quantity: '2 packs' },
      { name: 'Sweetened condensed milk', quantity: '1 can' },
      { name: 'Milk', quantity: '2 cups' },
      { name: 'Cocoa powder', quantity: '4 tbsp' },
      { name: 'Egg yolks', quantity: '3 units' },
      { name: 'Heavy cream', quantity: '1 can' },
      { name: 'Strong cold coffee', quantity: '1 cup, for dipping' },
    ],
    steps_pt: [
      'Faça o creme: leve leite condensado, leite, gemas e chocolate ao fogo, mexendo até engrossar.',
      'Tire do fogo e misture o creme de leite. Espere amornar.',
      'Mergulhe os biscoitos rapidamente no café e forre uma travessa.',
      'Alterne camadas de biscoito e creme até terminar (cerca de 3 camadas).',
      'Leve à geladeira por pelo menos 4h antes de servir.',
    ],
    steps_en: [
      'Make the cream: simmer condensed milk, milk, yolks and cocoa, stirring until thick.',
      'Off the heat, stir in the heavy cream. Let cool slightly.',
      'Quickly dip biscuits in coffee and line a tray.',
      'Alternate layers of biscuits and cream (about 3 layers).',
      'Chill at least 4h before serving.',
    ],
  },
  {
    id: 'brigadeiro',
    name_pt: 'Brigadeiros',
    name_en: 'Brigadeiros',
    yields_servings: 10,
    prep_minutes: 25,
    ingredients_pt: [
      { name: 'Leite condensado', quantity: '1 lata' },
      { name: 'Chocolate em pó', quantity: '3 colheres de sopa' },
      { name: 'Manteiga', quantity: '1 colher de sopa' },
      { name: 'Granulado de chocolate', quantity: '100 g, pra cobrir' },
    ],
    ingredients_en: [
      { name: 'Sweetened condensed milk', quantity: '1 can' },
      { name: 'Cocoa powder', quantity: '3 tbsp' },
      { name: 'Butter', quantity: '1 tbsp' },
      { name: 'Chocolate sprinkles', quantity: '100 g, for coating' },
    ],
    steps_pt: [
      'Em uma panela, junte leite condensado, chocolate e manteiga.',
      'Cozinhe em fogo baixo, mexendo sempre, até a massa desgrudar do fundo (~15 min).',
      'Despeje em um prato untado e deixe esfriar.',
      'Enrole bolinhas com as mãos untadas e passe no granulado.',
    ],
    steps_en: [
      'In a pan, mix condensed milk, cocoa, and butter.',
      'Cook on low, stirring constantly, until the mass pulls away from the pan (~15 min).',
      'Pour onto a greased plate and let cool.',
      'Roll into balls with greased hands and coat with sprinkles.',
    ],
    tips_pt: ['Ponto de brigadeiro: ao inclinar a panela, a massa deve "andar" demoradamente'],
    tips_en: ['Right consistency: tilting the pan, the mass should slide slowly'],
  },
];

export function findRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((recipe) => recipe.id === id);
}
