# FitVision & Coach Pro
## Comprehensive Development Specification
**Project Status:** Production-Ready PWA with Native Conversion Support
**Primary Developer Role:** Senior Full-Stack Developer & AI Implementation Expert

---

## EXECUTIVE SUMMARY
Build a comprehensive fitness and nutrition tracking Progressive Web App (PWA) with AI-powered meal recognition, dynamic workout management, and comprehensive health analytics. The application must be architected for seamless conversion to native formats (Electron for .exe, Capacitor for .apk) while maintaining full offline functionality and optimal performance across all device sizes.

---

## 1. CORE FEATURES & DETAILED LOGIC

### 1.1 Dynamic Workout System

#### 1.1.1 Daily Dashboard & Workout Overview
- **Primary Display:** Show the scheduled workout for the current day (e.g., "Monday: Chest Day - Upper Body Push Focus").
- **Workout Card Layout:**
  - Large, prominent display of the day's workout name and focus area
  - Brief description or emoji indicator (💪 Strength, 🔥 Cardio, 🧘 Flexibility, etc.)
  - Estimated duration and difficulty level (Beginner, Intermediate, Advanced)
  - Quick-start button and expandable details section
- **Data Structure:**
  - Store workout templates in a JSON format with the following schema:
    ```
    {
      id: string,
      day: string,
      name: string,
      focusArea: string,
      duration: number (minutes),
      difficulty: "Beginner" | "Intermediate" | "Advanced",
      exercises: Exercise[]
    }
    ```

#### 1.1.2 Smart Exercise Library with Equipment Flexibility
- **Core Requirement:** Every exercise must support multiple equipment variations with dynamic UI updates.
- **Material Toggle Implementation:**
  - Create a prominent Material Design toggle switch at the top of each exercise section
  - Label: "Dumbbells/Free Weights" ⟷ "Machines/Bodyweight"
  - Toggle should immediately update:
    - Exercise instructions and form cues
    - Representative images (3-5 high-quality images per variation)
    - Video recommendations (links to authoritative sources like YouTube)
    - Equipment-specific tips and modifications
  - Store equipment variations in the exercise object:
    ```
    {
      id: string,
      name: string,
      targetMuscles: string[],
      variations: {
        "dumbbell": {
          instructions: string,
          images: string[],
          videoUrl: string,
          tips: string[]
        },
        "machine": {
          instructions: string,
          images: string[],
          videoUrl: string,
          tips: string[]
        },
        "bodyweight": {
          instructions: string,
          images: string[],
          videoUrl: string,
          tips: string[]
        }
      },
      setReps: { sets: number, reps: number },
      restTime: number (seconds)
    }
    ```
- **Visual Updates:**
  - Images should display in a carousel or grid (use lazy-loading for performance)
  - Video embeds should be responsive and not autoplay (for battery/data efficiency on mobile)
  - Smooth transitions (0.3s) when switching equipment types

#### 1.1.3 Real-Time Workout Tracker
- **Tracking Interface:**
  - Expandable exercise cards with a clean, minimal design
  - Each exercise shows: Exercise name, Target muscles, Set/Rep scheme, Rest timer
  - **Set Completion Checkbox System:**
    - Individual checkboxes for each set (e.g., "Set 1 ☑ Set 2 ☐ Set 3 ☐")
    - Visual progress bar showing completed sets/total sets
    - Animated feedback when all sets are marked complete (gentle pulse, color change to green)
  - **Rest Timer:**
    - Automatic countdown timer after marking a set as complete
    - Customizable rest duration (default from exercise data)
    - Visual and subtle audio notification when rest period expires
  - **Completion State:**
    - Once all sets are checked, exercise turns green and moves to a "Completed" section
    - Overall workout progress bar at the top showing % of exercises completed
- **Data Persistence:**
  - Save workout session progress every 30 seconds (auto-save)
  - Allow users to abandon or complete a session
  - Store session data with timestamp, date, exercises completed, and duration

