import type {
  CaseAnalysis,
  ClarificationAnswerId,
  NextStep,
  RequiredDocument,
  SupportedLanguage,
} from "@/domain/case";

interface MockContent {
  documentTitle: string;
  documentType: string;
  documentLanguage: string;
  summary: string;
  authorityWants: string;
  documents: RequiredDocument[];
  missingInformation: string[];
  question: string;
  questionReason: string;
  options: Array<{
    id: ClarificationAnswerId;
    label: string;
    routeImpact: string;
  }>;
  nextSteps: NextStep[];
  sources: CaseAnalysis["officialSources"];
  disclaimer: string;
}

interface RouteVariant {
  incomeDocument: RequiredDocument;
  incomeStep: Pick<NextStep, "title" | "description" | "status">;
  remainingUncertainty: string;
}

const MOCK_CONTENT: Record<SupportedLanguage, MockContent> = {
  en: {
    documentTitle: "Request for additional documents — fictional sample",
    documentType: "Residence permit renewal follow-up",
    documentLanguage: "German",
    summary:
      "This fictional letter says that Samira Haddad's residence permit renewal cannot be completed until additional documents are provided. It appears to set a 14-day response window from the letter date.",
    authorityWants:
      "Provide a current passport copy, proof of health insurance, and recent evidence of income. The right income evidence depends on whether Samira is employed, self-employed, or both.",
    documents: [
      {
        id: "passport-copy",
        title: "Current passport copy",
        description: "A clear copy of the valid passport information page.",
        status: "required",
      },
      {
        id: "health-insurance",
        title: "Proof of health insurance",
        description: "A recent confirmation showing current health coverage.",
        status: "required",
      },
      {
        id: "income-evidence",
        title: "Recent income evidence",
        description: "The correct evidence depends on the current work situation.",
        status: "depends-on-answer",
      },
    ],
    missingInformation: [
      "The fictional sample does not say whether Samira is employed, self-employed, or both.",
      "The accepted submission channel has not been verified against an official source.",
    ],
    question: "Are you currently employed, self-employed, or both?",
    questionReason:
      "The answer changes which income documents belong in the route.",
    options: [
      {
        id: "employed",
        label: "Employed",
        routeImpact: "Prepare salary and employment evidence.",
      },
      {
        id: "self-employed",
        label: "Self-employed",
        routeImpact: "Prepare business and recent income evidence.",
      },
      {
        id: "both",
        label: "Both",
        routeImpact: "Prepare both employment and business evidence.",
      },
    ],
    nextSteps: [
      {
        order: 1,
        title: "Check the letter details",
        description:
          "Confirm the name, reference number, letter date, and detected deadline against the original document.",
        responsibleParty: "You",
        timing: "Today",
        status: "ready",
        officialSourceIds: [],
      },
      {
        order: 2,
        title: "Confirm your work situation",
        description:
          "Answer the clarification question so the income-evidence step can be tailored.",
        responsibleParty: "You",
        timing: "Before collecting income evidence",
        status: "needs-answer",
        officialSourceIds: [],
      },
      {
        order: 3,
        title: "Collect the requested documents",
        description:
          "Prepare the passport copy, insurance proof, and the income evidence selected by the route.",
        responsibleParty: "You",
        timing: "Before 22 July 2026",
        status: "not-started",
        officialSourceIds: ["source-residence-renewal"],
      },
      {
        order: 4,
        title: "Verify how to submit",
        description:
          "Use the original letter's instructions and verify the current official submission channel before sending anything.",
        responsibleParty: "You",
        timing: "Before submitting",
        status: "not-started",
        officialSourceIds: ["source-lea-contact"],
      },
    ],
    sources: [
      {
        id: "source-residence-renewal",
        title: "Placeholder: residence permit renewal guidance",
        publisher: "Berlin Service Portal (placeholder reference)",
        url: "https://service.berlin.de/",
        domain: "service.berlin.de",
        accessedAt: null,
        supports: ["Document requirements", "Renewal process"],
        verificationStatus: "placeholder-unverified",
      },
      {
        id: "source-lea-contact",
        title: "Placeholder: immigration office contact and submission guidance",
        publisher: "Landesamt für Einwanderung Berlin (placeholder reference)",
        url: "https://www.berlin.de/einwanderung/",
        domain: "berlin.de",
        accessedAt: null,
        supports: ["Submission channel", "Authority contact details"],
        verificationStatus: "placeholder-unverified",
      },
    ],
    disclaimer:
      "This is fictional mock output for a Build Week prototype. It is not legal advice, the document was not read or uploaded, and the source placeholders have not been verified. Check the original letter and current official guidance before acting.",
  },
  de: {
    documentTitle: "Anforderung weiterer Unterlagen — fiktives Beispiel",
    documentType: "Nachforderung zur Verlängerung eines Aufenthaltstitels",
    documentLanguage: "Deutsch",
    summary:
      "Dieses fiktive Schreiben besagt, dass die Verlängerung des Aufenthaltstitels von Samira Haddad erst nach Eingang weiterer Unterlagen abgeschlossen werden kann. Offenbar gilt eine Antwortfrist von 14 Tagen ab dem Briefdatum.",
    authorityWants:
      "Einzureichen sind eine aktuelle Passkopie, ein Nachweis der Krankenversicherung und aktuelle Einkommensnachweise. Welche Einkommensnachweise passen, hängt davon ab, ob Samira angestellt, selbstständig oder beides ist.",
    documents: [
      {
        id: "passport-copy",
        title: "Aktuelle Passkopie",
        description: "Eine gut lesbare Kopie der Datenseite des gültigen Reisepasses.",
        status: "required",
      },
      {
        id: "health-insurance",
        title: "Nachweis der Krankenversicherung",
        description: "Eine aktuelle Bestätigung des bestehenden Versicherungsschutzes.",
        status: "required",
      },
      {
        id: "income-evidence",
        title: "Aktuelle Einkommensnachweise",
        description: "Die passenden Nachweise hängen von der Arbeitssituation ab.",
        status: "depends-on-answer",
      },
    ],
    missingInformation: [
      "Im fiktiven Beispiel steht nicht, ob Samira angestellt, selbstständig oder beides ist.",
      "Der zulässige Einreichungsweg wurde noch nicht anhand einer offiziellen Quelle geprüft.",
    ],
    question: "Sind Sie derzeit angestellt, selbstständig oder beides?",
    questionReason:
      "Die Antwort bestimmt, welche Einkommensnachweise in den Weg gehören.",
    options: [
      {
        id: "employed",
        label: "Angestellt",
        routeImpact: "Lohn- und Beschäftigungsnachweise vorbereiten.",
      },
      {
        id: "self-employed",
        label: "Selbstständig",
        routeImpact: "Geschäftliche und aktuelle Einkommensnachweise vorbereiten.",
      },
      {
        id: "both",
        label: "Beides",
        routeImpact: "Nachweise für Beschäftigung und Selbstständigkeit vorbereiten.",
      },
    ],
    nextSteps: [
      {
        order: 1,
        title: "Angaben im Schreiben prüfen",
        description:
          "Name, Aktenzeichen, Briefdatum und erkannte Frist mit dem Original abgleichen.",
        responsibleParty: "Sie",
        timing: "Heute",
        status: "ready",
        officialSourceIds: [],
      },
      {
        order: 2,
        title: "Arbeitssituation bestätigen",
        description:
          "Die Rückfrage beantworten, damit die Einkommensnachweise angepasst werden können.",
        responsibleParty: "Sie",
        timing: "Vor dem Sammeln der Einkommensnachweise",
        status: "needs-answer",
        officialSourceIds: [],
      },
      {
        order: 3,
        title: "Angeforderte Unterlagen sammeln",
        description:
          "Passkopie, Versicherungsnachweis und die vom Weg ausgewählten Einkommensnachweise vorbereiten.",
        responsibleParty: "Sie",
        timing: "Vor dem 22. Juli 2026",
        status: "not-started",
        officialSourceIds: ["source-residence-renewal"],
      },
      {
        order: 4,
        title: "Einreichungsweg prüfen",
        description:
          "Die Hinweise im Originalschreiben nutzen und den aktuellen offiziellen Einreichungsweg vor dem Versand prüfen.",
        responsibleParty: "Sie",
        timing: "Vor der Einreichung",
        status: "not-started",
        officialSourceIds: ["source-lea-contact"],
      },
    ],
    sources: [
      {
        id: "source-residence-renewal",
        title: "Platzhalter: Hinweise zur Verlängerung des Aufenthaltstitels",
        publisher: "Service-Portal Berlin (Platzhalter)",
        url: "https://service.berlin.de/",
        domain: "service.berlin.de",
        accessedAt: null,
        supports: ["Unterlagen", "Verlängerungsverfahren"],
        verificationStatus: "placeholder-unverified",
      },
      {
        id: "source-lea-contact",
        title: "Platzhalter: Kontakt- und Einreichungshinweise der Ausländerbehörde",
        publisher: "Landesamt für Einwanderung Berlin (Platzhalter)",
        url: "https://www.berlin.de/einwanderung/",
        domain: "berlin.de",
        accessedAt: null,
        supports: ["Einreichungsweg", "Kontaktdaten der Behörde"],
        verificationStatus: "placeholder-unverified",
      },
    ],
    disclaimer:
      "Dies ist eine fiktive Demo-Ausgabe für einen Build-Week-Prototyp. Sie ist keine Rechtsberatung. Das Dokument wurde weder gelesen noch hochgeladen, und die Quellenplatzhalter wurden nicht verifiziert. Prüfen Sie vor jedem Schritt das Originalschreiben und aktuelle offizielle Hinweise.",
  },
  ar: {
    documentTitle: "طلب مستندات إضافية — نموذج خيالي",
    documentType: "متابعة تجديد تصريح الإقامة",
    documentLanguage: "الألمانية",
    summary:
      "يفيد هذا الخطاب الخيالي بأن طلب تجديد تصريح إقامة سميرة حداد لا يمكن استكماله قبل تقديم مستندات إضافية. ويبدو أنه يحدد مهلة للرد مدتها 14 يومًا من تاريخ الخطاب.",
    authorityWants:
      "المطلوب تقديم نسخة حديثة من جواز السفر، وإثبات التأمين الصحي، وإثبات حديث للدخل. ويعتمد نوع إثبات الدخل المناسب على ما إذا كانت سميرة موظفة أو تعمل لحسابها الخاص أو تجمع بينهما.",
    documents: [
      {
        id: "passport-copy",
        title: "نسخة حديثة من جواز السفر",
        description: "نسخة واضحة من صفحة البيانات في جواز سفر ساري المفعول.",
        status: "required",
      },
      {
        id: "health-insurance",
        title: "إثبات التأمين الصحي",
        description: "تأكيد حديث يوضح أن التغطية الصحية سارية.",
        status: "required",
      },
      {
        id: "income-evidence",
        title: "إثبات حديث للدخل",
        description: "يعتمد الإثبات المناسب على وضع العمل الحالي.",
        status: "depends-on-answer",
      },
    ],
    missingInformation: [
      "لا يوضح النموذج الخيالي ما إذا كانت سميرة موظفة أو تعمل لحسابها الخاص أو تجمع بينهما.",
      "لم يتم التحقق من طريقة التقديم المقبولة من مصدر رسمي.",
    ],
    question: "هل تعمل حاليًا كموظف، أم لحسابك الخاص، أم تجمع بينهما؟",
    questionReason: "تحدد الإجابة مستندات الدخل التي يجب إضافتها إلى المسار.",
    options: [
      {
        id: "employed",
        label: "موظف",
        routeImpact: "تجهيز إثباتات الراتب والعمل.",
      },
      {
        id: "self-employed",
        label: "عمل لحسابي الخاص",
        routeImpact: "تجهيز إثباتات النشاط والدخل الحديث.",
      },
      {
        id: "both",
        label: "كلاهما",
        routeImpact: "تجهيز إثباتات العمل الوظيفي والنشاط الخاص.",
      },
    ],
    nextSteps: [
      {
        order: 1,
        title: "راجع بيانات الخطاب",
        description:
          "طابق الاسم ورقم الملف وتاريخ الخطاب والمهلة المكتشفة مع المستند الأصلي.",
        responsibleParty: "أنت",
        timing: "اليوم",
        status: "ready",
        officialSourceIds: [],
      },
      {
        order: 2,
        title: "أكد وضع عملك",
        description: "أجب عن سؤال التوضيح حتى يتم تخصيص خطوة إثبات الدخل.",
        responsibleParty: "أنت",
        timing: "قبل جمع إثباتات الدخل",
        status: "needs-answer",
        officialSourceIds: [],
      },
      {
        order: 3,
        title: "اجمع المستندات المطلوبة",
        description:
          "جهز نسخة جواز السفر وإثبات التأمين وإثباتات الدخل التي يحددها المسار.",
        responsibleParty: "أنت",
        timing: "قبل 22 يوليو 2026",
        status: "not-started",
        officialSourceIds: ["source-residence-renewal"],
      },
      {
        order: 4,
        title: "تحقق من طريقة التقديم",
        description:
          "اتبع تعليمات الخطاب الأصلي وتحقق من قناة التقديم الرسمية الحالية قبل إرسال أي شيء.",
        responsibleParty: "أنت",
        timing: "قبل التقديم",
        status: "not-started",
        officialSourceIds: ["source-lea-contact"],
      },
    ],
    sources: [
      {
        id: "source-residence-renewal",
        title: "مصدر مؤقت: إرشادات تجديد تصريح الإقامة",
        publisher: "بوابة خدمات برلين (مرجع مؤقت)",
        url: "https://service.berlin.de/",
        domain: "service.berlin.de",
        accessedAt: null,
        supports: ["متطلبات المستندات", "إجراءات التجديد"],
        verificationStatus: "placeholder-unverified",
      },
      {
        id: "source-lea-contact",
        title: "مصدر مؤقت: معلومات التواصل والتقديم لدى دائرة الهجرة",
        publisher: "دائرة الهجرة في برلين (مرجع مؤقت)",
        url: "https://www.berlin.de/einwanderung/",
        domain: "berlin.de",
        accessedAt: null,
        supports: ["طريقة التقديم", "بيانات التواصل مع الجهة"],
        verificationStatus: "placeholder-unverified",
      },
    ],
    disclaimer:
      "هذه نتيجة خيالية تجريبية لنموذج أولي ضمن Build Week، وليست استشارة قانونية. لم تتم قراءة المستند أو رفعه، ولم يتم التحقق من المصادر المؤقتة. راجع الخطاب الأصلي والإرشادات الرسمية الحالية قبل اتخاذ أي إجراء.",
  },
};

