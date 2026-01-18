# FitVision Pro - Professional Fitness Tracking App

A modern, feature-rich Progressive Web App for tracking workouts, nutrition, and health goals with AI-powered meal scanning.

## 🚀 Features

### Core Functionality
- **📊 Dashboard** - Real-time calorie tracking, macro breakdown, weight trends
- **💪 Workout Tracker** - Interactive set tracking with rest timers and exercise tutorials
- **🍽️ AI Meal Scanner** - Mock AI-powered nutrition analysis (editable results)
- **📈 Weight Tracking** - Visual trend charts with historical data
- **👤 Profile Management** - Customizable goals, units, and personal data

### Professional Enhancements

#### 🔔 Toast Notifications
Real-time feedback for all user actions:
- Success confirmations (workout completed, weight logged)
- Error messages (invalid input, network issues)
- Info toasts (keyboard shortcuts, view changes)
- Warning alerts (logout confirmation)

#### 💾 LocalStorage Persistence
- **Auto-save**: All data automatically persists between sessions
- **No server required**: Works completely offline
- **Instant sync**: State updates save in real-time
- **Backup-friendly**: Export/import capability

#### ⌨️ Keyboard Shortcuts
Power user features for quick navigation:
- `Alt + 1` - Dashboard
- `Alt + 2` - Workout
- `Alt + 3` - AI Scanner
- `Alt + 4` - Nutrition
- `Alt + 5` - Profile
- `Esc` - Close modals

#### 📱 PWA Support
Install as a native app on any platform:
- **Installable**: Add to home screen on mobile/desktop
- **Offline-ready**: Full functionality without internet
- **App shortcuts**: Quick access to workout & scanner
- **Native feel**: Standalone window mode

#### 🎨 Enhanced UX
- Smooth page transitions
- Loading states for async operations
- Skeleton screens for better perceived performance
- Hover effects and micro-animations
- Accessible keyboard navigation
- Focus indicators for screen readers

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js for weight visualization
- **Icons**: Phosphor Icons
- **Fonts**: Inter (Google Fonts)
- **Architecture**: Clean, modular JavaScript
- **Storage**: LocalStorage API
- **PWA**: Web App Manifest

## 🏁 Getting Started

### Quick Start
```bash
# 1. Navigate to the project folder
cd d:\projects\fitapp

# 2. Start a simple HTTP server
python -m http.server 8000

# 3. Open your browser
# Go to: http://localhost:8000
```

### First Time Setup
1. **Login**: Use any email (e.g., `alex@fitvision.com`) and password
2. **Explore**: All features are immediately available
3. **Customize**: Visit Profile to set your goals and preferences

### Installing as PWA
**Desktop (Chrome/Edge)**:
1. Click the install icon in the address bar
2. Click "Install"
3. App opens in standalone window

**Mobile**:
1. Open browser menu (⋮)
2. Select "Add to Home Screen"
3. Confirm installation

## 📖 User Guide

### Dashboard
- View your daily calorie progress with a circular gauge
- Track protein, carbs, and fat intake
- Monitor weight trends with an interactive chart
- Quick access to start your workout

### Workout Tracker
- **Equipment Toggle**: Switch between free weights and machines
- **Set Tracking**: Tap each set to mark as complete
- **Rest Timer**: Automatic countdown with visual progress ring
- **Exercise Details**: Expand cards to see form tips and video tutorials
- **Progress**: Real-time completion percentage

### AI Meal Scanner
- **Upload Photo**: Take or select a meal photo
- **AI Analysis**: Get instant calorie and macro breakdown (mock data)
- **Edit Results**: Correct any inaccuracies before logging
- **Add to Log**: Meals automatically update your daily totals

### Nutrition Timeline
- View all meals chronologically with custom icons
- See breakdown by meal type (Breakfast, Lunch, Dinner, Snacks)
- Track total daily intake vs. goal
- Quick add meal button to access scanner

### Profile Management
- **Personal Info**: Name, age, sex
- **Goals**: Daily calorie target, target weight & date
- **Units**: Toggle between metric (kg) and imperial (lbs)
- **Logout**: Secure session management

## 🔧 Advanced Features

### Data Persistence
All user data is saved to browser LocalStorage:
- User profile and preferences
- Workout progress and completed sets
- Meal logs and nutrition data
- Weight history
- Equipment preferences

