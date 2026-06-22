# PipLog Android App

A native Android trading journal application built with Kotlin and Jetpack Compose.

## Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose with Material 3
- **Backend**: Supabase (Auth, Database, Storage)
- **DI**: Hilt
- **Navigation**: Navigation Compose
- **Charts**: YCharts
- **Image Loading**: Coil
- **Date/Time**: kotlinx-datetime

## Features

### Authentication
- Email/password sign up and login
- Google OAuth support
- Password reset

### Dashboard
- Account balance with equity curve
- Weekly goal tracking
- Performance metrics (Net P/L, Today P/L, Drawdown)
- Trading insights
- Quick action buttons

### Trade Management
- Add/edit trades with full details:
  - Pair, direction, lot size, entry/exit prices
  - Auto-calculated P/L and R:R ratio
  - Stop loss and take profit
  - Strategy, session, confidence
  - Psychology (emotions before/after)
  - Mistake tracking
  - Notes and screenshots
- Trade history with search/filter
- Trade detail view

### Analytics
- Performance metrics (win rate, avg win/loss, profit factor)
- Session performance breakdown
- Recent trades overview
- Journal notes preview

### Calendar
- Monthly calendar view with P/L indicators
- Daily trade summary
- Month performance summary

### Journal
- Daily, weekly, lesson, and goal entries
- Entry management (create, edit, delete)

### Settings
- Profile editing
- Theme preferences
- Notifications toggle
- Account management

## Project Structure

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/piplog/app/
│   │   │   ├── data/
│   │   │   │   ├── model/       # Data models (Trade, Profile, JournalEntry)
│   │   │   │   ├── repository/  # Data layer repositories
│   │   │   │   └── supabase/    # Supabase client setup
│   │   │   ├── ui/
│   │   │   │   ├── theme/       # Material 3 theme, colors, typography
│   │   │   │   ├── screens/     # Feature screens
│   │   │   │   ├── components/  # Reusable UI components
│   │   │   │   └── navigation/  # Navigation graph
│   │   │   └── utils/           # Utility functions
│   │   └── res/
│   └── build.gradle.kts
└── build.gradle.kts
```

## Building the Project

1. Open the project in Android Studio
2. Set environment variables for Supabase:
   ```bash
   export SUPABASE_URL="your-supabase-url"
   export SUPABASE_ANON_KEY="your-anon-key"
   ```
3. Sync Gradle files
4. Build and run on an Android device or emulator (API 26+)

## Data Models

### Trade
- Pair, direction (buy/sell), lot size
- Entry/exit prices, stop loss, take profit
- Auto-calculated: pips, P/L, R:R ratio
- Strategy, session, confidence
- Emotions, mistakes, notes
- Screenshot support

### Profile
- Display name, email, avatar URL
- Currency preference, subscription plan

### JournalEntry
- Title, content, entry type
- Entry date, timestamps

## Theme

The app uses a dark Material 3 theme with:
- Primary: Blue (`#5B8DEF`)
- Profit: Green (`#4ADE80`)
- Loss: Red (`#F87171`)
- Background: Dark (`#12121F`)
- Surface: Dark gray (`#1A1A2E`)

## Supabase Configuration

The app connects to the same Supabase backend as the web app:
- Uses existing database tables (trades, profiles, journal_entries)
- RLS policies ensure users only access their own data
- Storage bucket for trade screenshots

## License

This project is part of PipLog trading journal platform.