---

### 1.2 AI Nutrition & Calorie Counter (Vision AI Integration)

#### 1.2.1 Photo Upload & Capture Component
- **UI/UX Design:**
  - Large, prominent circular button labeled "Scan Meal 📸" in electric green on the Nutrition tab
  - Two options: "Take Photo" (camera access) and "Upload from Gallery"
  - Loading state with animated skeleton screens while processing
  - Error handling with user-friendly messages and retry options
- **Technical Implementation:**
  - Use HTML5 `<input type="file">` for gallery uploads (mobile-safe via Capacitor)
  - Use `navigator.mediaDevices.getUserMedia()` for camera access with fallback
  - Implement image compression before sending to API (max 2MB, target 1024x1024 resolution)
  - Support multiple image formats: JPEG, PNG, WebP
  - Show preview of selected image with ability to retake/reselect before submission

#### 1.2.2 AI Integration & Meal Analysis (Vision API)
- **API Integration Architecture:**
  - Create a `/services/ai/analyzeMealPhoto.js` service module
  - Support pluggable API providers: Gemini Vision, OpenAI GPT-4o, Claude Vision
  - **Mock Implementation (for development):**
    ```javascript
    // analyzeMealPhoto.js - Abstracted for API-agnostic implementation
    export async function analyzeMealPhoto(imageData, apiProvider = 'mock') {
      if (apiProvider === 'mock') {
        return simulateMealAnalysis(imageData);
      }
      if (apiProvider === 'gemini') {
        return callGeminiVisionAPI(imageData);
      }
      // ... other providers
    }
    ```
  - Mock function should return realistic data structure with plausible values for testing

- **AI Analysis Requirements:**
  1. **Food Item Identification:**
     - Identify all visible food items in the image
     - Estimate portion sizes based on visual cues (hand size, plate diameter, cup measurements)
     - Return confidence scores for each identified item (0-100%)
  2. **Nutritional Calculation:**
     - Calculate total calories and macronutrients (Carbs, Protein, Fat)
     - Break down by individual food items for transparency
     - Include micronutrients if possible (Fiber, Sodium, Sugar, key vitamins)
  3. **Interactive Clarification Mode:**
     - If confidence for any item is below 75%, trigger an interactive Q&A
     - Example questions: "Is this brown rice or white rice?", "Is this whole milk or skim?", "What's the portion size estimate?"
     - Update nutritional calculations based on user responses
     - Allow manual adjustments to portion sizes with live calorie recalculation
  4. **Return Data Structure:**
     ```javascript
     {
       success: boolean,
       mealName: string,
       confidence: number (0-100),
       foodItems: [
         {
           name: string,
           portion: string,
           calories: number,
           macros: {
             carbs: number (grams),
             protein: number (grams),
             fat: number (grams)
           },
           micros: {
             fiber: number,
             sodium: number,
             sugar: number
           },
           confidence: number (0-100)
         }
       ],
       totals: {
         calories: number,
         macros: { carbs, protein, fat },
         micros: { fiber, sodium, sugar }
       },
       clarificationQuestions?: [
         {
           itemId: string,
           question: string,
           options: string[]
         }
       ]
     }
     ```

#### 1.2.3 Daily Food Log & Calorie Tracking
- **Timeline View:**
  - Display all meals logged today in a vertical timeline format
  - Group by meal type: Breakfast, Lunch, Dinner, Snacks
  - Each meal shows: Food items, calories, timestamp, edit/delete options
  - Compact card design with expandable details
- **Calorie Progress Bar:**
  - Full-width progress bar at the top showing:
    - Current calories consumed (bold, large text)
    - Daily calorie goal (smaller text, e.g., "1,850 / 2,000 kcal")
    - Visual indicator (green when under goal, yellow when approaching, red when exceeded)
  - Macronutrient breakdown below: Protein, Carbs, Fat with small circular progress indicators
  - Real-time updates when new meals are added
