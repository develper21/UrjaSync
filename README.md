# UrjaSync - Smart Home Super App

A high-fidelity, production-ready frontend prototype for a Smart Metering Super App built with Next.js, TypeScript, and Tailwind CSS.

## Overview

UrjaSync allows users to monitor, control, and optimize all their smart home appliances from a single, intuitive dashboard. The app features:

- **Dashboard**: Real-time energy usage monitoring and smart recommendations
- **Appliances**: Control and manage all connected smart devices
- **Optimization**: Time-of-Day (ToD) tariff insights and cost-saving recommendations
- **Routines**: Create and manage automated home routines
- **Billing**: Track estimated bills and monthly savings
- **Settings**: Manage profile, notifications, and connected devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components with inline SVG icons

## Project Structure

```
urjasync-app/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main dashboard container
│   └── globals.css          # Global styles & animations
├── components/
│   ├── layout/              # Layout components (Sidebar, Header, Notifications)
│   ├── dashboard/           # Dashboard components (StatCard, UsageChart, etc.)
│   ├── appliances/          # Appliance controls (ApplianceCard, ToggleSwitch)
│   ├── optimization/        # Optimization components (TariffCard)
│   ├── routines/            # Routine management (RoutineCard)
│   ├── billing/             # Billing components (BillingHistoryTable)
│   ├── settings/            # Settings components (ProfileCard, NotificationSettings)
│   ├── views/               # Page views for each section
│   └── icons/               # Reusable SVG icon components
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   └── mockData.ts          # Mock data for development
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Design System

### Color Palette

- **Primary (Action)**: `blue-600` - Buttons, toggles, active states
- **Secondary (Success)**: `green-500/600` - Savings, off-peak indicators
- **Alert (Peak)**: `red-500` - Peak time warnings
- **Warning**: `orange-50/200` - Recommendation cards
- **Neutrals**: Gray scale for text, backgrounds, and borders

### Core Components

- **Cards**: `bg-white rounded-xl shadow-lg p-6`
- **Primary Button**: `bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700`
- **Secondary Button**: `bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200`

## Features

### Dashboard
- Live energy usage display
- Current tariff status with peak/off-peak indicator
- Estimated monthly bill
- Monthly savings tracking
- Usage history chart
- Smart recommendations
- Quick access to routines

### Appliances
- Grid view of all connected appliances
- Real-time status and consumption display
- Toggle appliances on/off
- Schedule appliance operations
- View appliance details

### Optimization
- Time-of-Day (ToD) tariff display
- Peak/Standard/Off-Peak rate information
- Actionable recommendations for cost savings
- Accept or ignore recommendations

### Routines
- View all automation routines
- Quick run button for manual execution
- Edit routine configurations
- Create new routines

### Billing
- Estimated monthly bill display
- Total savings this month
- Billing history table
- Invoice download functionality

### Settings
- Profile management (name, email)
- Password change functionality
- Email notification preferences
- Optimization report frequency
- Appliance alert settings
- Device management

## Supabase Integration Ready

All components are built to be "Supabase-ready":

- Mock data in `lib/mockData.ts` can be replaced with Supabase client calls
- All forms use standard React form patterns
- Ready for integration with Supabase Edge Functions
- TypeScript interfaces in `lib/types.ts` for type safety

## Animations & Interactions

- Smooth page transitions
- Animated notification popup with spinning border
- Hover effects on cards and buttons
- Toggle switch animations
- Peak status indicator with pulsing animation
- Usage chart hover effects

## Future Enhancements

- [ ] Supabase authentication integration
- [ ] Real-time data updates with Supabase Realtime
- [ ] User profile picture upload
- [ ] Advanced analytics and reporting
- [ ] Mobile app version
- [ ] Dark mode support
- [ ] Multi-language support

## Development Notes

### Adding New Icons

Create a new file in `components/icons/` following the pattern:

```typescript
const IconName = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* SVG paths */}
  </svg>
);

export default IconName;
```

### Modifying Mock Data

Edit `lib/mockData.ts` to update mock data. All data follows the TypeScript interfaces defined in `lib/types.ts`.

## License

MIT

## Contact

For questions or feedback, please reach out to the development team.
