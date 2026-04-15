// 👉 這份檔案就是你要上傳到 GitHub 的「完整版（像食材小管家一樣）」
// 📁 專案結構：
// fin-app/
// ├── index.html
// ├── package.json
// ├── vite.config.js
// └── src/
//     ├── main.jsx
//     └── App.jsx

// ========================
// 📄 index.html
// ========================

/*
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>記帳 App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
*/

// ========================
// 📄 package.json
// ========================

/*
{
  "name": "fin-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.511.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.10"
  }
}
*/

// ========================
// 📄 vite.config.js
// ========================

/*
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
*/

// ========================
// 📄 src/main.jsx
// ========================

/*
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/

// ========================
// 📄 src/App.jsx（iPhone 漂亮版，可部署）
// ========================

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, CalendarDays, Search } from "lucide-react";

const STORAGE_KEY = "tw-expense-tracker-v2";

const expenseCategories = ["餐飲", "交通", "購物", "娛樂", "生活", "寵物", "旅遊", "醫療", "其他"];
const incomeCategories = ["薪水", "獎金", "兼職", "投資", "退款", "其他"];

const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);

const formatCurrency = (value) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const cardStyle = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: 24,
};

export default function ExpenseTrackerApp() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    type: "expense",
    category: expenseCategories[0],
    amount: "",
    date: today(),
    note: "",
  });
  const [monthFilter, setMonthFilter] = useState(currentMonth());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {
        setRecords([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: prev.type === "expense" ? expenseCategories[0] : incomeCategories[0],
    }));
  }, [form.type]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const sameMonth = monthFilter ? item.date.startsWith(monthFilter) : true;
      const keyword = `${item.category} ${item.note}`.toLowerCase();
      const matchesSearch = keyword.includes(search.toLowerCase());
      return sameMonth && matchesSearch;
    });
  }, [records, monthFilter, search]);

  const income = filteredRecords
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const expense = filteredRecords
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const balance = income - expense;

  const expenseByCategory = useMemo(() => {
    const map = {};
    filteredRecords
      .filter((r) => r.type === "expense")
      .forEach((r) => {
        map[r.category] = (map[r.category] || 0) + Number(r.amount);
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  const addRecord = () => {
    if (!form.amount || Number(form.amount) <= 0) return;

    const newRecord = {
      ...form,
      id: Date.now(),
      amount: Number(form.amount),
      note: form.note.trim(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setForm({
      type: "expense",
      category: expenseCategories[0],
      amount: "",
      date: today(),
      note: "",
    });
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const categories = form.type === "expense" ? expenseCategories : incomeCategories;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #fdf2f8 100%)",
        padding: "24px 14px 40px",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: 430, margin: "0 auto" }}>
        <div
          style={{
            ...cardStyle,
            padding: 22,
            marginBottom: 16,
            background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(79,70,229,0.92))",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 18px 40px rgba(79,70,229,0.22)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>我的記帳</div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{formatCurrency(balance)}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.82 }}>本月結餘</div>
            </div>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                background: "rgba(255,255,255,0.14)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Wallet size={22} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
            <MiniStat
              icon={<TrendingUp size={16} />}
              label="收入"
              value={formatCurrency(income)}
              bg="rgba(16,185,129,0.18)"
            />
            <MiniStat
              icon={<TrendingDown size={16} />}
              label="支出"
              value={formatCurrency(expense)}
              bg="rgba(244,63,94,0.18)"
            />
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>新增紀錄</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <button
              onClick={() => setForm((prev) => ({ ...prev, type: "expense" }))}
              style={segmentedButton(form.type === "expense")}
            >
              支出
            </button>
            <button
              onClick={() => setForm((prev) => ({ ...prev, type: "income" }))}
              style={segmentedButton(form.type === "income")}
            >
              收入
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              style={inputStyle}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="輸入金額"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              style={inputStyle}
            />

            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              style={inputStyle}
            />

            <input
              placeholder="備註，例如午餐、房租、薪水"
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              style={inputStyle}
            />

            <button onClick={addRecord} style={primaryButtonStyle}>
              <Plus size={18} />
              新增紀錄
            </button>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CalendarDays size={18} />
            <div style={{ fontSize: 18, fontWeight: 800 }}>本月篩選</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={inputStyle}
            />

            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: 14, color: "#64748b" }} />
              <input
                placeholder="搜尋分類或備註"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 38 }}
              />
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>支出排行</div>
          {expenseByCategory.length === 0 ? (
            <EmptyText text="本月還沒有支出資料" />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {expenseByCategory.map((item, index) => {
                const maxValue = expenseByCategory[0]?.value || 1;
                const width = `${Math.max((item.value / maxValue) * 100, 8)}%`;
                return (
                  <div key={item.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                      <span style={{ color: "#334155", fontWeight: 700 }}>{index + 1}. {item.name}</span>
                      <span style={{ color: "#64748b" }}>{formatCurrency(item.value)}</span>
                    </div>
                    <div style={{ height: 10, background: "#eef2ff", borderRadius: 999 }}>
                      <div
                        style={{
                          width,
                          height: "100%",
                          borderRadius: 999,
                          background: "linear-gradient(90deg, #818cf8, #ec4899)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>收支明細</div>
          {filteredRecords.length === 0 ? (
            <EmptyText text="目前沒有符合條件的紀錄" />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredRecords
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 20,
                      padding: 14,
                      background: "rgba(255,255,255,0.75)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={typeBadge(item.type)}>{item.type === "income" ? "收入" : "支出"}</span>
                        <span style={{ fontWeight: 800, color: "#0f172a" }}>{item.category}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{item.note || "無備註"}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.date}</div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 16,
                          color: item.type === "income" ? "#059669" : "#e11d48",
                          marginBottom: 8,
                        }}
                      >
                        {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                      </div>
                      <button onClick={() => deleteRecord(item.id)} style={deleteButtonStyle}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, bg }) {
  return (
    <div
      style={{
        borderRadius: 18,
        background: bg,
        padding: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: 0.88, marginBottom: 6 }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{value}</div>
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <div
      style={{
        padding: "18px 14px",
        textAlign: "center",
        color: "#64748b",
        background: "#f8fafc",
        borderRadius: 18,
        border: "1px dashed #cbd5e1",
      }}
    >
      {text}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 16,
  border: "1px solid #dbe3f0",
  background: "#fff",
  fontSize: 15,
  outline: "none",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: 18,
  padding: "14px 16px",
  background: "linear-gradient(135deg, #4f46e5, #ec4899)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: "0 14px 26px rgba(99,102,241,0.28)",
};

const deleteButtonStyle = {
  border: "none",
  background: "#f8fafc",
  color: "#475569",
  width: 34,
  height: 34,
  borderRadius: 12,
  cursor: "pointer",
};

const segmentedButton = (active) => ({
  padding: "12px 14px",
  borderRadius: 16,
  border: active ? "1px solid transparent" : "1px solid #e2e8f0",
  background: active ? "linear-gradient(135deg, #111827, #334155)" : "#fff",
  color: active ? "#fff" : "#334155",
  fontWeight: 800,
  cursor: "pointer",
});

const typeBadge = (type) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  color: type === "income" ? "#047857" : "#be123c",
  background: type === "income" ? "#d1fae5" : "#ffe4e6",
});
