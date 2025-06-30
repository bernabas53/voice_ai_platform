
# 📊 Voice AI Dashboard Revamp & Real Data Integration – Cursor Prompt

## ✅ Instructions

Paste the following prompt into Cursor to generate a fully redesigned and data-integrated dashboard:

---

```
I want to redesign my current React + Tailwind dashboard and also fetch real-time data from my Frappe backend. Please do ALL of the following:

---

🎯 1. Build a complete Dashboard layout in `src/components/Dashboard.tsx` with:

- A fixed **sidebar** on the left that includes:
  - Logo or title: "Voice AI"
  - Navigation links (mock only): Dashboard, Call Logs, Settings, Logout
  - Collapsible on smaller screens

- A **top navbar** inside the main content area that includes:
  - Page title: “Voice AI Dashboard”
  - Right side: Show the logged-in user email (e.g. `you@example.com`)

- A **main content section** beside the sidebar with:
  - A responsive grid of **call log cards**
  - Each card should display:
    - Caller Name
    - Phone Number
    - Intent
    - Summary
    - Status (as a colored badge)

---

📦 2. Connect it to **real Frappe data**:

- Fetch call logs dynamically using the existing Frappe API setup.
- Use `useEffect()` and `fetch('/api/resource/Call Log')` or the proper endpoint already configured.
- Replace mock data with live data fetched from the server.
- Each call log object will contain:
  - `caller_name`
  - `phone_number`
  - `intent`
  - `summary`
  - `status` (e.g. “Lead”, “Converted”, “Pending”)

- Add loading and error states with simple UI feedback if the API fails.

---

🎨 3. Use Tailwind CSS for styling:

- Layout must be clean, minimal, and modern.
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Cards: `bg-white shadow-md rounded-lg p-4 mb-4 hover:shadow-lg`
- Status badge: rounded pill with contextual color:
  - Lead → `bg-yellow-100 text-yellow-800`
  - Converted → `bg-green-100 text-green-800`
  - Pending → `bg-gray-100 text-gray-800`

---

🧠 4. In `App.tsx`, update to:

```tsx
import Dashboard from './components/Dashboard';

function App() {
  return <Dashboard />;
}

export default App;
```

---

🛠️ 5. (If needed) Add basic loading/error UI:
```tsx
{loading ? <p>Loading...</p> : error ? <p>Error fetching data</p> : <CallLogCards />}
```

---

⚠️ Do not use external component libraries like MUI, DaisyUI, etc. Stick to Tailwind. Let me know once it's working and styled so I can move forward with analytics.
```
