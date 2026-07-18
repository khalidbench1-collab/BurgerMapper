import type { BureaucracyCategory } from "@/domain/categories";
import type {
  CaseAnalysis,
  ClarificationAnswerId,
  ClarificationOption,
  RequiredDocument,
  SupportedLanguage,
} from "@/domain/case";

type MockVariantCategory = Extract<
  BureaucracyCategory,
  "arrival-registration" | "work-business"
>;

interface CategoryVariantContent {
  documentTitle: string;
  issuingAuthority: string;
  documentType: string;
  summary: string;
  authorityWants: string;
  documents: RequiredDocument[];
  uncertainty: string;
  question: string;
  questionReason: string;
  options: ClarificationOption[];
  stepTitles: [string, string, string, string];
  stepDescriptions: [string, string, string, string];
  sourceTitle: string;
  sourcePublisher: string;
  sourceSupports: string[];
}

const CATEGORY_VARIANTS: Record<
  SupportedLanguage,
  Record<MockVariantCategory, CategoryVariantContent>
> = {
  en: {
    "arrival-registration": {
      documentTitle: "Request to complete address registration — fictional sample",
      issuingAuthority: "Bürgeramt Berlin (fictional mock)",
      documentType: "Anmeldung follow-up",
      summary:
        "This fictional route demonstrates a follow-up message about completing an address registration. No pasted text or uploaded file was interpreted.",
      authorityWants:
        "Prepare identity, housing confirmation, and registration details, then confirm whether the Berlin address is the primary or a secondary residence.",
      documents: [
        {
          id: "identity-document",
          title: "Passport or identity document",
          description: "A valid identity document for the fictional registration route.",
          status: "required",
        },
        {
          id: "housing-confirmation",
          title: "Landlord confirmation",
          description: "A fictional Wohnungsgeberbestätigung for the address being registered.",
          status: "required",
        },
        {
          id: "registration-details",
          title: "Residence-status details",
          description: "The route changes depending on whether this is a primary or secondary residence.",
          status: "depends-on-answer",
        },
      ],
      uncertainty: "The mock does not know whether this is a primary or secondary residence.",
      question: "Is this address your primary residence, a secondary residence, or are you unsure?",
      questionReason: "The answer changes which residence details the registration route highlights.",
      options: [
        {
          id: "primary-residence",
          label: "Primary residence",
          routeImpact: "Prepare the primary-residence details.",
        },
        {
          id: "secondary-residence",
          label: "Secondary residence",
          routeImpact: "Prepare the secondary-residence details.",
        },
        {
          id: "unsure-residence",
          label: "I’m not sure",
          routeImpact: "Verify the residence type before finalizing the route.",
        },
      ],
      stepTitles: [
        "Check the registration message",
        "Confirm the residence type",
        "Prepare registration documents",
        "Verify the appointment or submission route",
      ],
      stepDescriptions: [
        "Compare the address, date, and any reference details with the original message.",
        "Answer the residence question so the mock route can highlight the right details.",
        "Collect identity, housing-confirmation, and registration details.",
        "Check the original message and current official service information before acting.",
      ],
      sourceTitle: "Placeholder: Berlin address-registration guidance",
      sourcePublisher: "Berlin Service Portal (placeholder reference)",
      sourceSupports: ["Registration documents", "Appointment process"],
    },
    "work-business": {
      documentTitle: "Request to clarify freelance registration — fictional sample",
      issuingAuthority: "Finanzamt Berlin (fictional mock)",
      documentType: "Freelance tax-registration follow-up",
      summary:
        "This fictional route demonstrates a follow-up about registering freelance work. No pasted text or uploaded file was interpreted.",
      authorityWants:
        "Prepare identity, a short description of the freelance activity, and basic financial information, then clarify whether freelancing is the only work or alongside employment.",
      documents: [
        {
          id: "identity-document",
          title: "Identity document",
          description: "A valid identity document for the fictional registration route.",
          status: "required",
        },
        {
          id: "activity-description",
          title: "Freelance activity description",
          description: "A short plain-language description of the planned work.",
          status: "required",
        },
        {
          id: "work-arrangement",
          title: "Work-arrangement details",
          description: "The route changes depending on whether freelance work is the only work or alongside employment.",
          status: "depends-on-answer",
        },
      ],
      uncertainty: "The mock does not know whether freelance work is the only work or alongside employment.",
      question: "Will you freelance only, freelance alongside employment, or are you unsure?",
      questionReason: "The answer changes which work and income details the route highlights.",
      options: [
        {
          id: "freelance-only",
          label: "Freelance only",
          routeImpact: "Prepare freelance-only activity and income details.",
        },
        {
          id: "alongside-employment",
          label: "Alongside employment",
          routeImpact: "Prepare employment and freelance-work details.",
        },
        {
          id: "unsure-work",
          label: "I’m not sure",
          routeImpact: "Clarify the work arrangement before finalizing the route.",
        },
      ],
      stepTitles: [
        "Check the registration request",
        "Confirm the work arrangement",
        "Prepare the requested details",
        "Verify the official registration channel",
      ],
      stepDescriptions: [
        "Compare the activity, date, and any reference details with the original message.",
        "Answer the work question so the mock route can highlight the right evidence.",
        "Collect identity, activity-description, and work-arrangement details.",
        "Check the original message and current official tax information before acting.",
      ],
      sourceTitle: "Placeholder: freelance tax-registration guidance",
      sourcePublisher: "Berlin tax administration (placeholder reference)",
      sourceSupports: ["Registration details", "Submission process"],
    },
  },
  de: {
    "arrival-registration": {
      documentTitle: "Aufforderung zur Ergänzung der Anmeldung — fiktives Beispiel",
      issuingAuthority: "Bürgeramt Berlin (fiktive Demo)",
      documentType: "Rückfrage zur Anmeldung",
      summary:
        "Dieser fiktive Weg zeigt eine Rückfrage zur Vervollständigung einer Wohnsitzanmeldung. Eingefügter Text und hochgeladene Dateien wurden nicht interpretiert.",
      authorityWants:
        "Identitätsnachweis, Wohnungsgeberbestätigung und Meldedaten vorbereiten und klären, ob die Berliner Adresse Haupt- oder Nebenwohnung ist.",
      documents: [
        {
          id: "identity-document",
          title: "Reisepass oder Ausweisdokument",
          description: "Ein gültiges Identitätsdokument für den fiktiven Anmeldeweg.",
          status: "required",
        },
        {
          id: "housing-confirmation",
          title: "Wohnungsgeberbestätigung",
          description: "Eine fiktive Bestätigung für die anzumeldende Adresse.",
          status: "required",
        },
        {
          id: "registration-details",
          title: "Angaben zur Wohnungsart",
          description: "Der Weg unterscheidet zwischen Haupt- und Nebenwohnung.",
          status: "depends-on-answer",
        },
      ],
      uncertainty: "Die Demo weiß nicht, ob dies eine Haupt- oder Nebenwohnung ist.",
      question: "Ist diese Adresse Ihre Hauptwohnung, eine Nebenwohnung oder sind Sie unsicher?",
      questionReason: "Die Antwort verändert, welche Meldedaten der Weg hervorhebt.",
      options: [
        {
          id: "primary-residence",
          label: "Hauptwohnung",
          routeImpact: "Angaben zur Hauptwohnung vorbereiten.",
        },
        {
          id: "secondary-residence",
          label: "Nebenwohnung",
          routeImpact: "Angaben zur Nebenwohnung vorbereiten.",
        },
        {
          id: "unsure-residence",
          label: "Ich bin unsicher",
          routeImpact: "Wohnungsart vor Abschluss des Wegs prüfen.",
        },
      ],
      stepTitles: [
        "Anmeldenachricht prüfen",
        "Wohnungsart bestätigen",
        "Anmeldeunterlagen vorbereiten",
        "Termin oder Einreichungsweg prüfen",
      ],
      stepDescriptions: [
        "Adresse, Datum und Referenzangaben mit der Originalnachricht abgleichen.",
        "Die Wohnungsfrage beantworten, damit die Demo die passenden Angaben hervorhebt.",
        "Identitätsnachweis, Wohnungsgeberbestätigung und Meldedaten sammeln.",
        "Vor jedem Schritt Originalnachricht und aktuelle offizielle Hinweise prüfen.",
      ],
      sourceTitle: "Platzhalter: Hinweise zur Berliner Anmeldung",
      sourcePublisher: "Service-Portal Berlin (Platzhalter)",
      sourceSupports: ["Anmeldeunterlagen", "Terminverfahren"],
    },
    "work-business": {
      documentTitle: "Rückfrage zur steuerlichen Erfassung freiberuflicher Arbeit — fiktives Beispiel",
      issuingAuthority: "Finanzamt Berlin (fiktive Demo)",
      documentType: "Rückfrage zur freiberuflichen Steueranmeldung",
      summary:
        "Dieser fiktive Weg zeigt eine Rückfrage zur Anmeldung freiberuflicher Arbeit. Eingefügter Text und hochgeladene Dateien wurden nicht interpretiert.",
      authorityWants:
        "Identitätsnachweis, kurze Tätigkeitsbeschreibung und grundlegende Finanzangaben vorbereiten und klären, ob die freiberufliche Arbeit allein oder neben einer Anstellung erfolgt.",
      documents: [
        {
          id: "identity-document",
          title: "Identitätsdokument",
          description: "Ein gültiges Identitätsdokument für den fiktiven Anmeldeweg.",
          status: "required",
        },
        {
          id: "activity-description",
          title: "Beschreibung der freiberuflichen Tätigkeit",
          description: "Eine kurze verständliche Beschreibung der geplanten Arbeit.",
          status: "required",
        },
        {
          id: "work-arrangement",
          title: "Angaben zur Arbeitsform",
          description: "Der Weg unterscheidet zwischen ausschließlich freiberuflicher Arbeit und einer Kombination mit Anstellung.",
          status: "depends-on-answer",
        },
      ],
      uncertainty: "Die Demo weiß nicht, ob die freiberufliche Arbeit allein oder neben einer Anstellung erfolgt.",
      question: "Arbeiten Sie nur freiberuflich, neben einer Anstellung oder sind Sie unsicher?",
      questionReason: "Die Antwort verändert, welche Arbeits- und Einkommensangaben der Weg hervorhebt.",
      options: [
        {
          id: "freelance-only",
          label: "Nur freiberuflich",
          routeImpact: "Angaben zur freiberuflichen Tätigkeit und zu Einkünften vorbereiten.",
        },
        {
          id: "alongside-employment",
          label: "Neben einer Anstellung",
          routeImpact: "Angaben zu Anstellung und freiberuflicher Arbeit vorbereiten.",
        },
        {
          id: "unsure-work",
          label: "Ich bin unsicher",
          routeImpact: "Arbeitsform vor Abschluss des Wegs klären.",
        },
      ],
      stepTitles: [
        "Anmeldeanfrage prüfen",
        "Arbeitsform bestätigen",
        "Angeforderte Angaben vorbereiten",
        "Offiziellen Anmeldeweg prüfen",
      ],
      stepDescriptions: [
        "Tätigkeit, Datum und Referenzangaben mit der Originalnachricht abgleichen.",
        "Die Arbeitsfrage beantworten, damit die Demo die passenden Nachweise hervorhebt.",
        "Identitätsnachweis, Tätigkeitsbeschreibung und Angaben zur Arbeitsform sammeln.",
        "Vor jedem Schritt Originalnachricht und aktuelle offizielle Steuerhinweise prüfen.",
      ],
      sourceTitle: "Platzhalter: Hinweise zur steuerlichen Erfassung freiberuflicher Arbeit",
      sourcePublisher: "Berliner Steuerverwaltung (Platzhalter)",
      sourceSupports: ["Anmeldedaten", "Einreichungsverfahren"],
    },
  },
  ar: {
    "arrival-registration": {
      documentTitle: "طلب استكمال تسجيل العنوان — نموذج خيالي",
      issuingAuthority: "مكتب خدمات المواطنين في برلين (نموذج خيالي)",
      documentType: "متابعة تسجيل السكن",
      summary:
        "يعرض هذا المسار الخيالي رسالة متابعة لاستكمال تسجيل العنوان. لم تتم قراءة النص الملصق أو الملف المرفوع أو تفسيره.",
      authorityWants:
        "تجهيز إثبات الهوية وتأكيد المؤجر وبيانات التسجيل، ثم تحديد ما إذا كان عنوان برلين سكنًا رئيسيًا أم ثانويًا.",
      documents: [
        {
          id: "identity-document",
          title: "جواز سفر أو وثيقة هوية",
          description: "وثيقة هوية سارية للمسار التجريبي.",
          status: "required",
        },
        {
          id: "housing-confirmation",
          title: "تأكيد المؤجر",
          description: "تأكيد خيالي للعنوان المطلوب تسجيله.",
          status: "required",
        },
        {
          id: "registration-details",
          title: "تفاصيل نوع السكن",
          description: "يتغير المسار بحسب كون العنوان سكنًا رئيسيًا أو ثانويًا.",
          status: "depends-on-answer",
        },
      ],
      uncertainty: "لا يعرف النموذج ما إذا كان هذا سكنًا رئيسيًا أم ثانويًا.",
      question: "هل هذا عنوان سكنك الرئيسي أم سكن ثانوي، أم أنك غير متأكد؟",
      questionReason: "تغير الإجابة بيانات التسجيل التي يبرزها المسار.",
      options: [
        {
          id: "primary-residence",
          label: "السكن الرئيسي",
          routeImpact: "تجهيز بيانات السكن الرئيسي.",
        },
        {
          id: "secondary-residence",
          label: "سكن ثانوي",
          routeImpact: "تجهيز بيانات السكن الثانوي.",
        },
        {
          id: "unsure-residence",
          label: "لست متأكدًا",
          routeImpact: "التحقق من نوع السكن قبل تثبيت المسار.",
        },
      ],
      stepTitles: [
        "راجع رسالة التسجيل",
        "أكد نوع السكن",
        "جهز مستندات التسجيل",
        "تحقق من الموعد أو طريقة التقديم",
      ],
      stepDescriptions: [
        "طابق العنوان والتاريخ وأي رقم مرجعي مع الرسالة الأصلية.",
        "أجب عن سؤال السكن حتى يبرز النموذج البيانات المناسبة.",
        "اجمع إثبات الهوية وتأكيد المؤجر وبيانات التسجيل.",
        "راجع الرسالة الأصلية والمعلومات الرسمية الحالية قبل أي إجراء.",
      ],
      sourceTitle: "مصدر مؤقت: إرشادات تسجيل العنوان في برلين",
      sourcePublisher: "بوابة خدمات برلين (مرجع مؤقت)",
      sourceSupports: ["مستندات التسجيل", "إجراءات الموعد"],
    },
    "work-business": {
      documentTitle: "طلب توضيح تسجيل العمل الحر — نموذج خيالي",
      issuingAuthority: "مكتب الضرائب في برلين (نموذج خيالي)",
      documentType: "متابعة التسجيل الضريبي للعمل الحر",
      summary:
        "يعرض هذا المسار الخيالي رسالة متابعة حول تسجيل العمل الحر. لم تتم قراءة النص الملصق أو الملف المرفوع أو تفسيره.",
      authorityWants:
        "تجهيز إثبات الهوية ووصف مختصر للنشاط ومعلومات مالية أساسية، ثم توضيح ما إذا كان العمل الحر هو العمل الوحيد أم إلى جانب وظيفة.",
      documents: [
        {
          id: "identity-document",
          title: "وثيقة هوية",
          description: "وثيقة هوية سارية للمسار التجريبي.",
          status: "required",
        },
        {
          id: "activity-description",
          title: "وصف نشاط العمل الحر",
          description: "وصف مختصر وواضح للعمل المخطط له.",
          status: "required",
        },
        {
          id: "work-arrangement",
          title: "تفاصيل ترتيب العمل",
          description: "يتغير المسار بحسب كون العمل الحر هو العمل الوحيد أو إلى جانب وظيفة.",
          status: "depends-on-answer",
        },
      ],
      uncertainty: "لا يعرف النموذج ما إذا كان العمل الحر هو العمل الوحيد أم إلى جانب وظيفة.",
      question: "هل ستعمل عملًا حرًا فقط، أم إلى جانب وظيفة، أم أنك غير متأكد؟",
      questionReason: "تغير الإجابة بيانات العمل والدخل التي يبرزها المسار.",
      options: [
        {
          id: "freelance-only",
          label: "عمل حر فقط",
          routeImpact: "تجهيز تفاصيل نشاط ودخل العمل الحر.",
        },
        {
          id: "alongside-employment",
          label: "إلى جانب وظيفة",
          routeImpact: "تجهيز تفاصيل الوظيفة والعمل الحر.",
        },
        {
          id: "unsure-work",
          label: "لست متأكدًا",
          routeImpact: "توضيح ترتيب العمل قبل تثبيت المسار.",
        },
      ],
      stepTitles: [
        "راجع طلب التسجيل",
        "أكد ترتيب العمل",
        "جهز التفاصيل المطلوبة",
        "تحقق من قناة التسجيل الرسمية",
      ],
      stepDescriptions: [
        "طابق النشاط والتاريخ وأي رقم مرجعي مع الرسالة الأصلية.",
        "أجب عن سؤال العمل حتى يبرز النموذج الأدلة المناسبة.",
        "اجمع إثبات الهوية ووصف النشاط وتفاصيل ترتيب العمل.",
        "راجع الرسالة الأصلية والمعلومات الضريبية الرسمية الحالية قبل أي إجراء.",
      ],
      sourceTitle: "مصدر مؤقت: إرشادات التسجيل الضريبي للعمل الحر",
      sourcePublisher: "إدارة الضرائب في برلين (مرجع مؤقت)",
      sourceSupports: ["بيانات التسجيل", "إجراءات التقديم"],
    },
  },
};

