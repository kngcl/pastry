export const PRODUCTS = {
  crepes: { label: 'Crepes', unit: 'pieces', color: 'amber' },
  gaufres: { label: 'Gaufres', unit: 'pieces', color: 'yellow' },
  fluffy: { label: 'Fluffy Pancakes', unit: 'pieces', color: 'pink' },
  jus: { label: 'Jus de Fruits', unit: 'verres', color: 'green' },
};

export const PRODUCT_KEYS = Object.keys(PRODUCTS);

export const INGREDIENT_LABELS = {
  eggs: 'Oeufs (pieces)',
  sugar_spoons: 'Sucre (cuilleres)',
  milk_sachets: 'Lait en liquide (sachets)',
  vanilla_sugar_sachets: 'Sucre vanille (sachets)',
  vanilla_covers: 'Vanille (covers)',
  flour_kg: 'Farine (kg)',
  oil_spoons: 'Huile (cuilleres)',
  butter: 'Beurre (pieces)',
  baking_powder: 'Levure chimique (pieces)',
  salt: 'Sel (pieces)',
  fruits: 'Fruits (kg)',
  water: 'Eau (litres)',
  ice: 'Glace (sachets)',
  chocolate: 'Chocolat (tablettes)',
  cream: 'Creme (sachets)',
  honey: 'Miel (cuilleres)',
};

export const REMAINING_ITEMS = [
  'sel', 'huile', 'oeufs', 'levure chimique', 'vanille',
  'sucre vanille', 'farine', 'lait', 'beurre', 'sucre',
  'fruits', 'chocolat', 'creme', 'miel', 'glace',
];

export function emptyProducts() {
  return Object.fromEntries(
    PRODUCT_KEYS.map(k => [k, {
      liters: '', produced: '', sold: '', stock: '',
      leftover: '', leftoverSold: '',
    }])
  );
}

export function emptyIngredients() {
  return Object.fromEntries(Object.keys(INGREDIENT_LABELS).map(k => [k, '']));
}
