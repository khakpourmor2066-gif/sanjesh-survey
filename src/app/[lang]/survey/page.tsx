"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDictionary, type Lang } from "@/lib/i18n";
import type { Employee, SurveyQuestion, SurveyResponse } from "@/lib/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type AnswerState = Record<
  string,
  { score: number | null; comment: string; textValue: string; yesNoValue?: boolean }
>;

export default function SurveyPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = use(params);
  const t = getDictionary(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editToken = searchParams.get("editToken") ?? undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalComment, setFinalComment] = useState("");
  const [localError, setLocalError] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isOnline, setIsOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const completedRef = useRef(false);
  const commentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSteps = questions.length + 1;
  const allowEdit = response?.status === "completed";
  const isFinalStep = currentIndex === questions.length;
  const answeredCount = questions.filter((question) => {
    const current = answers[question.id];
    if (!current) return false;
    if (question.type === "rating") return Boolean(current.score);
    if (question.type === "text") return Boolean(current.textValue?.trim());
    return current.yesNoValue !== undefined;
  }).length;

  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [currentIndex, questions]
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch("/api/survey/questions");
      if (!res.ok) {
        throw new Error("questions");
      }
      const data = (await res.json()) as { questions: SurveyQuestion[] };
      setQuestions(data.questions);
    };

    const fetchSession = async () => {
      try {
        await fetchQuestions();
        const response = await fetch(
          `/api/survey/session${editToken ? `?editToken=${editToken}` : ""}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error("session");
        }
        const data = (await response.json()) as {
          response: SurveyResponse;
          employee?: Employee;
        };
        setResponse(data.response);
        setEmployee(data.employee ?? null);
        setCurrentIndex(data.response.lastQuestionIndex ?? 0);
        setFinalComment(data.response.finalComment ?? "");
        if (editToken || (data.response.lastQuestionIndex ?? 0) > 0) {
          setShowLanding(false);
        }
        const mapped: AnswerState = {};
        data.response.answers.forEach((answer) => {
          mapped[answer.questionId] = {
            score: answer.score ?? null,
            comment: answer.comment ?? "",
            textValue: answer.textValue ?? "",
            yesNoValue: answer.yesNoValue,
          };
        });
        setAnswers(mapped);
      } catch {
        setError(t.problem);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [editToken, t.problem]);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      if (completedRef.current) return;
      fetch("/api/survey/abandon", {
        method: "POST",
        keepalive: true,
        credentials: "include",
      }).catch(() => null);
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  const saveAnswer = async (
    questionId: string,
    payload: {
      score?: number | null;
      comment?: string;
      textValue?: string;
      yesNoValue?: boolean;
    }
  ) => {
    if (!isOnline) {
      setSaveStatus("error");
      return false;
    }
    setSaveStatus("saving");
    const res = await fetch("/api/survey/answer", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId,
        score: payload.score,
        comment: payload.comment,
        textValue: payload.textValue,
        yesNoValue: payload.yesNoValue,
        allowEdit,
      }),
    });
    setSaveStatus(res.ok ? "saved" : "error");
    return res.ok;
  };

  const saveProgress = async (index: number) => {
    if (!isOnline) {
      setSaveStatus("error");
      return;
    }
    const res = await fetch("/api/survey/progress", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
    setSaveStatus(res.ok ? "saved" : "error");
  };

  const handleScore = async (score: number) => {
    if (!currentQuestion) return;
    setLocalError("");
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        score,
        comment: prev[currentQuestion.id]?.comment ?? "",
        textValue: prev[currentQuestion.id]?.textValue ?? "",
        yesNoValue: prev[currentQuestion.id]?.yesNoValue,
      },
    }));
    const saved = await saveAnswer(currentQuestion.id, { score });
    if (saved) {
      await goToStep(Math.min(currentIndex + 1, totalSteps - 1));
    }
  };

  const handleComment = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        score: prev[currentQuestion.id]?.score ?? null,
        comment: value,
        textValue: prev[currentQuestion.id]?.textValue ?? "",
        yesNoValue: prev[currentQuestion.id]?.yesNoValue,
      },
    }));

    if (commentTimer.current) {
      clearTimeout(commentTimer.current);
    }
    commentTimer.current = setTimeout(() => {
      saveAnswer(currentQuestion.id, { comment: value }).catch(() => null);
    }, 500);
  };

  const handleTextValue = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        score: prev[currentQuestion.id]?.score ?? null,
        comment: prev[currentQuestion.id]?.comment ?? "",
        textValue: value,
        yesNoValue: prev[currentQuestion.id]?.yesNoValue,
      },
    }));
    if (commentTimer.current) {
      clearTimeout(commentTimer.current);
    }
    commentTimer.current = setTimeout(() => {
      saveAnswer(currentQuestion.id, { textValue: value }).catch(() => null);
    }, 500);
  };

  const handleYesNo = async (value: boolean) => {
    if (!currentQuestion) return;
    setLocalError("");
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        score: prev[currentQuestion.id]?.score ?? null,
        comment: prev[currentQuestion.id]?.comment ?? "",
        textValue: prev[currentQuestion.id]?.textValue ?? "",
        yesNoValue: value,
      },
    }));
    const saved = await saveAnswer(currentQuestion.id, { yesNoValue: value });
    if (saved) {
      await goToStep(Math.min(currentIndex + 1, totalSteps - 1));
    }
  };

  const goToStep = async (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    await saveProgress(nextIndex);
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    const currentAnswer = answers[currentQuestion.id];
    const missingRequired =
      currentQuestion.required &&
      (currentQuestion.type === "rating"
        ? !currentAnswer?.score
        : currentQuestion.type === "text"
          ? !currentAnswer?.textValue?.trim()
          : currentAnswer?.yesNoValue === undefined);

    if (missingRequired) {
      setLocalError(t.pleaseAnswerRequired);
      return;
    }
    await goToStep(Math.min(currentIndex + 1, totalSteps - 1));
  };

  const handlePrev = async () => {
    await goToStep(Math.max(currentIndex - 1, 0));
  };

  const handleFinish = async () => {
    if (!isOnline) {
      setLocalError(t.offlineNotice);
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/survey/finish", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finalComment }),
    });
    if (res.ok) {
      completedRef.current = true;
      const data = (await res.json()) as { editToken: string };
      router.push(`/${lang}/thank-you?editToken=${data.editToken}`);
    } else {
      setLocalError(t.problem);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
        <div className="mx-auto max-w-3xl text-center text-sm text-[var(--muted)]">
          {t.redirecting}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
        <div className="mx-auto max-w-3xl text-center text-sm text-rose-600">
          {error}
        </div>
      </main>
    );
  }

  const employeeName =
    employee?.name?.[lang] ??
    employee?.name?.fa ??
    employee?.name?.en ??
    response?.employeeId ??
    "";
  const departmentName =
    employee?.department?.[lang] ??
    employee?.department?.fa ??
    employee?.department?.en ??
    "";

  if (showLanding) {
    return (
      <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 text-center">
          <div className="surface w-full rounded-[28px] p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              {t.welcome}
            </p>
            <h1 className="mt-4 text-3xl font-semibold">{t.surveyTitle}</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {t.selectLanguage}
            </p>
            <div className="mt-4 flex justify-center">
              <LanguageSwitcher lang={lang} />
            </div>
            {employeeName ? (
              <div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">
                  {t.evaluating}:
                </span>{" "}
                {employeeName}
                {departmentName ? ` • ${t.department}: ${departmentName}` : ""}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setShowLanding(false)}
              className="mt-6 rounded-full bg-[var(--accent-strong)] px-8 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              {t.startSurvey}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6">
        <div className="surface sticky top-4 z-10 rounded-[24px] p-5 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
              {t.progress}
            </div>
            <div className="text-xs text-[var(--muted)]">
              {t.evaluating}: {employeeName}
              {departmentName ? ` • ${t.department}: ${departmentName}` : ""}
            </div>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{
                width: `${((currentIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="surface flex-1 rounded-[28px] p-6 sm:p-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              <span>{t.question}</span>
              <span>
                {Math.min(currentIndex + 1, totalSteps)} {t.of} {totalSteps}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {currentQuestion?.required ? t.required : t.optional}
            </p>
            {!isOnline ? (
              <p className="text-xs text-rose-600">{t.offlineNotice}</p>
            ) : null}
          </div>

          {!isFinalStep && currentQuestion ? (
            <div className="mt-8 grid gap-6">
              <h2 className="text-2xl font-semibold">
                {currentQuestion.text[lang]}
              </h2>
              {currentQuestion.type === "rating" ? (
                <>
                  <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                    {Array.from({ length: 10 }, (_, idx) => idx + 1).map(
                      (value) => {
                        const selected =
                          answers[currentQuestion.id]?.score === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleScore(value)}
                            className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition ${
                              selected
                                ? "glow-ring border-transparent bg-[var(--accent-strong)] text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-900"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{t.poor}</span>
                    <span>{t.excellent}</span>
                  </div>
                  <textarea
                    value={answers[currentQuestion.id]?.comment ?? ""}
                    onChange={(event) => handleComment(event.target.value)}
                    placeholder={t.commentPlaceholder}
                    className="min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </>
              ) : null}

              {currentQuestion.type === "text" ? (
                <textarea
                  value={answers[currentQuestion.id]?.textValue ?? ""}
                  onChange={(event) => handleTextValue(event.target.value)}
                  placeholder={t.writeHere}
                  className="min-h-[160px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              ) : null}

              {currentQuestion.type === "yes_no" ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => handleYesNo(true)}
                    className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${
                      answers[currentQuestion.id]?.yesNoValue === true
                        ? "glow-ring border-transparent bg-[var(--accent-strong)] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-900"
                    }`}
                  >
                    {t.yes}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleYesNo(false)}
                    className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${
                      answers[currentQuestion.id]?.yesNoValue === false
                        ? "glow-ring border-transparent bg-[var(--accent-strong)] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-900"
                    }`}
                  >
                    {t.no}
                  </button>
                </div>
              ) : null}
              {localError ? (
                <p className="text-sm font-medium text-rose-600">
                  {localError}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              <h2 className="text-2xl font-semibold">{t.finalNoteTitle}</h2>
              <p className="text-sm text-[var(--muted)]">{t.finalNoteText}</p>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span>{t.reviewAnswers}</span>
                  <span>
                    {t.answeredCount}: {answeredCount}/{questions.length}
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {questions.map((question, index) => {
                    const current = answers[question.id];
                    let answerLabel: string = t.notAnswered;
                    if (question.type === "rating" && current?.score) {
                      answerLabel = String(current.score);
                    } else if (question.type === "text" && current?.textValue) {
                      answerLabel = current.textValue;
                    } else if (question.type === "yes_no") {
                      if (current?.yesNoValue === true) answerLabel = t.yes;
                      if (current?.yesNoValue === false) answerLabel = t.no;
                    }
                    return (
                      <div
                        key={question.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[var(--ink)]">
                            {question.text[lang]}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentIndex(index);
                            }}
                            className="text-xs font-semibold text-[var(--accent-strong)]"
                          >
                            {t.edit}
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          {answerLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <textarea
                value={finalComment}
                onChange={(event) => setFinalComment(event.target.value)}
                placeholder={t.finalNoteText}
                className="min-h-[160px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
              {localError ? (
                <p className="text-sm font-medium text-rose-600">
                  {localError}
                </p>
              ) : null}
              {allowEdit ? (
                <p className="text-xs text-[var(--muted)]">{t.edit}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="surface sticky bottom-4 rounded-[24px] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.previous}
            </button>
            <div className="text-xs text-[var(--muted)]">
              {saveStatus === "saving"
                ? t.saving
                : saveStatus === "saved"
                  ? t.saved
                  : saveStatus === "error"
                    ? t.saveError
                    : ""}
            </div>
            {isFinalStep ? (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-70"
              >
                {submitting ? t.submitting : t.finish}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
              >
                {t.next}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