export function applyCategoryMockVariation(
  analysis: CaseAnalysis,
): CaseAnalysis {
  if (
    analysis.category !== "arrival-registration" &&
    analysis.category !== "work-business"
  ) {
    return analysis;
  }

  const content = CATEGORY_VARIANTS[analysis.outputLanguage][analysis.category];

  return {
    ...analysis,
    documentTitle: content.documentTitle,
    issuingAuthority: content.issuingAuthority,
    documentType: content.documentType,
    summary: content.summary,
    whatTheAuthorityWants: content.authorityWants,
    requiredDocuments: content.documents.map((document) => ({ ...document })),
    missingInformation: [
      content.uncertainty,
      analysis.missingInformation[1],
    ],
    clarificationQuestion: {
      id: `${analysis.category}-context`,
      prompt: content.question,
      reason: content.questionReason,
      options: content.options.map((option) => ({ ...option })),
      selectedAnswerId: null,
    },
    nextSteps: analysis.nextSteps.map((step, index) => ({
      ...step,
      title: content.stepTitles[index],
      description: content.stepDescriptions[index],
      officialSourceIds: [...step.officialSourceIds],
    })),
    officialSources: analysis.officialSources.map((source, index) =>
      index === 0
        ? {
            ...source,
            title: content.sourceTitle,
            publisher: content.sourcePublisher,
            supports: [...content.sourceSupports],
          }
        : { ...source, supports: [...source.supports] },
    ),
  };
}

export function adaptCategoryClarification(
  analysis: CaseAnalysis,
  answer: ClarificationAnswerId,
): CaseAnalysis | null {
  if (
    analysis.category !== "arrival-registration" &&
    analysis.category !== "work-business"
  ) {
    return null;
  }

  const option = analysis.clarificationQuestion.options.find(
    (item) => item.id === answer,
  );
  if (!option) return analysis;

  const isUnsure = answer === "unsure-residence" || answer === "unsure-work";

  return {
    ...analysis,
    clarificationQuestion: {
      ...analysis.clarificationQuestion,
      selectedAnswerId: answer,
    },
    missingInformation: isUnsure
      ? [analysis.clarificationQuestion.prompt, analysis.missingInformation.at(-1) ?? ""]
      : [analysis.missingInformation.at(-1) ?? ""],
    nextSteps: analysis.nextSteps.map((step) =>
      step.order === 2
        ? {
            ...step,
            title: option.routeImpact,
            description: analysis.clarificationQuestion.reason,
            status: isUnsure ? "needs-answer" : "ready",
          }
        : { ...step, officialSourceIds: [...step.officialSourceIds] },
    ),
  };
}
