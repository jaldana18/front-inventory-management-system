# Rediseño del Modal de Creación de Cliente

## Cambios Implementados

Se ha actualizado el componente `CustomerFormDialog.jsx` para que coincida con el diseño de referencia proporcionado.

### 1. Estructura del Modal

**Archivo modificado**: `src/components/customers/CustomerFormDialog.jsx`

#### Cambios en el Header
- Título más grande y prominente (1.5rem, peso 700)
- Subtítulo con color gris (#6b7280)
- Espaciado mejorado (pt: 3, pb: 2)
- Sombra más suave en el diálogo

#### Cambios Generales de Layout
- Eliminación de labels en los campos
- Uso de placeholders en su lugar
- Fondo gris claro (#f9fafb) en todos los inputs
- Transición de color al hacer hover y focus
- Espaciado consistente entre secciones (mb: 4)

### 2. Sección: Información Básica

**Distribución**: 4 columnas (xs=12, sm=6, md=3)

**Campos**:
1. **Nombre** - Placeholder: "Nombre *"
2. **Tipo de Documento** - Select con placeholder: "Tipo de Documento *"
3. **Número de Documento** - Placeholder: "Número de Documento *"
4. **Tipo de Cliente** - Select con placeholder: "Tipo de Cliente"

**Switch "Responsable de IVA"**:
- Alineado a la izquierda
- Color azul índigo (#6366f1) cuando está activo
- Espaciado gap de 1.5 entre switch y label

### 3. Sección: Información de Contacto

**Distribución**: 3 columnas para la mayoría de campos

**Campos**:
- **Primera fila** (3 columnas):
  - Correo electrónico
  - Teléfono
  - Dirección

- **Segunda fila** (3 columnas):
  - Ciudad
  - Estado/Provincia
  - País (valor por defecto: "Colombia")

- **Tercera fila** (2 columnas):
  - Código Postal (50%)
  - Límite de Crédito (50%)

### 4. Sección: Información Adicional

**Distribución**: 2 columnas

**Campos**:
- **Notas** (8 columnas, 66%):
  - Campo multiline con 4 filas
  - Placeholder: "Notas"
  - Fondo gris claro

- **Switch "Activo"** (4 columnas, 33%):
  - Alineado a la derecha
  - Color azul índigo (#6366f1) cuando está activo
  - Display flex con gap de 1.5

### 5. Botones de Acción

**Ubicación**: Footer del diálogo

**Cambios**:
- Borde superior gris claro (#f3f4f6)
- Espaciado vertical aumentado (py: 3)
- Gap entre botones: 2

**Botón "Cancelar"**:
```javascript
{
  textTransform: 'none',
  color: '#6b7280',
  fontWeight: 500,
  fontSize: '0.9375rem',
  px: 3,
  py: 1,
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
}
```

**Botón "Crear"**:
```javascript
{
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9375rem',
  px: 4,
  py: 1,
  backgroundColor: '#6366f1',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#4f46e5',
    boxShadow: 'none',
  },
  '&:disabled': {
    backgroundColor: '#c7d2fe',
    color: '#fff',
  },
}
```

### 6. Estilos Comunes de Input

Todos los campos de texto comparten este estilo:

```javascript
sx={{
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f9fafb',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
    },
  },
}}
```

### 7. Paleta de Colores

| Elemento | Color | Código |
|----------|-------|--------|
| Título | Negro | `#1a1a1a` |
| Subtítulo | Gris medio | `#6b7280` |
| Labels | Gris oscuro | `#374151` |
| Placeholders | Gris claro | `#9ca3af` |
| Input background | Gris muy claro | `#f9fafb` |
| Input hover | Gris claro | `#f3f4f6` |
| Botón primario | Azul índigo | `#6366f1` |
| Botón primario hover | Azul índigo oscuro | `#4f46e5` |
| Bordes | Gris muy claro | `#f3f4f6` |

## Características Preservadas

✅ **Validación**: Toda la validación de Zod se mantiene intacta
✅ **Funcionalidad**: Lógica de creación/edición sin cambios
✅ **Valores por defecto**: "Colombia" como país por defecto
✅ **Tipos de documento**: CC, CE, NIT, Pasaporte
✅ **Tipos de cliente**: Minorista, Mayorista, VIP, Distribuidor
✅ **Responsividad**: Grid adaptativo para móviles y desktop

## Resultado Visual

El modal ahora tiene:
- ✅ Diseño más limpio y moderno
- ✅ Campos con placeholders en lugar de labels
- ✅ Fondo gris claro en todos los inputs
- ✅ Botón primario azul índigo prominente
- ✅ Distribución de 4 columnas en información básica
- ✅ Distribución de 3 columnas en información de contacto
- ✅ Switch "Activo" alineado a la derecha
- ✅ Espaciado consistente y profesional

## Archivos Modificados

1. `src/components/customers/CustomerFormDialog.jsx` - Componente principal del formulario

## Archivos Sin Cambios

- `src/schemas/customer.schema.js` - Schema de validación (ya tenía "Colombia" por defecto)
- Toda la lógica de negocio y hooks permanecen iguales