- **Additional Features:**
  - Quick-access macro targets based on user's goal (bulking, cutting, maintenance)
  - Ability to edit portion sizes or delete meals
  - Notes field for each meal (optional, for logging hunger level or meal satisfaction)
  - Daily summary visible on home dashboard

---

### 1.3 Health & Progress Tracking

#### 1.3.1 Weight Tracker with Visualization
- **Logging Interface:**
  - Simple input form: Date picker + Weight input field (support both kg and lbs)
  - Large, easy-to-tap input area for daily weight entry
  - Toggle for metric (kg) vs. imperial (lbs) conversion
  - Timestamp automatically added
- **Visual Chart:**
  - Use Recharts library for responsive line chart
  - Display last 30-90 days of weight data
  - Show trend line (7-day moving average) overlaid on daily data
  - Interactive tooltips on hover showing exact date and weight
  - Y-axis dynamically scales to show ±5-10 lbs from min/max weight
  - X-axis shows week numbers or date labels
  - Responsive: Adjusts from small mobile display to full desktop dashboard
- **Statistics Display:**
  - Current weight (highlighted)
  - Weight change this week / this month
  - Progress toward goal (lbs/kg remaining)
  - Estimated time to goal based on current trend

#### 1.3.2 Goal Setting & Management
- **Goal Configuration UI:**
  - Set target weight with date deadline
  - Set daily calorie intake goal (with presets based on typical activity levels)
  - Optional: Set macro targets (% split for Carbs/Protein/Fat)
  - Optional: Set weekly exercise frequency goal
- **Data Structure:**
  ```javascript
  {
    targetWeight: number,
    targetDate: string (ISO date),
    dailyCalorieGoal: number,
    macroTargets: {
      carbs: number (%), // 0-100
      protein: number (%),
      fat: number (%)
    },
    activityLevel: "Sedentary" | "Light" | "Moderate" | "Active" | "VeryActive"
  }
  ```
- **Goal Progress Display:**
  - Dashboard card showing progress toward all active goals
  - Visual indicators (progress rings or bars) for weight loss and calorie adherence
  - Motivational messaging based on progress

---

## 2. TECHNICAL STACK & ARCHITECTURE

### 2.1 Framework & Core Technologies
- **Frontend Framework:** Next.js 14+ (App Router) or React 18+
  - Next.js recommended for: built-in optimizations, API routes for proxy/auth, static generation
  - Use TypeScript for type safety and better DX
- **Styling:** Tailwind CSS 3.4+
  - Extend Tailwind config for custom "Ultra-Dark" theme (see section 2.3)
  - Use CSS Grid and Flexbox for responsive layouts
  - No custom CSS files; maintain utility-first approach
- **State Management:** React Context API + useReducer OR Zustand (for simplicity)
  - Avoid Redux for this project scope; Context is sufficient
  - Create custom hooks for business logic (useWorkout, useNutrition, useProgress)
- **HTTP Client:** Axios or Fetch API with wrapper utility
  - Axios preferred for interceptors (auth, error handling)
- **Charts & Visualization:** Recharts 2.5+
  - Lightweight, React-native, responsive by default
  - Alternative: Chart.js with react-chartjs-2
- **Data Persistence:**
  - Primary: Supabase (PostgreSQL + Auth + Real-time Capabilities)
  - Fallback/Offline: IndexedDB (via idb library) for robust client-side storage
  - LocalStorage for lightweight settings/preferences only
  - Implement service worker for offline support and sync queue

