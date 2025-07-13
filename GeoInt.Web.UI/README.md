# GeoInt Web UI - Vue.js Frontend

A modern Vue.js frontend application for managing Points of Interest (POIs) with mapping capabilities.

## 🚀 Features

- **Map View**: Interactive map with MapLibre showing POI points
- **POI Management**: Full CRUD operations for POIs
- **CSV Import**: Bulk import POIs from CSV files
- **Category Filtering**: Filter POIs by category on map and table
- **Search**: Search POIs by name or category
- **Sorting**: Sort POI table by name and category
- **Pagination**: Paginated table view
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Custom Modals**: Non-JavaScript confirmation dialogs
- **Notifications**: Toast message system

## 🏗️ Architecture

### Clean Architecture Implementation

```
src/
├── domain/                    # Business entities and types
│   ├── models/POI.ts         # POI domain model
│   └── types/common.ts       # Common types and interfaces
├── business/                  # Business logic layer
│   ├── usecases/POIUseCase.ts # POI business logic
│   ├── repositories/IPOIRepository.ts # Repository interface
│   └── services/IValidationService.ts # Service interfaces
├── infrastructure/           # External concerns
│   └── services/
│       ├── POIRepository.ts  # API repository implementation
│       └── ValidationService.ts # Validation service
├── composables/              # Vue.js composables (useXXX pattern)
│   ├── usePOI.ts            # POI reactive state management
│   └── useMap.ts            # Map state management
├── stores/                   # Pinia stores
│   ├── poiStore.ts          # POI state store
│   └── messageStore.ts      # Message/notification store
├── presentation/             # UI layer
│   ├── components/          # Reusable components
│   │   ├── MessageContainer.vue # Notification system
│   │   ├── POIFormModal.vue    # Create/Edit POI form
│   │   ├── ImportCSVModal.vue  # CSV import modal
│   │   └── ConfirmationModal.vue # Custom confirmation dialogs
│   └── views/               # Main views
│       ├── MapView.vue      # Map interface
│       └── POIView.vue      # POI table interface
├── App.vue                  # Main application component
├── main.ts                  # Application entry point
└── style.css               # Global styles
```

### Vue.js Best Practices Implemented

1. **Composition API**: Using Vue 3's Composition API throughout
2. **Composables Pattern**: Business logic in reusable composables
3. **Pinia State Management**: Centralized state with Pinia stores
4. **TypeScript**: Full TypeScript support with strict typing
5. **Reactive Programming**: Proper reactivity with computed properties
6. **Component Composition**: Reusable, single-responsibility components
7. **Proper Event Handling**: Custom events and prop validation

## 🛠️ Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Pinia** - Vue state management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **MapLibre GL** - Open-source mapping library
- **Axios** - HTTP client
- **Papa Parse** - CSV parsing library
- **Heroicons** - SVG icons
- **Vite** - Build tool

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `localhost:5000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Type checking**:
   ```bash
   npm run type-check
   ```

### Configuration

The application expects the backend API to be running on `localhost:5000`. The Vite proxy configuration automatically forwards `/api` requests to the backend.

## 📱 Usage

### Map View (Default)

- **View POIs**: See all POIs plotted on the map
- **Category Filter**: Use dropdown to filter by category
- **POI Information**: Click on markers to see POI details
- **Auto-zoom**: Map automatically fits to show all POIs

### POI Table View

- **View All POIs**: Paginated table with all POI data
- **Search**: Filter POIs by name or category
- **Sort**: Click column headers to sort
- **CRUD Operations**: Add, Edit, Delete POIs with modal forms
- **CSV Import**: Bulk import POIs from CSV files

### CSV Import Format

```csv
name,category,lat,long
"Central Park","Park",40.785091,-73.968285
"Empire State Building","Tourist Attraction",40.748817,-73.985428
```

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive**: Works on desktop and mobile
- **Fast Performance**: Optimized Vue.js application
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **No Gradients**: Clean, flat design as requested

## 🔧 Development

### Project Structure

- **Domain Layer**: Pure business logic and models
- **Business Layer**: Use cases and service interfaces
- **Infrastructure Layer**: External service implementations
- **Presentation Layer**: Vue components and views

### Key Components

1. **MapView.vue**: Main map interface with MapLibre
2. **POIView.vue**: Data table with pagination and CRUD
3. **POIFormModal.vue**: Create/Edit POI form
4. **ImportCSVModal.vue**: CSV import wizard
5. **ConfirmationModal.vue**: Custom confirmation dialogs

### State Management

- **POI Store**: Manages POI data and operations
- **Message Store**: Handles notifications and messages
- **Composables**: Reactive business logic

### API Integration

All API calls are handled through the repository pattern with proper error handling and loading states.

## 🚀 Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve the `dist` folder** with any static file server

3. **Configure backend proxy** in production environment

## 📋 API Requirements

The frontend expects the following backend endpoints:

- `GET /api/pois` - Get all POIs
- `GET /api/pois/{id}` - Get POI by ID
- `POST /api/pois` - Create new POI
- `PUT /api/pois` - Update POI
- `DELETE /api/pois/{id}` - Delete POI
- `POST /api/pois/bulk-csv` - Bulk import POIs
- `GET /api/pois/togeojson` - Get POIs as GeoJSON
- `GET /api/pois/tocsv` - Get POIs as CSV

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**: Check if MapLibre dependencies are installed
2. **API errors**: Verify backend is running on `localhost:5000`
3. **CSV import issues**: Ensure CSV has required columns: name, category, lat, long

### Development Tips

- Use Vue DevTools for debugging
- Check browser console for errors
- Verify API endpoints with network tab
- Test responsiveness with device simulation

## 🤝 Contributing

1. Follow Vue.js style guide
2. Use TypeScript for type safety
3. Write clean, readable code
4. Follow the established architecture patterns
5. Add proper error handling
6. Test on different screen sizes

## 📄 License

This project is part of the GeoInt solution. 