export interface ProductInfo {
    name: string;
    category: string;
    sku: string;
    price: number;
    stock: number;
}

export const PRODUCT_CATALOG: ProductInfo[] = [
    // UTILES ESCOLARES
    { name: 'Cuaderno A4 Cuadriculado', category: 'Útiles Escolares', sku: 'UTL-001', price: 5.90, stock: 150 },
    { name: 'Lápiz 2B Faber Castell', category: 'Útiles Escolares', sku: 'UTL-002', price: 1.50, stock: 300 },
    { name: 'Borrador Blanco Artesco', category: 'Útiles Escolares', sku: 'UTL-003', price: 0.80, stock: 200 },
    { name: 'Tajador Metálico', category: 'Útiles Escolares', sku: 'UTL-004', price: 1.20, stock: 180 },
    { name: 'Colores x12 Faber Castell', category: 'Útiles Escolares', sku: 'UTL-005', price: 12.90, stock: 90 },
    { name: 'Plumones x10 Artesco', category: 'Útiles Escolares', sku: 'UTL-006', price: 8.50, stock: 120 },
    { name: 'Regla 30cm Transparente', category: 'Útiles Escolares', sku: 'UTL-007', price: 2.00, stock: 250 },
    { name: 'Compás Escolar Metal', category: 'Útiles Escolares', sku: 'UTL-008', price: 6.50, stock: 80 },
    { name: 'Temperas x6 Artesco', category: 'Útiles Escolares', sku: 'UTL-009', price: 7.90, stock: 100 },
    { name: 'Papel Bond A4 x500', category: 'Útiles Escolares', sku: 'UTL-010', price: 14.90, stock: 60 },
    // MOCHILAS Y MALETAS
    { name: 'Mochila Escolar Totto', category: 'Mochilas y Maletas', sku: 'MCH-001', price: 89.90, stock: 45 },
    { name: 'Mochila con Ruedas Xtrem', category: 'Mochilas y Maletas', sku: 'MCH-002', price: 129.90, stock: 30 },
    { name: 'Lonchera Térmica', category: 'Mochilas y Maletas', sku: 'MCH-003', price: 35.90, stock: 55 },
    { name: 'Cartuchera Doble Cierre', category: 'Mochilas y Maletas', sku: 'MCH-004', price: 19.90, stock: 80 },
    // ESCRITORIO Y OFICINA
    { name: 'Grapadora Metal Artesco', category: 'Escritorio y Oficina', sku: 'OFC-001', price: 15.90, stock: 70 },
    { name: 'Perforadora 2 Huecos', category: 'Escritorio y Oficina', sku: 'OFC-002', price: 12.50, stock: 55 },
    { name: 'Clips Mariposa x50', category: 'Escritorio y Oficina', sku: 'OFC-003', price: 3.50, stock: 200 },
    { name: 'Post-it Colores x4', category: 'Escritorio y Oficina', sku: 'OFC-004', price: 9.90, stock: 110 },
    { name: 'Archivador Palanca A4', category: 'Escritorio y Oficina', sku: 'OFC-005', price: 8.90, stock: 90 },
    { name: 'Cinta Scotch 18mm', category: 'Escritorio y Oficina', sku: 'OFC-006', price: 2.50, stock: 300 },
    { name: 'Tijera Escolar Punta Roma', category: 'Escritorio y Oficina', sku: 'OFC-007', price: 4.50, stock: 150 },
    // TECNOLOGIA
    { name: 'Calculadora Científica Casio', category: 'Tecnología', sku: 'TEC-001', price: 59.90, stock: 40 },
    { name: 'USB 32GB Kingston', category: 'Tecnología', sku: 'TEC-002', price: 25.90, stock: 80 },
    { name: 'Audífonos In-Ear', category: 'Tecnología', sku: 'TEC-003', price: 15.90, stock: 100 },
    { name: 'Mouse Inalámbrico Logitech', category: 'Tecnología', sku: 'TEC-004', price: 39.90, stock: 35 },
    // JUEGOS Y ENTRETENIMIENTO
    { name: 'Juego de Mesa Monopoly', category: 'Juegos y Entretenimiento', sku: 'JUG-001', price: 59.90, stock: 25 },
    { name: 'Rompecabezas 1000 pzas', category: 'Juegos y Entretenimiento', sku: 'JUG-002', price: 39.90, stock: 35 },
    { name: 'Masa PlayDoh x4', category: 'Juegos y Entretenimiento', sku: 'JUG-003', price: 24.90, stock: 65 },
    { name: 'Balón de Fútbol N5', category: 'Juegos y Entretenimiento', sku: 'JUG-004', price: 45.00, stock: 50 },
    // CUALQUIER
    { name: 'Caja Grande', category: 'Cualquier', sku: 'CJ-001', price: 1.00, stock: 999 },
];