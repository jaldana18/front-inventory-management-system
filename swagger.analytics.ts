import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './environment';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory System - Analytics & Reporting API',
      version: '1.0.0',
      description: `
# API de Reportería y Análisis

Sistema completo de reportería para análisis de ventas, productos y métricas de inventario.

## Características

- 📊 **Dashboard Ejecutivo**: KPIs principales y métricas clave
- 📈 **Timeline de Ventas**: Análisis temporal con granularidad configurable
- 🏆 **Top Productos**: Ranking de productos más vendidos
- 📁 **Análisis por Categoría**: Performance de categorías y subcategorías
- 🔄 **Comparación de Períodos**: Análisis comparativo entre períodos
- 📦 **Estado de Inventario**: Alertas de stock y métricas de inventario

## Autenticación

Todos los endpoints requieren autenticación mediante JWT token:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Multi-tenancy

Todos los datos se filtran automáticamente por el \`companyId\` del usuario autenticado.

## Filtros Comunes

La mayoría de endpoints soportan estos parámetros:

- **startDate** (ISO 8601): Fecha de inicio del rango
- **endDate** (ISO 8601): Fecha de fin del rango
- **categoryId**: Filtrar por categoría de producto
- **warehouseId**: Filtrar por almacén

## Formatos de Fecha

Todas las fechas deben estar en formato ISO 8601:
- \`2024-01-15\` (solo fecha)
- \`2024-01-15T10:30:00Z\` (fecha y hora UTC)

## Métricas Calculadas

### Granularidades Disponibles
- **day**: Agrupación diaria
- **week**: Agrupación semanal (domingo a sábado)
- **month**: Agrupación mensual
- **year**: Agrupación anual

### Tipos de Ordenamiento
- **revenue**: Por ingresos generados (default)
- **quantity**: Por cantidad vendida

## Ejemplos de Uso

### Obtener ventas del último mes
\`\`\`
GET /api/v1/analytics/sales/timeline?startDate=2024-11-01&endDate=2024-11-30&granularity=day
\`\`\`

### Top 10 productos más vendidos
\`\`\`
GET /api/v1/analytics/products/top-selling?limit=10&sortBy=revenue
\`\`\`

### Comparar este mes vs mes anterior
\`\`\`
GET /api/v1/analytics/sales/comparison
  ?period1Start=2024-11-01&period1End=2024-11-30
  &period2Start=2024-10-01&period2End=2024-10-31
\`\`\`

## Códigos de Respuesta

- **200**: Éxito
- **400**: Parámetros inválidos
- **401**: No autenticado
- **403**: Sin permisos
- **500**: Error del servidor

## Rate Limiting

- Límite: 100 requests por minuto por usuario
- Header de respuesta: \`X-RateLimit-Remaining\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@inventory-system.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.production.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Analytics',
        description: 'Endpoints de reportería y análisis de datos',
      },
      {
        name: 'Dashboard',
        description: 'KPIs y métricas del dashboard ejecutivo',
      },
      {
        name: 'Sales Analysis',
        description: 'Análisis de ventas y tendencias',
      },
      {
        name: 'Product Analysis',
        description: 'Análisis de productos y performance',
      },
      {
        name: 'Category Analysis',
        description: 'Performance de categorías de productos',
      },
      {
        name: 'Inventory Status',
        description: 'Estado de inventario y alertas',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint de autenticación',
        },
      },
      schemas: {
        DashboardResponse: {
          type: 'object',
          properties: {
            totalSales: {
              type: 'object',
              properties: {
                amount: { type: 'number', example: 125450.50, description: 'Monto total de ventas' },
                count: { type: 'integer', example: 450, description: 'Número de transacciones' },
                percentageChange: { type: 'number', example: 12.5, description: 'Cambio porcentual vs período anterior' },
              },
            },
            topProducts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'integer', example: 123 },
                  name: { type: 'string', example: 'Laptop Dell XPS 15' },
                  revenue: { type: 'number', example: 67500.00 },
                },
              },
            },
            categoriesPerformance: {
              type: 'array',
              items: { $ref: '#/components/schemas/CategoryPerformance' },
            },
            lowStockAlerts: {
              type: 'array',
              items: { $ref: '#/components/schemas/LowStockAlert' },
            },
            recentTransactions: { type: 'integer', example: 50 },
            inventoryValue: { type: 'number', example: 450000.00 },
          },
        },
        TimelineResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date', example: '2024-01-15' },
                  totalSales: { type: 'number', example: 5670.50 },
                  transactionCount: { type: 'integer', example: 23 },
                  totalQuantity: { type: 'number', example: 156 },
                  avgTicket: { type: 'number', example: 246.54 },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 125450.00 },
                average: { type: 'number', example: 5977.38 },
                highest: { type: 'number', example: 8950.00 },
                lowest: { type: 'number', example: 2340.00 },
              },
            },
          },
        },
        TopProduct: {
          type: 'object',
          properties: {
            rank: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 123 },
            sku: { type: 'string', example: 'LAP-DELL-XPS-001' },
            name: { type: 'string', example: 'Laptop Dell XPS 15' },
            categoryName: { type: 'string', example: 'Electrónicos', nullable: true },
            quantitySold: { type: 'number', example: 45 },
            revenue: { type: 'number', example: 67500.00 },
            transactionCount: { type: 'integer', example: 45 },
            avgUnitPrice: { type: 'number', example: 1500.00 },
            profitMargin: { type: 'number', example: 22.5, nullable: true },
          },
        },
        CategoryPerformance: {
          type: 'object',
          properties: {
            categoryId: { type: 'integer', example: 5 },
            name: { type: 'string', example: 'Electrónicos' },
            parentCategory: { type: 'string', example: null, nullable: true },
            revenue: { type: 'number', example: 89000.00 },
            quantity: { type: 'number', example: 234 },
            transactionCount: { type: 'integer', example: 180 },
            percentageOfTotal: { type: 'number', example: 71.2 },
            topProduct: {
              type: 'object',
              nullable: true,
              properties: {
                productId: { type: 'integer' },
                name: { type: 'string' },
                revenue: { type: 'number' },
              },
            },
            subcategories: {
              type: 'array',
              items: { $ref: '#/components/schemas/CategoryPerformance' },
            },
          },
        },
        PeriodComparison: {
          type: 'object',
          properties: {
            period1: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' },
                value: { type: 'number' },
                label: { type: 'string' },
              },
            },
            period2: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' },
                value: { type: 'number' },
                label: { type: 'string' },
              },
            },
            comparison: {
              type: 'object',
              properties: {
                absoluteChange: { type: 'number', example: 27000 },
                percentageChange: { type: 'number', example: 27.55 },
                trend: { type: 'string', enum: ['up', 'down', 'stable'], example: 'up' },
              },
            },
          },
        },
        LowStockAlert: {
          type: 'object',
          properties: {
            productId: { type: 'integer', example: 89 },
            name: { type: 'string', example: 'Mouse Logitech' },
            currentStock: { type: 'number', example: 5 },
            minimumStock: { type: 'number', example: 10 },
            reorderPoint: { type: 'number', example: 15 },
            status: { type: 'string', enum: ['low', 'critical'], example: 'critical' },
            daysUntilStockout: { type: 'integer', example: 3, nullable: true },
            recommendedOrderQuantity: { type: 'number', example: 25 },
          },
        },
        InventoryStatusResponse: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalProducts: { type: 'integer', example: 450 },
                totalValue: { type: 'number', example: 450000.00 },
                lowStockCount: { type: 'integer', example: 23 },
                criticalStockCount: { type: 'integer', example: 5 },
                overstockCount: { type: 'integer', example: 12 },
              },
            },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/LowStockAlert' },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message description' },
            details: { type: 'object', nullable: true },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'No autenticado - Token JWT inválido o expirado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Unauthorized - Invalid or expired token' },
            },
          },
        },
        Forbidden: {
          description: 'Sin permisos para acceder a este recurso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Forbidden - Insufficient permissions' },
            },
          },
        },
        BadRequest: {
          description: 'Parámetros de solicitud inválidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        property: { type: 'string' },
                        constraints: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Internal server error' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/analytics.controller.ts', './src/routes/analytics.routes.ts'],
};

export const analyticsSwaggerSpec = swaggerJsdoc(options);

export default analyticsSwaggerSpec;
