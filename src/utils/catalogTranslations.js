/**
 * Traducciones para categorías y unidades de medida
 */

export const categoryTranslations = {
  es: {
    'Electronics': 'Electrónicos',
    'Furniture': 'Muebles',
    'Office Supplies': 'Suministros de Oficina',
    'Food & Beverages': 'Alimentos y Bebidas',
    'Clothing & Apparel': 'Ropa y Accesorios',
    'Tools & Hardware': 'Herramientas y Ferretería',
    'Health & Beauty': 'Salud y Belleza',
    'Automotive': 'Automotriz',
    'Sports & Outdoors': 'Deportes y Aire Libre',
    'Books & Media': 'Libros y Medios',
  },
  en: {
    'Electronics': 'Electronics',
    'Furniture': 'Furniture',
    'Office Supplies': 'Office Supplies',
    'Food & Beverages': 'Food & Beverages',
    'Clothing & Apparel': 'Clothing & Apparel',
    'Tools & Hardware': 'Tools & Hardware',
    'Health & Beauty': 'Health & Beauty',
    'Automotive': 'Automotive',
    'Sports & Outdoors': 'Sports & Outdoors',
    'Books & Media': 'Books & Media',
  },
};

export const unitTranslations = {
  es: {
    'Unit': 'Unidad',
    'Kilogram': 'Kilogramo',
    'Liter': 'Litro',
    'Meter': 'Metro',
    'Square Meter': 'Metro Cuadrado',
    'Cubic Meter': 'Metro Cúbico',
    'Gram': 'Gramo',
    'Milligram': 'Miligramo',
    'Pound': 'Libra',
    'Milliliter': 'Mililitro',
    'Gallon': 'Galón',
    'Centimeter': 'Centímetro',
    'Millimeter': 'Milímetro',
    'Kilometer': 'Kilómetro',
    'Inch': 'Pulgada',
    'Foot': 'Pie',
    'Box': 'Caja',
    'Pack': 'Paquete',
    'Dozen': 'Docena',
    'Pair': 'Par',
    'Set': 'Conjunto',
    'Pallet': 'Palé',
    'Ream': 'Resma',
  },
  en: {
    'Unit': 'Unit',
    'Kilogram': 'Kilogram',
    'Liter': 'Liter',
    'Meter': 'Meter',
    'Square Meter': 'Square Meter',
    'Cubic Meter': 'Cubic Meter',
    'Gram': 'Gram',
    'Milligram': 'Milligram',
    'Pound': 'Pound',
    'Milliliter': 'Milliliter',
    'Gallon': 'Gallon',
    'Centimeter': 'Centimeter',
    'Millimeter': 'Millimeter',
    'Kilometer': 'Kilometer',
    'Inch': 'Inch',
    'Foot': 'Foot',
    'Box': 'Box',
    'Pack': 'Pack',
    'Dozen': 'Dozen',
    'Pair': 'Pair',
    'Set': 'Set',
    'Pallet': 'Pallet',
    'Ream': 'Ream',
  },
};

/**
 * Traduce el nombre de una categoría según el idioma
 * @param {string} categoryName - Nombre de la categoría en inglés
 * @param {string} language - Idioma ('es' o 'en')
 * @returns {string} Nombre traducido
 */
export const translateCategory = (categoryName, language = 'es') => {
  return categoryTranslations[language]?.[categoryName] || categoryName;
};

/**
 * Traduce el nombre de una unidad de medida según el idioma
 * @param {string} unitName - Nombre de la unidad en inglés
 * @param {string} language - Idioma ('es' o 'en')
 * @returns {string} Nombre traducido
 */
export const translateUnit = (unitName, language = 'es') => {
  return unitTranslations[language]?.[unitName] || unitName;
};

/**
 * Traduce un arreglo de categorías
 * @param {Array} categories - Arreglo de categorías
 * @param {string} language - Idioma ('es' o 'en')
 * @returns {Array} Categorías con nombres traducidos
 */
export const translateCategories = (categories, language = 'es') => {
  return categories.map(category => ({
    ...category,
    translatedName: translateCategory(category.name, language),
  }));
};

/**
 * Traduce un arreglo de unidades de medida
 * @param {Array} units - Arreglo de unidades
 * @param {string} language - Idioma ('es' o 'en')
 * @returns {Array} Unidades con nombres traducidos
 */
export const translateUnits = (units, language = 'es') => {
  return units.map(unit => ({
    ...unit,
    translatedName: translateUnit(unit.name, language),
  }));
};