const ROUTE_VARIANTS: Record<
  SupportedLanguage,
  Record<ClarificationAnswerId, RouteVariant>
> = {
  en: {
    employed: {
      incomeDocument: {
        id: "income-evidence",
        title: "Employment income evidence",
        description: "Prepare recent payslips and an employment confirmation if available.",
        status: "required",
      },
      incomeStep: {
        title: "Prepare employment income evidence",
        description: "Collect recent payslips and an employment confirmation, then compare them with the original request.",
        status: "ready",
      },
      remainingUncertainty: "The accepted submission channel still needs official verification.",
    },
    "self-employed": {
      incomeDocument: {
        id: "income-evidence",
        title: "Self-employment income evidence",
        description: "Prepare recent business income records, such as a tax assessment or current profit overview.",
        status: "required",
      },
      incomeStep: {
        title: "Prepare self-employment income evidence",
        description: "Collect recent business income records and compare them with the original request.",
        status: "ready",
      },
      remainingUncertainty: "The accepted submission channel still needs official verification.",
    },
    both: {
      incomeDocument: {
        id: "income-evidence",
        title: "Employment and self-employment income evidence",
        description: "Prepare recent evidence for both salary and business income.",
        status: "required",
      },
      incomeStep: {
        title: "Prepare both sets of income evidence",
        description: "Collect recent salary and business income records and compare them with the original request.",
        status: "ready",
      },
      remainingUncertainty: "The accepted submission channel still needs official verification.",
    },
  },
  de: {
    employed: {
      incomeDocument: {
        id: "income-evidence",
        title: "Einkommensnachweise aus Beschäftigung",
        description: "Aktuelle Lohnabrechnungen und, falls vorhanden, eine Beschäftigungsbestätigung vorbereiten.",
        status: "required",
      },
      incomeStep: {
        title: "Einkommensnachweise aus Beschäftigung vorbereiten",
        description: "Aktuelle Lohnabrechnungen und eine Beschäftigungsbestätigung sammeln und mit der Anforderung abgleichen.",
        status: "ready",
      },
      remainingUncertainty: "Der zulässige Einreichungsweg muss noch offiziell geprüft werden.",
    },
    "self-employed": {
      incomeDocument: {
        id: "income-evidence",
        title: "Einkommensnachweise aus Selbstständigkeit",
        description: "Aktuelle geschäftliche Einkommensunterlagen wie Steuerbescheid oder Gewinnübersicht vorbereiten.",
        status: "required",
      },
      incomeStep: {
        title: "Einkommensnachweise aus Selbstständigkeit vorbereiten",
        description: "Aktuelle geschäftliche Einkommensunterlagen sammeln und mit der Anforderung abgleichen.",
        status: "ready",
      },
      remainingUncertainty: "Der zulässige Einreichungsweg muss noch offiziell geprüft werden.",
    },
    both: {
      incomeDocument: {
        id: "income-evidence",
        title: "Einkommensnachweise aus Beschäftigung und Selbstständigkeit",
        description: "Aktuelle Nachweise für Lohn- und Geschäftseinkommen vorbereiten.",
        status: "required",
      },
      incomeStep: {
        title: "Beide Arten von Einkommensnachweisen vorbereiten",
        description: "Aktuelle Lohn- und Geschäftseinkommensunterlagen sammeln und mit der Anforderung abgleichen.",
        status: "ready",
      },
      remainingUncertainty: "Der zulässige Einreichungsweg muss noch offiziell geprüft werden.",
    },
  },
  ar: {
    employed: {
      incomeDocument: {
        id: "income-evidence",
        title: "إثبات دخل من الوظيفة",
        description: "جهز قسائم راتب حديثة وتأكيد العمل إن كان متاحًا.",
        status: "required",
      },
      incomeStep: {
        title: "جهز إثبات دخل الوظيفة",
        description: "اجمع قسائم راتب حديثة وتأكيد العمل ثم طابقها مع الطلب الأصلي.",
        status: "ready",
      },
      remainingUncertainty: "لا تزال طريقة التقديم المقبولة بحاجة إلى تحقق رسمي.",
    },
    "self-employed": {
      incomeDocument: {
        id: "income-evidence",
        title: "إثبات دخل العمل الخاص",
        description: "جهز سجلات دخل حديثة للنشاط، مثل التقييم الضريبي أو ملخص الأرباح الحالي.",
        status: "required",
      },
      incomeStep: {
        title: "جهز إثبات دخل العمل الخاص",
        description: "اجمع سجلات دخل النشاط الحديثة ثم طابقها مع الطلب الأصلي.",
        status: "ready",
      },
      remainingUncertainty: "لا تزال طريقة التقديم المقبولة بحاجة إلى تحقق رسمي.",
    },
    both: {
      incomeDocument: {
        id: "income-evidence",
        title: "إثبات دخل الوظيفة والعمل الخاص",
        description: "جهز إثباتات حديثة لكل من الراتب ودخل النشاط الخاص.",
        status: "required",
      },
      incomeStep: {
        title: "جهز مجموعتي إثبات الدخل",
        description: "اجمع سجلات الراتب ودخل النشاط الحديثة ثم طابقها مع الطلب الأصلي.",
        status: "ready",
      },
      remainingUncertainty: "لا تزال طريقة التقديم المقبولة بحاجة إلى تحقق رسمي.",
    },
  },
};