### 2.2 Folder Structure (Clean Architecture)
```
/fitvision-coach-pro
  /public
    /images
      /exercises
      /ui
    /icons
  /src
    /app
      /layout.tsx
      /page.tsx
      /(tabs)
        /home
        /workout
        /nutrition
        /profile
    /components
      /common
        /BottomNavigation.tsx
        /Header.tsx
        /LoadingSpinner.tsx
      /workout
        /WorkoutDashboard.tsx
        /ExerciseCard.tsx
        /EquipmentToggle.tsx
        /SetTracker.tsx
        /RestTimer.tsx
      /nutrition
        /MealScannerUI.tsx
        /PhotoUploadComponent.tsx
        /MealAnalysisResult.tsx
        /InteractiveQA.tsx
        /DailyFoodLog.tsx
        /CalorieProgressBar.tsx
      /health
        /WeightTracker.tsx
        /WeightChart.tsx
        /GoalSetting.tsx
        /ProgressDashboard.tsx
    /hooks
      /useWorkout.ts
      /useNutrition.ts
      /useHealth.ts
      /useLocalStorage.ts
      /useDarkMode.ts
      /useMediaQuery.ts
    /services
      /ai
        /analyzeMealPhoto.ts
        /mealAnalysisService.ts
      /api
        /workoutAPI.ts
        /nutritionAPI.ts
        /healthAPI.ts
      /storage
        /indexedDBService.ts
        /supabaseService.ts
      /utils
        /imageCompression.ts
        /calorieCalculations.ts
        /dateFormatters.ts
    /types
      /workout.types.ts
      /nutrition.types.ts
      /health.types.ts
      /user.types.ts
    /constants
      /exercises.ts
      /goals.ts
      /theme.ts
    /styles
      /globals.css
      /tailwind.config.js
    /middleware
      /auth.ts
      /errorHandler.ts
```

### 2.3 Theme Configuration (Ultra-Dark Mode with Electric Accents)

**Color Palette:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0e27',      // Deep charcoal for main background
        'dark-card': '#1a1f3a',    // Slightly lighter for cards
        'dark-secondary': '#2d3142', // For borders/dividers
        'accent-green': '#00ff88',  // Electric green for primary actions
        'accent-cyan': '#00d4ff',   // Electric cyan for secondary
        'accent-purple': '#a855f7', // Optional tertiary accent
        'text-primary': '#ffffff',
        'text-secondary': '#b0b5c1',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
      },
      backgroundColor: {
        'dark': '#0a0e27',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
      },
    },
  },
};
```

**Design System Principles:**
- All backgrounds: Deep blacks (#0a0e27) and dark grays (#1a1f3a)
- All interactive elements: Use accent-green or accent-cyan with hover states
- All text: Pure white (#ffffff) for primary, light gray (#b0b5c1) for secondary
- All buttons: Electric green background with dark text on hover
- All inputs: Dark cards with subtle border (dark-secondary color)
- All cards/panels: Elevated with subtle shadow (blur: 20px, opacity: 0.1)
- Transitions: All interactive elements use `transition-all duration-300 ease-out`

### 2.4 Navigation: Bottom Navigation Bar
**Mobile-First Design:**
- Fixed bottom bar (height: 70px) on all mobile/tablet views
- Icons + Labels for each tab: Home, Workout, AI Scan, Nutrition, Profile
- Use Lucide React or Heroicons for consistent, modern icon set
- Active tab indicator: Electric green underline or background highlight
- On desktop (>768px): Convert to sidebar on left or top navigation bar
- Icons: Home (Home), Dumbbell (Workout), Camera/Scan (AI Scan), Apple/Fork (Nutrition), User (Profile)

**Component Structure:**
```typescript
interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number; // For notification count
}

