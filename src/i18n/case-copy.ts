import type { SupportedLanguage, UrgencyLevel } from "@/domain/case";

export const LANGUAGE_OPTIONS: Array<{
  value: SupportedLanguage;
  label: string;
  nativeLabel: string;
}> = [
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "de", label: "German", nativeLabel: "Deutsch" },
  { value: "ar", label: "Arabic", nativeLabel: "العربية" },
];

interface ResultCopy {
  mockBadge: string;
  extractedFacts: string;
  issuingAuthority: string;
  documentType: string;
  letterDate: string;
  deadline: string;
  urgency: string;
  summary: string;
  deadlineAndUrgency: string;
  firstAction: string;
  authorityWants: string;
  documents: string;
  clarification: string;
  nextSteps: string;
  sources: string;
  limitation: string;
  whyWeAsk: string;
  routeUpdated: string;
  placeholderSource: string;
  sourceNotAccessed: string;
  supports: string;
  responsible: string;
  timing: string;
  required: string;
  dependsOnAnswer: string;
  stepStatus: Record<"ready" | "needs-answer" | "not-started", string>;
  urgencyLevel: Record<UrgencyLevel, string>;
}

export const RESULT_COPY: Record<SupportedLanguage, ResultCopy> = {
  en: {
    mockBadge: "Demo analysis",
    extractedFacts: "Extracted document facts",
    issuingAuthority: "Issuing authority",
    documentType: "Document type",
    letterDate: "Detected letter date",
    deadline: "Detected deadline",
    urgency: "Urgency",
    summary: "What this letter says",
    deadlineAndUrgency: "Deadline and urgency",
    firstAction: "Your first action",
    authorityWants: "What the authority wants",
    documents: "Documents to prepare",
    clarification: "One question before the route is final",
    nextSteps: "Your next steps",
    sources: "Official sources",
    limitation: "Important limitation",
    whyWeAsk: "Why this changes the route",
    routeUpdated: "Route updated for your answer",
    placeholderSource: "Placeholder — not verified",
    sourceNotAccessed: "Not accessed or verified yet",
    supports: "Intended to support",
    responsible: "Responsible",
    timing: "Timing",
    required: "Required",
    dependsOnAnswer: "Depends on your answer",
    stepStatus: {
      ready: "Ready",
      "needs-answer": "Needs your answer",
      "not-started": "Not started",
    },
    urgencyLevel: { low: "Low", medium: "Medium", high: "High" },
  },
  de: {
    mockBadge: "Demo-Analyse",
    extractedFacts: "Erkannte Dokumentdaten",
    issuingAuthority: "Ausstellende Behörde",
    documentType: "Dokumentart",
    letterDate: "Erkanntes Briefdatum",
    deadline: "Erkannte Frist",
    urgency: "Dringlichkeit",
    summary: "Was in diesem Schreiben steht",
    deadlineAndUrgency: "Frist und Dringlichkeit",
    firstAction: "Ihr erster Schritt",
    authorityWants: "Was die Behörde verlangt",
    documents: "Vorzubereitende Unterlagen",
    clarification: "Eine Frage, bevor der Weg feststeht",
    nextSteps: "Ihre nächsten Schritte",
    sources: "Offizielle Quellen",
    limitation: "Wichtige Einschränkung",
    whyWeAsk: "Warum diese Antwort den Weg verändert",
    routeUpdated: "Der Weg wurde an Ihre Antwort angepasst",
    placeholderSource: "Platzhalter — nicht verifiziert",
    sourceNotAccessed: "Noch nicht aufgerufen oder verifiziert",
    supports: "Soll später belegen",
    responsible: "Verantwortlich",
    timing: "Zeitpunkt",
    required: "Erforderlich",
    dependsOnAnswer: "Hängt von Ihrer Antwort ab",
    stepStatus: {
      ready: "Bereit",
      "needs-answer": "Antwort erforderlich",
      "not-started": "Nicht begonnen",
    },
    urgencyLevel: { low: "Niedrig", medium: "Mittel", high: "Hoch" },
  },
  ar: {
    mockBadge: "تحليل تجريبي",
    extractedFacts: "حقائق مستخرجة من المستند",
    issuingAuthority: "الجهة المُصدرة",
    documentType: "نوع المستند",
    letterDate: "تاريخ الخطاب المكتشف",
    deadline: "المهلة المكتشفة",
    urgency: "درجة الاستعجال",
    summary: "ماذا يقول هذا الخطاب",
    deadlineAndUrgency: "المهلة ودرجة الاستعجال",
    firstAction: "خطوتك الأولى",
    authorityWants: "ماذا تطلب الجهة",
    documents: "المستندات المطلوب تجهيزها",
    clarification: "سؤال واحد قبل تثبيت المسار",
    nextSteps: "خطواتك التالية",
    sources: "المصادر الرسمية",
    limitation: "تنبيه مهم",
    whyWeAsk: "لماذا تغيّر هذه الإجابة المسار",
    routeUpdated: "تم تحديث المسار وفق إجابتك",
    placeholderSource: "مصدر مؤقت — غير متحقق منه",
    sourceNotAccessed: "لم تتم زيارته أو التحقق منه بعد",
    supports: "مخصص لاحقًا لدعم",
    responsible: "المسؤول",
    timing: "التوقيت",
    required: "مطلوب",
    dependsOnAnswer: "يعتمد على إجابتك",
    stepStatus: {
      ready: "جاهز",
      "needs-answer": "يحتاج إلى إجابتك",
      "not-started": "لم يبدأ",
    },
    urgencyLevel: { low: "منخفضة", medium: "متوسطة", high: "مرتفعة" },
  },
};

export const DATE_LOCALES: Record<SupportedLanguage, string> = {
  en: "en-GB",
  de: "de-DE",
  ar: "ar",
};
