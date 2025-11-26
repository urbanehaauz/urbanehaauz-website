# 🚀 Quick Start Guide - Urbane Haauz

## ✅ Project Status

The project has been successfully copied from the reference directory and is now running!

## 🌐 Access the Website

**Local Development Server:**
- **URL**: http://localhost:3000
- **Status**: ✅ Running

## 📋 Available Routes

- **Home Page**: http://localhost:3000/
- **Rooms**: http://localhost:3000/#/rooms
- **Booking**: http://localhost:3000/#/book
- **Admin Dashboard**: http://localhost:3000/#/admin
- **Admin Login**: http://localhost:3000/#/admin/login

## 🔑 Admin Credentials

Check the `AdminLogin.tsx` file or `AppContext.tsx` for login credentials.

## 🛠️ Commands

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
UrbaneHaauz/
├── App.tsx                 # Main app component with routing
├── index.tsx               # Entry point
├── index.html              # HTML template with Tailwind CDN
├── components/             # Reusable components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── DatePicker.tsx
├── pages/                  # Page components
│   ├── Home.tsx
│   ├── Rooms.tsx
│   ├── BookingFlow.tsx
│   ├── AdminDashboard.tsx
│   └── AdminLogin.tsx
├── context/
│   └── AppContext.tsx      # Global state management
├── lib/
│   ├── hero-image.png
│   └── mockData.ts
└── types.ts                # TypeScript type definitions
```

## 🎨 Design Features

- **Color Scheme**: Luxury Sunset theme with:
  - Burnished Copper (`#8C5E45`)
  - Deep Espresso (`#1C1917`)
  - Antique Gold (`#C5A059`)
  - Warm Ivory (`#F9F8F6`)

- **Typography**: 
  - Headings: Playfair Display (Serif)
  - Body: Inter (Sans-serif)

- **Styling**: Tailwind CSS via CDN

## 📝 Notes

- The project uses **HashRouter** for routing (URLs will have `#` in them)
- Tailwind CSS is loaded via CDN in `index.html`
- Images are stored in the `lib/` directory
- Mock data is in `lib/mockData.ts`

## 🐛 Troubleshooting

If the server isn't running:

1. **Stop any existing process**:
   ```bash
   pkill -f vite
   ```

2. **Start fresh**:
   ```bash
   npm run dev
   ```

3. **Check port 3000**:
   ```bash
   lsof -ti:3000
   ```

If port 3000 is busy, edit `vite.config.ts` and change the port.

---

**🎉 Your Urbane Haauz website is now running!**

Open http://localhost:3000 in your browser to see it in action.