const navItems: NavItem[] = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { label: 'Workout', icon: <DumbbellIcon />, path: '/workout' },
  { label: 'Scan', icon: <CameraIcon />, path: '/nutrition/scan' },
  { label: 'Nutrition', icon: <AppleIcon />, path: '/nutrition' },
  { label: 'Profile', icon: <UserIcon />, path: '/profile' },
];
```

---

## 3. DATA PERSISTENCE STRATEGY

### 3.1 Offline-First Architecture
- **Tier 1 (Preferred):** Supabase (cloud)
  - User authentication
  - Workout templates and settings
  - Historical data (weight logs, meal logs)
  - Real-time sync when online
- **Tier 2 (Fallback):** IndexedDB (client-side)
  - Mirror of critical data for offline access
  - Sync queue for mutations while offline
  - Automatic cleanup of old data (30-day retention)
- **Tier 3 (Lightweight):** React Context + Session Storage
  - Current workout session state
  - UI preferences (dark mode, units)
  - Temporary data during active sessions

### 3.2 Data Synchronization
- **Background Sync API:** Use Service Worker to sync pending changes when connectivity returns
- **Conflict Resolution:** Last-write-wins strategy with timestamp comparison
- **Optimistic UI:** Update local state immediately, sync to server in background
- **Error Handling:** Queue failed sync attempts with exponential backoff (1s, 2s, 4s, 8s max)

---

## 4. NATIVE CONVERSION SPECIFICATIONS

### 4.1 Electron (Windows .exe / macOS .app)
- **Framework:** electron-builder + electron-squirrel-startup
- **Key Considerations:**
  - Avoid Node.js-specific APIs in React components
  - Use electron IPC for native features (file dialogs, native notifications)
  - Preload scripts for secure context bridge
  - Code signing certificate for .exe distribution
  - Auto-update mechanism via electron-updater
- **Performance:** Enable V8 code caching for faster startup

### 4.2 Capacitor (.apk / .ipa)
- **Framework:** Capacitor 5+ with Ionic CLI
- **Key Considerations:**
  - Use Capacitor Camera API instead of `getUserMedia` directly
  - Use Capacitor Filesystem for document/image storage
  - Implement native permission prompts via Capacitor
  - Test on Android 12+ and iOS 14+ for best compatibility
  - APK signing required for Play Store distribution
- **Performance:** Optimize bundle size, minify assets, enable compression

### 4.3 Platform-Agnostic Code Requirements
- **Browser APIs to Avoid in Core Logic:**
  - `localStorage` (use IndexedDB instead)
  - `XMLHttpRequest` (use Fetch API)
  - Direct `navigator.mediaDevices` (wrap with Capacitor abstraction)
- **Best Practices:**
  - Create abstraction layers (`/services/device/*`) for platform-specific features
  - Use feature detection (not user-agent detection)
  - Test builds regularly on actual devices (Android/iOS/Windows)
  - Maintain separate build configs for web, electron, and capacitor

---

## 5. SPECIFIC IMPLEMENTATION INSTRUCTIONS

### 5.1 Clean Code & Architecture
- **Component Design:**
  - Keep components focused and reusable (single responsibility principle)
  - Use TypeScript interfaces for all props
  - Prop drilling minimized via Context API or component composition
  - No business logic in UI components; extract to custom hooks
- **API Layer Abstraction:**
  - All HTTP calls isolated in `/services/api/*` files
  - Environmental variables for API endpoints and keys
  - Error handling and request/response interceptors in a central location
  - Mock implementations for development without real API keys
- **State Management:**
  - Create custom hooks for each feature domain (useWorkout, useNutrition, etc.)
  - Hooks should encapsulate both state and side effects
  - Use useReducer for complex state logic

### 5.2 Mobile-First Responsiveness
- **Breakpoints (Tailwind):**
  - Mobile: 0-640px (default, no prefix)
  - Tablet: 640px+ (sm:)
  - Desktop: 1024px+ (lg:)
  - Large Desktop: 1280px+ (xl:)
- **Design Implementation:**
  - Always design for mobile first, then enhance for larger screens
  - Use `max-w-full` on mobile, `max-w-7xl` on desktop
  - Stack content vertically on mobile, use 2-3 column grids on desktop
  - Bottom navigation on mobile, sidebar on desktop (CSS media query based)
  - Font sizes: 14px-16px mobile, 16px-18px desktop
  - Spacing: 16px mobile, 24px desktop (scale proportionally)
- **Touch-Friendly Design:**
  - Minimum 48px x 48px touch targets on mobile
  - Adequate spacing between interactive elements (8px minimum)
  - Avoid hover-only interactions; use active states instead

### 5.3 AI Service Implementation Details

**Mock Service for Development:**
```typescript
// /services/ai/analyzeMealPhoto.ts (Mock Implementation)

export interface MealAnalysisResult {
  success: boolean;
  mealName: string;
  confidence: number;
  foodItems: FoodItem[];
  totals: NutritionalTotals;
  clarificationQuestions?: ClarificationQuestion[];
}

// Mock implementation returns realistic data
export async function analyzeMealPhoto(imageData: string): Promise<MealAnalysisResult> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock result based on simple image analysis
  return {
    success: true,
    mealName: 'Mixed Bowl',
    confidence: 82,
    foodItems: [
      {
        name: 'Grilled Chicken Breast',
        portion: '150g',
        calories: 245,
        macros: { carbs: 0, protein: 52, fat: 5 },
        micros: { fiber: 0, sodium: 75, sugar: 0 },
        confidence: 95
      },
      {
        name: 'Brown Rice',
        portion: '1 cup cooked',
        calories: 216,
        macros: { carbs: 45, protein: 5, fat: 2 },
        micros: { fiber: 4, sodium: 10, sugar: 1 },
        confidence: 78
      },
      {
        name: 'Broccoli',
        portion: '2 cups',
        calories: 70,
        macros: { carbs: 13, protein: 9, fat: 1 },
        micros: { fiber: 3, sodium: 94, sugar: 2 },
        confidence: 90
      }
    ],
    totals: {
      calories: 531,
      macros: { carbs: 58, protein: 66, fat: 8 },
      micros: { fiber: 7, sodium: 179, sugar: 3 }
    }
  };
}

// Production implementation (commented out for development)
/*
export async function analyzeMealPhotoProduction(
  imageBase64: string,
  apiProvider: 'gemini' | 'openai' = 'gemini'
): Promise<MealAnalysisResult> {
  const apiKey = process.env.REACT_APP_VISION_API_KEY;
  
  if (apiProvider === 'gemini') {
    return callGeminiVisionAPI(imageBase64, apiKey);
  } else if (apiProvider === 'openai') {
    return callOpenAIVisionAPI(imageBase64, apiKey);
  }
}
*/
```

**Image Compression Utility:**
```typescript
// /services/utils/imageCompression.ts

