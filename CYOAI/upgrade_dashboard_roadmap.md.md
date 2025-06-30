# 🧠 Prompt: Upgrade Voice AI Dashboard (CYOAI SaaS) for Production

You are working on a React + Tailwind CSS frontend dashboard project for a SaaS platform called **CYOAI**, which integrates with a Frappe backend via REST APIs. The dashboard displays real-time Voice Agent Call Logs and user data.

Your task is to complete the following enhancements and features **one by one**, keeping existing styles and layout in place unless you're instructed to update or improve them.

---

## ✅ 1. Polish UX and Responsiveness

- Refactor the layout using Tailwind's `sm:`, `md:`, `lg:` classes for proper responsive behavior across mobile, tablet, and desktop.
- Improve padding, spacing, and card layouts to feel more balanced.
- Add the following UI enhancements:
  - Hover states on all buttons and cards
  - Tooltips for icons
  - Skeleton loaders or animated placeholders during data fetch
  - Graceful empty states (e.g. "No call logs yet")
- Ensure the sidebar and header don’t overlap or break at any screen size.

---

## 🔐 2. Implement Role-Based Access

You are already using the Frappe API method `frappe.auth.get_logged_user()` and can extend this with a custom Frappe method to fetch the user's role.

- Add a new `get_user_role()` method to Frappe backend if not available (assume it returns something like `{ role: "Admin" }`)
- In the React app:
  - Create a `userRole` state
  - Fetch and store the user’s role when the page loads
  - Conditionally render dashboard features or restrict sections (e.g. only Admin can export logs)

---

## 📈 3. Add More Analytics

Use `Chart.js` or `Recharts` to visualize call data from `Voice Agent Call Log`. (The Frappe backend already returns real data.)

- Add charts in a new `Analytics` or `Dashboard Overview` section:
  - **Daily Call Volume**: Line chart
  - **Intent Distribution**: Pie chart
  - **Conversion Funnel**: Bar chart showing "Lead → Converted → Dropped"

If needed, simulate aggregate endpoints in the frontend or request data grouped by date/status/intent from Frappe.

---

## 📤 4. Export & Share Features

- Add a button on the dashboard to **export call logs as CSV**.
  - Use `json2csv` or any CSV utility
  - Filter only visible or selected fields
- Add a placeholder function to trigger email sharing (the actual emailing can be handled later in Frappe).
  - Use a modal to type in an email and show success confirmation
  - Call a `/api/method/your.email.handler` to send the report

---

## 🔁 Notes:

- Maintain dark mode support (already implemented).
- Use the existing `frappeApi.ts` file for all data interactions.
- Do not hardcode URLs – keep using `import.meta.env.VITE_FRAPPE_BASE_URL`.
- Stick to Tailwind best practices.
- Commit frequently and organize each enhancement in a dedicated section of the page (or a new page if needed).

