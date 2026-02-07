I'll investigate the current implementation to understand how Categories, Actors, and Directors work, then provide a plan for implementing the Genre management system and dynamic filtering. Let me start by examining the relevant files.

Now let me examine a few more key files to understand the complete picture:

Now let me check if there's already a genres table in the schema:

Perfect! Now I have a complete understanding of the current implementation. Let me provide you with a comprehensive analysis and implementation plan.

## Current Implementation Analysis

### **Current Genre System:**
1. **Manual Text Input**: In `ItemWizard.tsx`, genres are added via free-form text input with an "Add" button
2. **No Predefined List**: No dropdown or selection from existing genres
3. **Storage**: Genres stored as `v.array(v.string())` in items, actors, and directors tables
4. **No Validation**: No standardization (could have "Action" vs "action")
5. **No Central Management**: No dedicated genres table or management UI

### **Current Actors/Directors Pattern:**
1. **Dedicated Tables**: Both have their own tables with full CRUD operations
2. **Management UI**: `ActorsManagement.tsx` and `DirectorsManagement.tsx` with table views
3. **Form Components**: `ActorFormPage.tsx` and `DirectorFormPage.tsx` for add/edit
4. **Selection in ItemWizard**: Dropdown selection from existing actors/directors
5. **Backend API**: Full CRUD operations in `convex/actors.ts` and `convex/directors.ts`

### **Current Genre Filtering:**
1. **Dynamic Extraction**: Genres extracted from all items on frontend
2. **Client-side Filtering**: Uses `item.genres.includes(filterGenre)`
3. **Works on Both Pages**: `DynamicHomePage.tsx` and `movies.tsx` both have genre filtering

## Implementation Plan

### **Task 1: Create Genre Management System**

#### **1.1 Database Schema Changes**
```typescript
// Add to convex/schema.ts
genres: defineTable({
  name: v.string(),
  slug: v.string(), // URL-friendly version
  description: v.optional(v.string()),
  color: v.optional(v.string()), // For UI theming
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_slug", ["slug"]),
```

#### **1.2 Backend API (convex/genres.ts)**
```typescript
// Similar to actors.ts/directors.ts pattern:
- getGenres() - list all genres
- getGenreBySlug() - get single genre
- createGenre() - add new genre
- updateGenre() - edit existing genre
- deleteGenre() - remove genre (with validation)
```

#### **1.3 Frontend Components**
```typescript
// Following actors/directors pattern:
- src/components/GenresManagement.tsx - table view with CRUD
- src/components/GenreForm.tsx - add/edit form
- src/components/GenreFormPage.tsx - full page wrapper
```

#### **1.4 Admin Integration**
- Add "Genres" to admin sidebar navigation
- Add route in `App.tsx` for `/genres` management

### **Task 2: Update ItemWizard Genre Selection**

#### **2.1 Replace Text Input with Dropdown**
```typescript
// In ItemWizard.tsx, replace current genre input with:
<select
  value={genreInput}
  onChange={(e) => setGenreInput(e.target.value)}
  className="sign__input flex-grow-1"
>
  <option value="">Select a genre</option>
  {genres?.map((genre) => (
    <option key={genre._id} value={genre.name}>
      {genre.name}
    </option>
  ))}
</select>
```

#### **2.2 Add Genre Query**
```typescript
// Add to ItemWizard.tsx:
const genres = useQuery(api.genres.getGenres);
```

### **Task 3: Dynamic Genre Filtering Enhancement**

#### **3.1 Update DynamicHomePage.tsx**
- Replace genre extraction logic with direct query to genres table
- Add genre click handlers to navigate to filtered view
- Implement genre-based routing (e.g., `/movies?genre=action`)

#### **3.2 Update movies.tsx**
- Same pattern as DynamicHomePage
- Add URL parameter handling for genre filtering
- Maintain existing filter logic but use predefined genres

#### **3.3 Add Genre Pages**
```typescript
// New component: src/GenrePage.tsx
// Shows all movies for a specific genre
// Similar to Actor.tsx or Director.tsx pages
```

### **Task 4: Migration Strategy**

#### **4.1 Data Migration**
```typescript
// convex/migrations/migrateGenres.ts
// Extract unique genres from existing items/actors/directors
// Create genre records in new genres table
// Update references to use genre IDs (optional) or keep string references
```

#### **4.2 Backward Compatibility**
- Keep existing `genres: v.array(v.string())` in schema
- Gradually migrate to use predefined genres
- Add validation to ensure only valid genres are used

## Implementation Steps

### **Phase 1: Core Genre Management**
1. Add genres table to schema
2. Create `convex/genres.ts` with CRUD operations
3. Build `GenresManagement.tsx` component
4. Add admin navigation and routes

### **Phase 2: ItemWizard Integration**
1. Update ItemWizard to use genre dropdown
2. Add genre query and selection logic
3. Maintain add/remove genre functionality

### **Phase 3: Dynamic Filtering**
1. Update genre extraction in both pages
2. Add click handlers for genre navigation
3. Implement URL-based genre filtering
4. Add genre detail pages

### **Phase 4: Migration & Cleanup**
1. Create migration script for existing data
2. Add genre validation
3. Test all functionality
4. Clean up old manual input code

This approach follows your existing patterns exactly - genres will work just like actors and directors with dedicated management, dropdown selection, and full CRUD operations. The dynamic filtering will be enhanced to use the predefined genre list while maintaining all existing functionality.

Would you like me to start implementing any specific part of this plan?