export async function compressImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        let { width, height } = img;
        if (width > height) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

### 5.4 Performance & Optimization
- **Code Splitting:**
  - Use dynamic imports for heavy components (AI analysis, charts)
  - Lazy load workout images in exercise library
  - Split nutrition and workout features into separate bundles
- **Image Optimization:**
  - Use Next.js Image component with proper sizing
  - Serve WebP format with JPEG fallback
  - Implement responsive images (srcset)
  - Lazy load images below the fold
- **Bundle Size:**
  - Target: <350KB gzipped for initial load
  - Use tree-shaking to remove unused dependencies
  - Monitor bundle size with `webpack-bundle-analyzer`
- **Runtime Performance:**
  - Minimize re-renders with React.memo for list items
  - Use useCallback for event handlers
  - Debounce search/filter inputs (300ms)
  - Virtualize long lists if needed

### 5.5 Error Handling & Validation
- **Input Validation:**
  - Validate image files before upload (type, size)
  - Validate weight/calorie inputs (numeric, range checks)
  - Validate date inputs (not in future, reasonable range)
- **Error Boundaries:**
  - Implement React Error Boundary for graceful error handling
  - Display user-friendly error messages with retry options
  - Log errors to monitoring service (Sentry, LogRocket)
- **API Error Handling:**
  - Retry failed requests with exponential backoff
  - Display offline indicator when network unavailable
  - Queue mutations for later sync
  - Handle rate limiting (429 errors) with user-friendly wait messaging

