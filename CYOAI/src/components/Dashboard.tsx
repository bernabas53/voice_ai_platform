import { useState, useEffect, useRef } from "react";
import { frappeApi } from "../lib/frappeApi";
import { getSocket } from "../lib/socket";
import LiveChart from "./LiveChart";
import { useTheme } from "../ThemeContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

interface CallLog extends Record<string, unknown> {
  name: string;
  caller_name?: string;
  phone_number?: string;
  intent?: string;
  summary?: string;
  status?: string;
}

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const { theme, toggleTheme } = useTheme();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "success">("idle");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New call log received', read: false, time: '2m ago' },
    { id: 2, text: 'Profile updated successfully', read: true, time: '1h ago' },
    { id: 3, text: 'System maintenance scheduled', read: false, time: '1d ago' },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dateRange, setDateRange] = useState<{from: string, to: string}>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 6);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  });
  const [filteredLogs, setFilteredLogs] = useState<CallLog[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const pieColors = ['#3b82f6', '#06b6d4', '#f59e42', '#a78bfa', '#f87171', '#10b981'];

  useEffect(() => {
    frappeApi
      .getLoggedInUser()
      .then((res) => {
        setUserEmail(res.message);
      })
      .catch(() => {
        setUserEmail("");
      });
    setIsLoading(true);
    frappeApi
      .getCallLogs()
      .then((logs: unknown[]) => {
        setCallLogs(logs as CallLog[]);
      })
      .catch(() => {
        setError("Failed to load call logs");
      })
      .finally(() => {
        setIsLoading(false);
      });
    // Fetch user role
    frappeApi.getUserRole().then(res => {
      setUserRole(res.role);
    }).catch(() => setUserRole(""));
  }, []);

  // Real-time socket updates
  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      socket.emit("subscribe_doc", { doctype: "Voice Agent Call Log" });
    });

    socket.on("new_call_log", (newLog: CallLog) => {
      setCallLogs((prev) => {
        if (prev.some((log) => log.name === newLog.name)) return prev;
        return [newLog, ...prev];
      });
    });

    return () => {
      socket.off("new_call_log");
      socket.disconnect();
    };
  }, []);

  // Fetch with filters
  useEffect(() => {
    setFilterLoading(true);
    const filters: any[] = [];
    const orFilters: any[] = [];
    if (search) {
      orFilters.push(["caller_name", "like", `%${search}%`]);
      orFilters.push(["phone_number", "like", `%${search}%`]);
      orFilters.push(["intent", "like", `%${search}%`]);
    }
    if (status && status !== "All") {
      filters.push(["status", "=", status]);
    }
    if (dateRange.from && dateRange.to) {
      filters.push(["creation", ">=", dateRange.from + " 00:00:00"]);
      filters.push(["creation", "<=", dateRange.to + " 23:59:59"]);
    }
    frappeApi.getCallLogs(filters.length ? filters : undefined, orFilters.length ? orFilters : undefined)
      .then((logs: unknown[]) => setFilteredLogs(logs as CallLog[]))
      .catch(() => setError("Failed to filter call logs"))
      .finally(() => setFilterLoading(false));
  }, [search, status, dateRange]);

  // Debounced search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(value), 300);
  };

  // --- Analytics Data Preparation ---
  // Group callLogs by date for daily volume
  const dailyVolume = Object.values(
    callLogs.reduce((acc, log) => {
      const date = log.name?.slice(0, 10) ?? 'Unknown';
      acc[date] = acc[date] || { date, count: 0 };
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; count: number }>)
  );
  // Group by intent for pie chart
  const intentDist = Object.values(
    callLogs.reduce((acc, log) => {
      const intentKey = log.intent ?? 'Unknown';
      acc[intentKey] = acc[intentKey] || { intent: intentKey, value: 0 };
      acc[intentKey].value += 1;
      return acc;
    }, {} as Record<string, { intent: string; value: number }>)
  );
  // Conversion funnel: count by status
  const funnelStages = ['Lead', 'Converted', 'Dropped'];
  const funnelData = funnelStages.map(stage => ({
    stage,
    value: callLogs.filter(log => log.status === stage).length,
  }));
  // Metrics: real data
  const uniqueCallers = Array.from(new Set(callLogs.map(l => l.caller_name))).filter(Boolean).length;
  // Monthly Target: conversion rate this month
  const now = new Date();
  const monthStr = now.toISOString().slice(0,7); // 'YYYY-MM'
  const callsThisMonth = callLogs.filter(l => l.name?.slice(0,7) === monthStr);
  const monthlyCalls = callsThisMonth.length;
  // Total calls today
  const todayStr = now.toISOString().slice(0,10); // 'YYYY-MM-DD'
  const callsToday = callLogs.filter(l => l.name?.slice(0,10) === todayStr).length;
  // Weekly Calls: last 7 days
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const weeklyCalls = daysOfWeek.map(date => {
    const dayStr = date.toISOString().slice(0,10);
    return {
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      count: callLogs.filter(l => l.name?.slice(0,10) === dayStr).length,
    };
  });
  const metrics = [
    {
      label: "Customers",
      value: uniqueCallers.toLocaleString(),
      change: '',
      changeType: '',
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ),
    },
    {
      label: "Total Calls Today",
      value: callsToday.toLocaleString(),
      change: '',
      changeType: '',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M9 3v4m6-4v4M4 11h16M4 15h16M10 19h4" /></svg>
      ),
    },
    {
      label: "Monthly Calls",
      value: monthlyCalls.toLocaleString(),
      change: '',
      changeType: '',
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
    },
  ];

  function convertToCSV(data: Record<string, unknown>[]) {
    if (!data.length) return '';
    const keys = Object.keys(data[0]);
    const csvRows = [keys.join(',')];
    for (const row of data) {
      csvRows.push(keys.map(k => JSON.stringify(row[k] ?? '')).join(','));
    }
    return csvRows.join('\n');
  }

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const statusBadge = (status?: string) => {
    switch (status) {
      case "Lead":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "Converted":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "Pending":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
    }
  };

  const handleLogout = () => {
    void frappeApi.logout().then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col text-gray-900 dark:text-white">
      {/* Top navbar */}
      <header className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-8 sticky top-0 z-10 shadow-sm gap-2 sm:gap-0">
        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-tight drop-shadow mb-2 sm:mb-0">CYOAI Dashboard</span>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input type="text" placeholder="Search..." className="flex-1 sm:w-auto rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800" />
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition relative"
            title="Notifications"
            onClick={() => setShowNotifications(v => !v)}
          >
            <span className="material-icons text-gray-400 dark:text-gray-300">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </button>
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <span className="material-icons text-yellow-400">light_mode</span>
            ) : (
              <span className="material-icons text-gray-800">dark_mode</span>
            )}
          </button>
          <div
            className="w-9 h-9 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
            title="User Profile"
            onClick={() => setShowProfileModal(true)}
          >
            <span className="material-icons text-blue-600 dark:text-blue-300">account_circle</span>
          </div>
          <span className="hidden sm:inline text-base text-gray-700 dark:text-gray-200 font-semibold">{userEmail}</span>
          <button
            className="ml-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-100 dark:hover:bg-gray-600 border border-blue-100 dark:border-gray-600 transition"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </header>
      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setShowProfileModal(false)}
              title="Close"
            >
              ×
            </button>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                {userEmail ? userEmail[0].toUpperCase() : '?'}
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{userEmail}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Role: {userRole || 'User'}</div>
              <div className="mt-4 w-full">
                <button className="btn-secondary w-full" disabled title="Edit profile coming soon!">Edit Profile (Coming Soon)</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main section: Metrics cards, charts, and call log table */}
      <main className="flex-1 w-full mx-0 p-0">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 pt-4 sm:pt-8">
          {/* Admin-only features */}
          {userRole === 'Admin' && (
            <div className="mb-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <button
                className="btn-primary"
                title="Export call logs (Admin only)"
                onClick={() => downloadCSV(convertToCSV(filteredLogs), `call_logs_${new Date().toISOString().slice(0,10)}.csv`)}
              >
                Export Logs (CSV)
              </button>
              <button
                className="btn-secondary"
                title="Share call logs via email (Admin only)"
                onClick={() => { setShowEmailModal(true); setEmailStatus('idle'); setEmail(''); }}
              >
                Share via Email
              </button>
            </div>
          )}
          {/* Email Share Modal */}
          {showEmailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowEmailModal(false)}
                  title="Close"
                >
                  ×
                </button>
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Share Call Logs via Email</h3>
                {emailStatus === 'success' ? (
                  <div className="text-green-600 dark:text-green-400 text-center py-4">Email sent successfully!</div>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setEmailStatus('sending');
                      setTimeout(() => setEmailStatus('success'), 1200); // Simulate API call
                    }}
                    className="flex flex-col gap-4"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Recipient's email"
                      className="input-field"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={emailStatus === 'sending'}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={emailStatus === 'sending'}
                    >
                      {emailStatus === 'sending' ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
          {/* Live Chart */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 mb-8 animate-pulse h-64">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-40 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <LiveChart callLogs={filteredLogs} loading={isLoading} />
          )}
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))
              : metrics.map((metric, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex items-center gap-4 hover:shadow-lg transition cursor-pointer" title={metric.label}>
                    <div className="flex-shrink-0">{metric.icon}</div>
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-300 text-sm font-medium mb-1">{metric.label}</div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{metric.value}</div>
                    </div>
                    <div className={`text-xs font-semibold ${metric.changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>{metric.change}</div>
                  </div>
                ))}
          </div>
          {/* Charts and analytics cards */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 mb-8">
            {/* Weekly Calls Bar Chart */}
            {isLoading ? (
              <div className="col-span-12 xl:col-span-7 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex flex-col animate-pulse">
                <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
                <div className="flex justify-between mt-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-3 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-12 xl:col-span-7 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex flex-col">
                <div className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Weekly Calls</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklyCalls} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="day" tick={{ fill: theme === 'dark' ? '#d1d5db' : '#374151', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: theme === 'dark' ? '#d1d5db' : '#374151', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Monthly Target Card with Circular Progress */}
            {isLoading ? (
              <div className="col-span-12 xl:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex flex-col items-center justify-center animate-pulse">
                <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-32 w-32 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="flex justify-between w-full mt-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-12 xl:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex flex-col items-center justify-center">
                <div className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Monthly Target</div>
                <svg className="w-32 h-32 mb-4" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="339.292" strokeDashoffset="83" strokeLinecap="round" />
                  <text x="50%" y="54%" textAnchor="middle" className="text-2xl font-bold fill-blue-600" dominantBaseline="middle">75.55%</text>
                </svg>
                <div className="text-center text-gray-500 dark:text-gray-300 text-sm">You earn $3287 today, it's higher than last month. Keep up your good work!</div>
                <div className="flex justify-between w-full mt-4 text-xs text-gray-400 dark:text-gray-300">
                  <div>
                    <div className="font-bold text-gray-700 dark:text-gray-200">Target</div>
                    <div>$20K</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-700 dark:text-gray-200">Revenue</div>
                    <div>$20K</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-700 dark:text-gray-200">Today</div>
                    <div>$20K</div>
                  </div>
                </div>
              </div>
            )}
            {/* Statistics Area Chart */}
            {isLoading ? (
              <div className="col-span-12 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex flex-col mt-2 animate-pulse">
                <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 rounded"></div>
                <div className="flex gap-2 mt-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-12 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 flex flex-col mt-2">
                <div className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Statistics</div>
                {/* Simple SVG Area Chart Placeholder */}
                <svg viewBox="0 0 400 100" className="w-full h-32">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline fill="url(#areaGradient)" stroke="#3b82f6" strokeWidth="3" points="0,80 30,60 60,65 90,40 120,50 150,30 180,40 210,20 240,30 270,10 300,20 330,10 360,20 400,10 400,100 0,100" />
                </svg>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-1 rounded-lg bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 dark:hover:bg-gray-600 transition" title="Monthly view">Monthly</button>
                  <button className="px-4 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="Quarterly view">Quarterly</button>
                  <button className="px-4 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="Annual view">Annually</button>
                </div>
              </div>
            )}
          </div>
          {/* Call Log Table */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
            <input
              type="text"
              placeholder="Search by name, phone, or intent..."
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              onChange={handleSearch}
              defaultValue={search}
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
              <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({...r, from: e.target.value}))} className="rounded border px-2 py-1 text-xs" />
              <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
              <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({...r, to: e.target.value}))} className="rounded border px-2 py-1 text-xs" />
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900">
              <option value="All">All Statuses</option>
              <option value="Lead">Lead</option>
              <option value="Converted">Converted</option>
              <option value="Pending">Pending</option>
            </select>
            <button onClick={() => { setSearch(""); setStatus("All"); setDateRange({from: new Date(Date.now()-6*86400000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10)}); }} className="text-xs px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Clear Filters</button>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Showing {filterLoading ? '...' : filteredLogs.length} results</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 w-full overflow-x-auto">
            <div className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Call Logs</div>
            {filterLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-300 animate-pulse">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">No call logs found. New calls will appear here in real time.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-300 text-xs uppercase bg-gray-50 dark:bg-gray-900">
                    <th className="px-4 py-2 font-semibold">Caller Name</th>
                    <th className="px-4 py-2 font-semibold">Phone Number</th>
                    <th className="px-4 py-2 font-semibold">Intent</th>
                    <th className="px-4 py-2 font-semibold">Summary</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.name} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer">
                      <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{log.caller_name ?? 'Unknown'}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{log.phone_number ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{log.intent ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{log.summary ?? 'N/A'}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(log.status)}`}>{log.status ?? 'Unknown'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      {/* Analytics Section */}
      <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 pb-8">
        <h2 className="text-xl font-bold mb-4 mt-8">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Daily Call Volume Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col">
            <div className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Daily Call Volume</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dailyVolume} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#d1d5db' : '#374151', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: theme === 'dark' ? '#d1d5db' : '#374151', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Intent Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col">
            <div className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Intent Distribution</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={intentDist} dataKey="value" nameKey="intent" cx="50%" cy="50%" outerRadius={60} label>
                  {intentDist.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Conversion Funnel Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col">
            <div className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Conversion Funnel</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="stage" tick={{ fill: theme === 'dark' ? '#d1d5db' : '#374151', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: theme === 'dark' ? '#d1d5db' : '#374151', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-14 sm:mt-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-100">Notifications</div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <li className="p-4 text-gray-400 dark:text-gray-500 text-center">No notifications</li>
            ) : notifications.map(n => (
              <li
                key={n.id}
                className={`flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${n.read ? '' : 'bg-blue-50 dark:bg-gray-700/40'}`}
                onClick={() => setNotifications(notifications.map(x => x.id === n.id ? { ...x, read: true } : x))}
              >
                <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></span>
                <span className="flex-1 text-gray-700 dark:text-gray-200">{n.text}</span>
                <span className="text-xs text-gray-400 dark:text-gray-400">{n.time}</span>
              </li>
            ))}
          </ul>
          <button
            className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline rounded-b-xl bg-gray-50 dark:bg-gray-900"
            onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