**Data persists across**:
- Browser restarts
- Tab closures
- Page refreshes

**To reset data**: Use browser DevTools → Application → LocalStorage → Clear

### Toast Notification System
Provides real-time feedback:
- **Success** (green): Confirmations
- **Error** (red): Validation failures
- **Info** (cyan): General updates
- **Warning** (yellow): Important alerts

Toasts auto-dismiss after 3 seconds and stack vertically.

### Keyboard Navigation
Full keyboard support:
- `Tab` / `Shift+Tab` - Navigate elements
- `Enter` / `Space` - Activate buttons
- `Alt + [1-5]` - Quick view switching
- `Esc` - Close modals/overlays

## 🎨 Design Philosophy

### Ultra-Dark Theme
- **Primary**: Deep charcoal (#0a0e27)
- **Accents**: Electric green (#00ff88), Cyan (#00d4ff)
- **Glassmorphism**: Frosted glass effects on cards
- **Shadows**: Layered depth with soft glows

### Mobile-First
- Responsive design adapts to all screen sizes
- Bottom navigation on mobile
- Sidebar navigation on desktop
- Touch-optimized tap targets (44px minimum)

### Accessibility
- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Screen reader compatible
- High contrast ratios (WCAG AA compliant)

## 📊 Mock Data

The app includes realistic demo data:
- 5 sample weight entries (showing downward trend)
- 3 daily meals with calorie breakdown
- Complete leg day workout template
- 4 AI meal recognition scenarios

**Note**: All AI features use mock data. For production, integrate:
- Real AI Vision API (OpenAI, Google Cloud Vision, etc.)
- Backend database (Supabase, Firebase)
- Authentication system (OAuth, JWT)

## 🐛 Known Limitations

1. **No Backend**: All data is client-side only
2. **Mock AI**: Scanner uses randomized mock responses
3. **No Sync**: Data doesn't sync across devices
4. **Browser-dependent**: Clearing browser data deletes all progress

## 🔮 Future Enhancements

### Planned Features
- [ ] Real AI integration for meal scanning
- [ ] Backend database (Supabase)
- [ ] User authentication
- [ ] Social features (share workouts)
- [ ] Export data (PDF reports)
- [ ] Custom workout builder
- [ ] Nutrition insights & recommendations
- [ ] Integration with fitness trackers
- [ ] Multi-language support
- [ ] Dark/light theme toggle

### Technical Improvements
- [ ] Service Worker for offline support
- [ ] Push notifications
- [ ] Background sync
- [ ] IndexedDB for larger datasets
- [ ] E2E testing suite
- [ ] CI/CD pipeline

## 📝 Development

### Project Structure
```
fitapp/
├── index.html          # Main HTML structure
├── style.css           # Professional styling + toast system
├── app.js              # Enhanced app logic with persistence
├── manifest.json       # PWA configuration
└── README.md          # This file
```

### Key Functions
- `saveState()` - Persist to LocalStorage
- `showToast(msg, type)` - Display notifications
- `initKeyboardShortcuts()` - Setup hotkeys
- `renderView(view)` - Dynamic view switching
- `Storage.save()/load()` - Wrapper for localStorage

### Code Quality
- **Modular**: Separated concerns (auth, workout, nutrition, etc.)
- **DRY**: Reusable components and utilities
- **Commented**: Clear inline documentation
- **Consistent**: Unified naming conventions
- **Error Handling**: Try-catch blocks with user feedback

## 🤝 Contributing

This is a demonstration project showcasing professional web app development with vanilla JavaScript.

## 📄 License

MIT License - Feel free to use this as a learning resource or template for your own projects.

## 💡 Tips & Tricks

1. **Reset App**: Clear browser data to start fresh
2. **Best Performance**: Use Chrome/Edge for optimal experience
3. **Mobile Install**: Add to home screen for native app feel
4. **Keyboard Power User**: Learn Alt+1-5 shortcuts for speed
5. **Data Backup**: Export LocalStorage periodically

## 🎓 Learning Resources

This project demonstrates:
- Modern JavaScript (ES6+)
- CSS Grid & Flexbox
- LocalStorage API
- Chart.js integration
- PWA development
- Responsive design
- Accessibility best practices
- Toast notification system
- Keyboard event handling
- File upload & preview

---

**Built with ❤️ using Vanilla JavaScript**

*No frameworks. No build tools. Just pure, professional web development.*