---

## 6. DEVELOPMENT & DEPLOYMENT GUIDELINES

### 6.1 Development Environment Setup
```bash
# Install dependencies
npm install

# Environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_VISION_API_KEY=your_vision_api_key (only needed for production)
NEXT_PUBLIC_APP_ENV=development

# Run development server
npm run dev

# Build and test Electron
npm run electron:dev

# Build and test Capacitor
npm run capacitor:dev
```

### 6.2 Testing Strategy
- **Unit Tests:** Jest for utilities and hooks (target: 80% coverage)
- **Component Tests:** React Testing Library for UI components
- **E2E Tests:** Cypress for critical user flows (workout, meal scan, progress tracking)
- **Performance Tests:** Lighthouse for web, native profilers for Electron/Capacitor

### 6.3 Deployment
- **Web (PWA):** Deploy to Vercel, Netlify, or self-hosted Nginx
  - Enable PWA manifest and service worker
  - HTTPS required for service worker and camera access
- **Electron (.exe):** Build with electron-builder, distribute via GitHub Releases or app installer
- **Capacitor (.apk):** Build via Android Studio, upload to Google Play Store
- **CI/CD:** GitHub Actions or similar for automated builds and testing

---

## 7. ACCEPTANCE CRITERIA

### Core Functionality
- [ ] Workout dashboard displays scheduled workout for the day
- [ ] Exercise equipment toggle dynamically updates instructions, images, and videos
- [ ] All sets can be marked complete with visual feedback and progress bar
- [ ] Rest timer automatically triggers after set completion
- [ ] Photo upload and capture work on mobile and desktop
- [ ] AI meal analysis returns realistic nutritional data (mock implementation)
- [ ] Interactive clarification questions display when confidence is low
- [ ] Daily food log displays all meals with cumulative calorie progress
- [ ] Weight tracker accepts daily entries and displays line chart
- [ ] Goal setting interface allows configuration of targets and deadlines
- [ ] Bottom navigation bar appears on mobile, converts to sidebar on desktop

### Technical Requirements
- [ ] All data persists offline using IndexedDB
- [ ] Background sync resumes when connectivity returns
- [ ] Bundle size <350KB (gzipped)
- [ ] Page load time <2 seconds on 4G
- [ ] Lighthouse score >90 on web
- [ ] Zero console errors on app launch
- [ ] No browser-only APIs in production code
- [ ] Responsive across mobile, tablet, and desktop
- [ ] Theme properly implements ultra-dark mode with electric accents
- [ ] Code follows folder structure and is well-commented

### Platform Conversion
- [ ] Web builds successfully with `npm run build`
- [ ] Electron package builds successfully as .exe (Windows)
- [ ] Capacitor builds successfully as .apk (Android)
- [ ] All features work identically across all platforms
- [ ] Offline functionality verified on all platforms
- [ ] Camera and file access tested on native platforms

---

## 8. FUTURE ENHANCEMENTS (Out of Scope - Phase 2)
- Social features (friend leaderboards, workout sharing)
- Advanced analytics (macro trends, workout performance graphs)
- Wearable integration (Apple Watch, Wear OS)
- Voice logging for meals and workouts
- Custom workout builder UI
- Community meal database for faster logging
- Integration with fitness tracking APIs (Apple Health, Google Fit)
- Premium features (advanced AI analysis, personalized recommendations)

---

## NOTES FOR DEVELOPMENT TEAM
1. **Avoid these common pitfalls:** Using localStorage for critical data, hardcoding API keys, assuming online connectivity, building desktop-only layouts first, ignoring compression on images
2. **Test frequently** on actual mobile devices, not just browsers
3. **Commit incrementally** with meaningful messages following conventional commits
4. **Document all API contracts** and data structures as you build
5. **Use TypeScript strictly** — enable `strict: true` in tsconfig.json
6. **Code review** every PR for accessibility, performance, and maintainability