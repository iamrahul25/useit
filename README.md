# 📸 UseIt — Visual Expiry Catalog & Reminder App

**UseIt** is a fast, visual expiry catalog and decision-making assistant built with **React Native** and **Expo**. It helps users track food items, medicines, produce, cosmetics, and consumables, visually highlighting items before they spoil and scheduling local push reminders.

---

## ✨ Features (v1 Minimal & Robust Core)

- **📸 Visual Photo Catalog**: Snap photos of items directly using your camera or upload from gallery. Photos persist locally on your device via `expo-file-system`.
- **🎨 Color-Coded Expiry Status System**:
  - 🔴 **Expired / Expiring Today**: Past date or 0 days remaining
  - 🟠 **Urgent**: 1–2 days remaining (e.g. *Expires tomorrow*)
  - 🟡 **Soon**: 3–7 days remaining
  - 🟢 **Fresh**: More than 7 days remaining
- **⏱️ "Use First" Decision Assistant**: Auto-sorts your entire catalog by closest expiry date into urgency zones, helping you decide what to cook or consume today.
- **🔔 Local Reminder Notifications**: Offline local push notifications scheduled 1 day before expiry and on the day of expiry via `expo-notifications`.
- **🏷️ Category Filtering & Search**: Instant filter pills (*All | Food | Medicine | Produce | Consumables | Cosmetics | Supplements | Other*) and instant keyword search.
- **🎉 Mark as Used / Consumed**: Easily log items as consumed to remove them from your active catalog.

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [Expo Go](https://expo.dev/go) installed on your iOS/Android phone, or an Android/iOS emulator configured.

### 1. Install Dependencies
If you're setting up for the first time, navigate into the project directory and run:

```bash
cd c:\Users\Rahul\Desktop\React_Native_App\useit
npm install
```

### 2. Start the Expo Development Server

```bash
npx expo start
```

or using `npm`:

```bash
npm start
```

### 3. Running on Devices & Emulators
- **Mobile Device (Expo Go)**: Scan the QR code shown in your terminal using the Expo Go app (Android) or Camera app (iOS).
- **Android Emulator**: Press `a` in the terminal or run `npm run android`.
- **iOS Simulator** (macOS only): Press `i` in the terminal or run `npm run ios`.
- **Web Browser**: Press `w` in the terminal or run `npm run web`.

---

## 📁 Project Architecture & Key Files

```
useit/
├── src/
│   ├── app/
│   │   ├── _layout.tsx           # Root stack layout (Modals & Theme)
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx       # Bottom tab bar (Catalog & Use First)
│   │   │   ├── index.tsx         # Home visual catalog & spotlight
│   │   │   └── use-first.tsx     # "Use First" decision timeline screen
│   │   ├── add-item.tsx          # Add / Edit Item screen (Camera & Details form)
│   │   └── item/[id].tsx         # Item details screen
│   ├── components/
│   │   ├── ItemCard.tsx          # Visual item thumbnail card
│   │   ├── StatusBadge.tsx       # Color-coded urgency status badge
│   │   ├── CategoryFilter.tsx    # Category filter pills
│   │   ├── Header.tsx            # Greeting & quick count header
│   │   └── EmptyState.tsx        # Empty catalog state display
│   ├── utils/
│   │   ├── dateUtils.ts          # Days remaining calculation & status colors
│   │   ├── storage.ts            # AsyncStorage & FileSystem image persistence
│   │   └── notifications.ts      # Local push notification scheduler
│   └── types/
│       └── item.ts               # Data models & category interfaces
├── app.json                      # Expo app config
└── package.json                  # Dependencies
```

---

## 💡 How Storage & Photos Work

1. **Persistent Local Images**: Captured photos are copied to Expo's `FileSystem.documentDirectory/useit_images/`, ensuring images remain permanently stored across app restarts.
2. **Offline Data**: Metadata is stored in `@react-native-async-storage/async-storage`.
3. **Local Reminders**: Notifications are scheduled using `expo-notifications` directly on device with zero external backend requirement.

---

## 📄 License
MIT License. Built for smart consumption & reducing food waste!
