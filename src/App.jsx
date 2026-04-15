import React, { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";

const STORAGE_KEY = "tw-expense-tracker-v1";

const formatCurrency = (value) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseTrackerApp() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    type: "expense",
    category: "餐飲",
    amount: "",
    date: today(),
    note: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecord = () => {
    if (!form.amount) return;
    setRecords([
      {
        ...form,
        id: Date.now(),
        amount: Number(form.amount),
      },
      ...records,
    ]);

    setForm({ type: "expense", category: "餐飲", amount: "", date: today(), note: "" });
  };

  const deleteRecord = (id) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const income = records.filter(r => r.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = records.filter(r => r.type === "expense").reduce((a, b) => a + b.amount, 0);

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h1>記帳 App</h1>

      <div style={{ marginBottom: 20 }}>
        <p>收入：{formatCurrency(income)}</p>
        <p>支出：{formatCurrency(expense)}</p>
        <p>結餘：{formatCurrency(income - expense)}</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="expense">支出</option>
          <option value="income">收入</option>
        </select>

        <input
          placeholder="分類"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
          type="number"
          placeholder="金額"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <input
          placeholder="備註"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <button onClick={addRecord}><Plus size={16}/> 新增</button>
      </div>

      <div>
        {records.map((r) => (
          <div key={r.id} style={{ borderBottom: "1px solid #ddd", padding: 10 }}>
            <p>{r.date} - {r.category}</p>
            <p>{r.note}</p>
            <p style={{ color: r.type === "income" ? "green" : "red" }}>
              {r.type === "income" ? "+" : "-"}{formatCurrency(r.amount)}
            </p>
            <button onClick={() => deleteRecord(r.id)}><Trash2 size={14}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
