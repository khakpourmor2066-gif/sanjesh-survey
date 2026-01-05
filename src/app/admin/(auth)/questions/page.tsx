"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: Record<string, string>;
  type: "rating" | "text" | "yes_no";
  category: "general" | "employee_specific" | "feedback" | "service" | "additional";
  required: boolean;
  isPrimary: boolean;
  order: number;
  active: boolean;
};

type FormQuestion = {
  text: Record<string, string>;
  type: Question["type"];
  category: Question["category"];
  required: boolean;
  isPrimary: boolean;
  order: number;
};

const emptyQuestion: FormQuestion = {
  text: { fa: "", en: "", ar: "" },
  type: "rating",
  category: "general",
  required: true,
  isPrimary: false,
  order: 1,
};

export default function QuestionsAdmin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<FormQuestion>(emptyQuestion);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/questions");
    if (res.ok) {
      const data = (await res.json()) as { questions: Question[] };
      setQuestions(data.questions);
    }
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => null);
  }, []);

  const canSubmit = form.text.fa.trim().length > 0;

  const addQuestion = async () => {
    setMessage("");
    const primaryCount = questions.filter((question) => question.isPrimary).length;
    if (form.isPrimary && primaryCount >= 5) {
      setMessage("حداکثر ۵ سوال اصلی مجاز است.");
      return;
    }
    const response = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: form.text,
        type: form.type,
        category: form.category,
        required: form.required,
        isPrimary: form.isPrimary,
        order: form.order,
      }),
    });
    if (response.ok) {
      setMessage("سوال جدید اضافه شد.");
      setForm({ ...emptyQuestion, order: form.order + 1 });
      load().catch(() => null);
    } else {
      setMessage("خطا در ثبت سوال.");
    }
  };

  const updateQuestion = async (question: Question) => {
    const primaryCount = questions.filter((item) => item.isPrimary).length;
    if (question.isPrimary && primaryCount > 5) {
      setMessage("حداکثر ۵ سوال اصلی مجاز است.");
      return;
    }
    const response = await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: question.id,
        updates: {
          text: question.text,
          type: question.type,
          category: question.category,
          required: question.required,
          isPrimary: question.isPrimary,
          order: question.order,
          active: question.active,
        },
      }),
    });
    if (response.ok) {
      setMessage("تغییرات ذخیره شد.");
      load().catch(() => null);
    } else {
      setMessage("خطا در ذخیره تغییرات.");
    }
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="rounded-3xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">مدیریت سوالات</h1>
        <p className="mt-2 text-sm text-slate-500">
          ساخت و تنظیم سوالات پویا برای نظرسنجی.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            value={form.text.fa}
            onChange={(event) =>
              setForm({ ...form, text: { ...form.text, fa: event.target.value } })
            }
            placeholder="متن فارسی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.text.en}
            onChange={(event) =>
              setForm({ ...form, text: { ...form.text, en: event.target.value } })
            }
            placeholder="متن انگلیسی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            value={form.text.ar}
            onChange={(event) =>
              setForm({ ...form, text: { ...form.text, ar: event.target.value } })
            }
            placeholder="متن عربی"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <select
            value={form.type}
            onChange={(event) =>
              setForm({ ...form, type: event.target.value as Question["type"] })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="rating">امتیازدهی 1-10</option>
            <option value="text">پاسخ متنی</option>
            <option value="yes_no">بله/خیر</option>
          </select>
          <select
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category: event.target.value as Question["category"],
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="general">عمومی</option>
            <option value="employee_specific">کارمند</option>
            <option value="feedback">بازخورد</option>
            <option value="service">خدمت</option>
            <option value="additional">تکمیلی</option>
          </select>
          <input
            type="number"
            value={form.order}
            onChange={(event) =>
              setForm({ ...form, order: Number(event.target.value) })
            }
            placeholder="ترتیب نمایش"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(event) =>
                setForm({ ...form, required: event.target.checked })
              }
            />
            اجباری
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(event) =>
                setForm({ ...form, isPrimary: event.target.checked })
              }
            />
            سوال اصلی
          </label>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          disabled={!canSubmit}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          افزودن سوال
        </button>
        {message ? (
          <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>
        ) : null}
      </div>

      <div className="rounded-3xl bg-white p-8 shadow">
        <h2 className="text-xl font-semibold">لیست سوالات</h2>
        <div className="mt-6 grid gap-6">
          {loading ? (
            <p className="text-sm text-slate-500">در حال بارگذاری...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-slate-500">
              هنوز سوالی ثبت نشده است.
            </p>
          ) : (
            questions.map((question) => (
            <div
              key={question.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">{question.id}</p>
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={question.active}
                    onChange={(event) => {
                      setQuestions((prev) =>
                        prev.map((item) =>
                          item.id === question.id
                            ? { ...item, active: event.target.checked }
                            : item
                        )
                      );
                    }}
                  />
                  فعال
                </label>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  value={question.text.fa ?? ""}
                  onChange={(event) => {
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === question.id
                          ? {
                              ...item,
                              text: { ...item.text, fa: event.target.value },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="متن فارسی"
                />
                <input
                  value={question.text.en ?? ""}
                  onChange={(event) => {
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === question.id
                          ? {
                              ...item,
                              text: { ...item.text, en: event.target.value },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="متن انگلیسی"
                />
                <input
                  value={question.text.ar ?? ""}
                  onChange={(event) => {
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === question.id
                          ? {
                              ...item,
                              text: { ...item.text, ar: event.target.value },
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="متن عربی"
                />
                <select
                  value={question.type}
                  onChange={(event) => {
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === question.id
                          ? {
                              ...item,
                              type: event.target.value as Question["type"],
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  <option value="rating">امتیازدهی 1-10</option>
                  <option value="text">پاسخ متنی</option>
                  <option value="yes_no">بله/خیر</option>
                </select>
                <select
                  value={question.category}
                  onChange={(event) => {
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === question.id
                          ? {
                              ...item,
                              category: event.target.value as Question["category"],
                            }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  <option value="general">عمومی</option>
                  <option value="employee_specific">کارمند</option>
                  <option value="feedback">بازخورد</option>
                  <option value="service">خدمت</option>
                  <option value="additional">تکمیلی</option>
                </select>
                <input
                  type="number"
                  value={question.order}
                  onChange={(event) => {
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === question.id
                          ? { ...item, order: Number(event.target.value) }
                          : item
                      )
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  placeholder="ترتیب"
                />
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(event) => {
                      setQuestions((prev) =>
                        prev.map((item) =>
                          item.id === question.id
                            ? { ...item, required: event.target.checked }
                            : item
                        )
                      );
                    }}
                  />
                  اجباری
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={question.isPrimary}
                    onChange={(event) => {
                      setQuestions((prev) =>
                        prev.map((item) =>
                          item.id === question.id
                            ? { ...item, isPrimary: event.target.checked }
                            : item
                        )
                      );
                    }}
                  />
                  اصلی
                </label>
              </div>
              <button
                type="button"
                onClick={() => updateQuestion(question)}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                ذخیره تغییرات
              </button>
            </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