export function buildMockCaseAnalysis(
  outputLanguage: SupportedLanguage,
): CaseAnalysis {
  const content = MOCK_CONTENT[outputLanguage];

  return {
    id: `mock-analysis-${outputLanguage}`,
    documentTitle: content.documentTitle,
    issuingAuthority: "Landesamt für Einwanderung Berlin",
    documentType: content.documentType,
    documentLanguage: content.documentLanguage,
    detectedDate: "2026-07-08",
    detectedDeadline: "2026-07-22",
    urgency: "high",
    summary: content.summary,
    whatTheAuthorityWants: content.authorityWants,
    requiredDocuments: content.documents.map((document) => ({ ...document })),
    missingInformation: [...content.missingInformation],
    clarificationQuestion: {
      id: "employment-status",
      prompt: content.question,
      reason: content.questionReason,
      options: content.options.map((option) => ({ ...option })),
      selectedAnswerId: null,
    },
    nextSteps: content.nextSteps.map((step) => ({
      ...step,
      officialSourceIds: [...step.officialSourceIds],
    })),
    officialSources: content.sources.map((source) => ({
      ...source,
      supports: [...source.supports],
    })),
    disclaimer: content.disclaimer,
    generatedAt: new Date().toISOString(),
    outputLanguage,
    isMock: true,
  };
}

export function getMockRouteVariant(
  outputLanguage: SupportedLanguage,
  answer: ClarificationAnswerId,
): RouteVariant {
  return ROUTE_VARIANTS[outputLanguage][answer];
}
