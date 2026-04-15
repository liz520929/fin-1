import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Wallet, TrendingUp, TrendingDown, Search, Download, Upload } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

const DEFAULT_CATEGORIES = {
  expense: ["餐飲", "交通", "購物", "娛樂", "居家", "醫療", "寵物", "旅遊", "學習", "其他"],
  income: ["薪水", "獎金", "兼職", "投資", "退款", "其他"],
};

const STORAGE_KEY = "tw-expense-tracker-v1";

const formatCurrency = (value) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const today = () => new Date().toISOString().slice(0, 10);

const seedData = [
  { id: crypto.randomUUID(), type: "income", category: "薪水", amount: 42000, date: today(), note: "本月薪資" },
  { id: crypto.randomUUID(), type: "expense", category: "餐飲", amount: 180, date: today(), note: "午餐" },
  { id: crypto.randomUUID(), type: "expense", category: "交通", amount: 35, date: today(), note: "捷運" },
  { id: crypto.randomUUID(), type: "expense", category: "寵物", amount: 620, date: today(), note: "狗狗零食" },
];

const pieColors = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#4b5563", "#1f2937", "#e5e7eb"];

export default function ExpenseTrackerApp() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: "expense",
    category: "餐飲",
    amount: "",
    date: today(),
    note: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecords(JSON.parse(saved));
      } else {
        setRecords(seedData);
      }
    } catch {
      setRecords(seedData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    const nextCategory = DEFAULT_CATEGORIES[form.type][0];
    setForm((prev) => ({ ...prev, category: nextCategory }));
  }, [form.type]);

  const filteredRecords = useMemo(() => {
    return [...records]
      .filter((item) => {
        const matchSearch = `${item.category} ${item.note}`.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" ? true : item.type === typeFilter;
        const matchMonth = monthFilter ? item.date.startsWith(monthFilter) : true;
        return matchSearch && matchType && matchMonth;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, search, typeFilter, monthFilter]);

  const summary = useMemo(() => {
    const income = filteredRecords.filter((r) => r.type === "income").reduce((sum, r) => sum + Number(r.amount), 0);
    const expense = filteredRecords.filter((r) => r.type === "expense").reduce((sum, r) => sum + Number(r.amount), 0);
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredRecords]);

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    filteredRecords
      .filter((r) => r.type === "expense")
      .forEach((r) => map.set(r.category, (map.get(r.category) || 0) + Number(r.amount)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  const dailyFlow = useMemo(() => {
    const map = new Map();
    filteredRecords.forEach((r) => {
      if (!map.has(r.date)) map.set(r.date, { date: r.date, income: 0, expense: 0 });
      map.get(r.date)[r.type] += Number(r.amount);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords]);

  const addRecord = () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    const newRecord = {
      id: crypto.randomUUID(),
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      note: form.note.trim(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    setForm({
      type: "expense",
      category: "餐飲",
      amount: "",
      date: today(),
      note: "",
    });
    setDialogOpen(false);
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "記帳資料.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) setRecords(data);
      } catch {
        alert("匯入失敗，請確認 JSON 格式正確");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">記帳 App</h1>
              <p className="mt-1 text-sm text-slate-500">管理每日收支、查看分類比例、快速掌握本月結餘。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" /> 匯出
              </Button>
              <label className="inline-flex cursor-pointer items-center rounded-2xl border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50">
                <Upload className="mr-2 h-4 w-4" /> 匯入
                <input type="file" accept="application/json" className="hidden" onChange={importData} />
              </label>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl">
                    <Plus className="mr-2 h-4 w-4" /> 新增紀錄
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>新增一筆收支</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 pt-2">
                    <div className="grid gap-2">
                      <Label>類型</Label>
                      <Tabs value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
                        <TabsList className="grid w-full grid-cols-2 rounded-2xl">
                          <TabsTrigger value="expense" className="rounded-2xl">支出</TabsTrigger>
                          <TabsTrigger value="income" className="rounded-2xl">收入</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="grid gap-2">
                      <Label>分類</Label>
                      <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="請選擇分類" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_CATEGORIES[form.type].map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>金額</Label>
                      <Input
                        type="number"
                        placeholder="請輸入金額"
                        className="rounded-2xl"
                        value={form.amount}
                        onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>日期</Label>
                      <Input
                        type="date"
                        className="rounded-2xl"
                        value={form.date}
                        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>備註</Label>
                      <Input
                        placeholder="例如：早餐、房租、薪水"
                        className="rounded-2xl"
                        value={form.note}
                        onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      />
                    </div>

                    <Button className="mt-2 rounded-2xl" onClick={addRecord}>儲存紀錄</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <StatCard title="本月收入" value={formatCurrency(summary.income)} icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard title="本月支出" value={formatCurrency(summary.expense)} icon={<TrendingDown className="h-5 w-5" />} />
            <StatCard title="本月結餘" value={formatCurrency(summary.balance)} icon={<Wallet className="h-5 w-5" />} />
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>收支明細</CardTitle>
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="搜尋分類或備註"
                      className="w-full rounded-2xl pl-9 md:w-56"
                    />
                  </div>
                  <Input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="rounded-2xl md:w-40"
                  />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="rounded-2xl md:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="income">收入</SelectItem>
                      <SelectItem value="expense">支出</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRecords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">目前沒有符合條件的紀錄</div>
                ) : (
                  filteredRecords.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-2xl border bg-white p-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {item.type === "income" ? "收入" : "支出"}
                          </span>
                          <span className="text-sm font-medium text-slate-800">{item.category}</span>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500">{item.note || "無備註"}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.date}</p>
                      </div>
                      <div className="ml-4 flex items-center gap-3">
                        <div className={`text-right text-base font-semibold ${item.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                          {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => deleteRecord(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle>支出分類占比</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {expenseByCategory.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed text-slate-500">沒有支出資料</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {expenseByCategory.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                      <span className="flex-1 truncate">{item.name}</span>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle>每日收支</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {dailyFlow.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed text-slate-500">沒有統計資料</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyFlow}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="income" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="expense" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
