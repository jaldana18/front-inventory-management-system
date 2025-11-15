# Inventory Management System

A modern, full-featured inventory management application built with React, Material-UI, and Tailwind CSS.

## Tech Stack

### Core Technologies
- **React 18** - UI library with Vite for fast development
- **Material-UI (MUI)** - Component library for professional UI
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management with caching
- **TanStack Table** - Powerful table component for inventory listings

### Form Management & Validation
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Resolver for Zod integration

### Additional Features
- **React Router DOM** - Client-side routing
- **date-fns** - Date formatting and manipulation
- **Recharts** - Chart library for reports and analytics
- **React Hot Toast** - Toast notifications

## Project Structure

```
src/
├── components/
│   ├── inventory/        # Inventory-specific components
│   │   ├── InventoryTable.jsx
│   │   └── InventoryForm.jsx
│   ├── common/          # Reusable components
│   └── layout/          # Layout components
│       └── MainLayout.jsx
├── pages/               # Page components
│   └── InventoryPage.jsx
├── services/            # API services
│   ├── api.service.js
│   └── inventory.service.js
├── store/               # Zustand stores
│   └── inventoryStore.js
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── config/              # Configuration files
│   ├── api.config.js
│   └── theme.config.js
└── types/               # TypeScript types (if using TS)
```

## Features

### Implemented
- ✅ Modern React setup with Vite
- ✅ Material-UI + Tailwind CSS integration
- ✅ Axios HTTP client with interceptors
- ✅ Authentication token management
- ✅ Form validation with Zod
- ✅ State management with Zustand
- ✅ Server state with React Query
- ✅ Responsive layout with drawer navigation
- ✅ Inventory table with pagination
- ✅ CRUD operations for inventory items
- ✅ Toast notifications
- ✅ Low stock indicators

### Coming Soon
- 📋 Orders management
- 👥 Suppliers management
- 📊 Reports and analytics with charts
- ⚙️ Settings and configuration
- 🔐 Authentication pages
- 📱 Mobile-responsive improvements

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API configuration:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Configuration

### API Configuration
Edit `src/config/api.config.js` to configure API endpoints and settings.

### Theme Configuration
Edit `src/config/theme.config.js` to customize Material-UI theme colors and typography.

### Tailwind Configuration
Edit `tailwind.config.js` to customize Tailwind CSS settings. The configuration includes:
- `important: '#root'` - Ensures Tailwind has precedence
- `corePlugins.preflight: false` - Prevents conflicts with MUI
- `@tailwindcss/forms` plugin for better form styling

## API Integration

The project includes a configured Axios instance with:
- Automatic authentication token injection
- Token refresh on 401 errors
- Global error handling
- Request/response interceptors

### Example API Service
```javascript
import apiClient from './api.service';

export const inventoryService = {
  getAll: async (params) => {
    return apiClient.get('/inventory', { params });
  },

  create: async (data) => {
    return apiClient.post('/inventory', data);
  },
};
```

## State Management

### Zustand Store Example
```javascript
import { useInventoryStore } from './store/inventoryStore';

const MyComponent = () => {
  const { items, addItem } = useInventoryStore();

  // Use state and actions
};
```

### React Query Example
```javascript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['inventory'],
  queryFn: inventoryService.getAll,
});
```

## Contributing

This is an MVP setup. Additional features and pages can be added by:
1. Creating new page components in `src/pages/`
2. Adding routes in `src/App.jsx`
3. Creating corresponding services in `src/services/`
4. Building UI components in `src/components/`

## License

MIT
