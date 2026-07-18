import type {
  RouteClaim,
  SourceAuthorityType,
  SourceReference,
  SupportedLanguage,
} from "@/domain/case";
import type { ResearchTopic, StepEvidence } from "@/domain/research-api";

export const OFFICIAL_DOMAIN_ALLOWLIST = {
  "service.berlin.de": "Official Berlin service portal",
  "www.berlin.de": "Official State of Berlin authority pages",
  "www.gesetze-im-internet.de": "Federal Ministry of Justice law portal",
  "www.elster.de": "Official German tax administration portal",
} as const;

export type AllowedOfficialDomain = keyof typeof OFFICIAL_DOMAIN_ALLOWLIST;

export interface OfficialSourceRecord {
  source: SourceReference & {
    supportedClaimIds: string[];
    authorityType: SourceAuthorityType;
    jurisdiction: string;
    conflictStatus: "none" | "conflict";
    httpStatus: number;
  };
  claims: RouteClaim[];
}

const ACCESSED_AT = "2026-07-18T17:30:00.000Z";

const TEXT = {
  en: {
    residenceContact: "Use the LEA online application when one exists for the service; otherwise use the responsible LEA contact form.",
    residenceLaw: "Federal residence law governs applications to extend a residence title before the current title expires.",
    registrationDeadline: "Register a new Berlin main residence within 14 days after moving in.",
    registrationDocuments: "The Berlin service guidance lists an identity document and the landlord confirmation among the required evidence.",
    taxQuestionnaire: "Submit the tax-registration questionnaire for a new freelance activity through Mein ELSTER.",
    taxTiming: "Berlin tax guidance says the tax-registration questionnaire should be submitted electronically within one month of starting the activity.",
  },
  de: {
    residenceContact: "Nutzen Sie den Online-Antrag des LEA, wenn er für die Dienstleistung angeboten wird; andernfalls das zuständige LEA-Kontaktformular.",
    residenceLaw: "Das Aufenthaltsgesetz regelt Anträge auf Verlängerung eines Aufenthaltstitels vor Ablauf des aktuellen Titels.",
    registrationDeadline: "Melden Sie eine neue Berliner Hauptwohnung innerhalb von 14 Tagen nach dem Einzug an.",
    registrationDocuments: "Die Berliner Dienstleistung nennt ein Identitätsdokument und die Wohnungsgeberbestätigung als erforderliche Nachweise.",
    taxQuestionnaire: "Übermitteln Sie den Fragebogen zur steuerlichen Erfassung für eine neue freiberufliche Tätigkeit über Mein ELSTER.",
    taxTiming: "Die Berliner Steuerinformation nennt für den elektronischen Fragebogen eine Frist von einem Monat nach Aufnahme der Tätigkeit.",
  },
  ar: {
    residenceContact: "استخدم طلب LEA الإلكتروني إذا كان متاحًا للخدمة، وإلا فاستخدم نموذج الاتصال المختص لدى LEA.",
    residenceLaw: "ينظم قانون الإقامة الاتحادي طلبات تمديد تصريح الإقامة قبل انتهاء التصريح الحالي.",
    registrationDeadline: "سجّل محل السكن الرئيسي الجديد في برلين خلال 14 يومًا من الانتقال إليه.",
    registrationDocuments: "تذكر إرشادات خدمة برلين وثيقة الهوية وتأكيد المؤجر ضمن الإثباتات المطلوبة.",
    taxQuestionnaire: "قدّم استبيان التسجيل الضريبي للنشاط الحر الجديد عبر Mein ELSTER.",
    taxTiming: "تذكر إرشادات الضرائب في برلين تقديم الاستبيان إلكترونيًا خلال شهر من بدء النشاط.",
  },
} satisfies Record<SupportedLanguage, Record<string, string>>;

export function getCuratedOfficialSources(
  topic: ResearchTopic,
  language: SupportedLanguage,
): { records: OfficialSourceRecord[]; stepEvidence: StepEvidence[] } {
  const copy = TEXT[language];
  if (topic === "residence-permit-renewal") {
    return {
      records: [
        record({
          id: "lea-contact-options",
          title: "Contact the Berlin Immigration Office (LEA)",
          publisher: "Landesamt für Einwanderung Berlin",
          url: "https://www.berlin.de/einwanderung/ueber-uns/kontakt/artikel.1394180.php",
          domain: "www.berlin.de",
          authorityType: "local-administrative-practice",
          jurisdiction: "Berlin",
          claim: claim("claim-lea-contact", copy.residenceContact, "local-administrative-practice", ["lea-contact-options"], "Berlin"),
        }),
        record({
          id: "aufenthg-81",
          title: "Residence Act (AufenthG), section 81",
          publisher: "Federal Ministry of Justice",
          url: "https://www.gesetze-im-internet.de/aufenthg_2004/__81.html",
          domain: "www.gesetze-im-internet.de",
          authorityType: "federal-law",
          jurisdiction: "Germany",
          claim: claim("claim-residence-extension-law", copy.residenceLaw, "law", ["aufenthg-81"], "Germany"),
        }),
      ],
      stepEvidence: [
        { stepOrder: 1, claimIds: ["claim-residence-extension-law"], sourceIds: ["aufenthg-81"] },
        { stepOrder: 4, claimIds: ["claim-lea-contact"], sourceIds: ["lea-contact-options"] },
      ],
    };
  }
  if (topic === "address-registration") {
    return {
      records: [
        record({
          id: "berlin-register-residence",
          title: "Register a main or sole residence",
          publisher: "ServicePortal Berlin",
          url: "https://service.berlin.de/dienstleistung/120686/",
          domain: "service.berlin.de",
          authorityType: "official-service-guidance",
          jurisdiction: "Berlin",
          claims: [
            claim("claim-registration-deadline", copy.registrationDeadline, "official-service-guidance", ["berlin-register-residence"], "Berlin"),
            claim("claim-registration-documents", copy.registrationDocuments, "official-service-guidance", ["berlin-register-residence"], "Berlin"),
          ],
        }),
        record({
          id: "bmg-17",
          title: "Federal Registration Act (BMG), section 17",
          publisher: "Federal Ministry of Justice",
          url: "https://www.gesetze-im-internet.de/bmg/__17.html",
          domain: "www.gesetze-im-internet.de",
          authorityType: "federal-law",
          jurisdiction: "Germany",
          claim: claim("claim-registration-deadline-law", copy.registrationDeadline, "law", ["bmg-17"], "Germany"),
        }),
      ],
      stepEvidence: [
        { stepOrder: 1, claimIds: ["claim-registration-deadline", "claim-registration-deadline-law"], sourceIds: ["berlin-register-residence", "bmg-17"] },
        { stepOrder: 3, claimIds: ["claim-registration-documents"], sourceIds: ["berlin-register-residence"] },
      ],
    };
  }
  if (topic === "freelance-tax-registration") {
    return {
      records: [
        record({
          id: "elster-fseeun",
          title: "Tax registration questionnaire for sole proprietorships",
          publisher: "German Tax Administration (ELSTER)",
          url: "https://www.elster.de/eportal/formulare-leistungen/alleformulare/fseeun",
          domain: "www.elster.de",
          authorityType: "official-service-guidance",
          jurisdiction: "Germany",
          claim: claim("claim-tax-questionnaire", copy.taxQuestionnaire, "official-service-guidance", ["elster-fseeun"], "Germany"),
        }),
        record({
          id: "berlin-business-opening-tax",
          title: "Opening and closing a business for tax purposes",
          publisher: "Berlin Senate Department for Finance",
          url: "https://www.berlin.de/sen/finanzen/steuern/downloads/artikel.9770.php",
          domain: "www.berlin.de",
          authorityType: "local-administrative-practice",
          jurisdiction: "Berlin",
          claim: claim("claim-tax-timing", copy.taxTiming, "local-administrative-practice", ["berlin-business-opening-tax"], "Berlin"),
        }),
      ],
      stepEvidence: [
        { stepOrder: 1, claimIds: ["claim-tax-timing"], sourceIds: ["berlin-business-opening-tax"] },
        { stepOrder: 4, claimIds: ["claim-tax-questionnaire"], sourceIds: ["elster-fseeun"] },
      ],
    };
  }
  return { records: [], stepEvidence: [] };
}

export function isAllowedOfficialUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname in OFFICIAL_DOMAIN_ALLOWLIST;
  } catch {
    return false;
  }
}

export function validateCanonicalRedirect(originalUrl: string, finalUrl: string): boolean {
  if (!isAllowedOfficialUrl(originalUrl) || !isAllowedOfficialUrl(finalUrl)) return false;
  return new URL(originalUrl).hostname === new URL(finalUrl).hostname;
}

function claim(id: string, text: string, kind: RouteClaim["kind"], sourceIds: string[], jurisdiction: string): RouteClaim {
  return { id, text, kind, sourceIds, jurisdiction, supportStatus: "supported" };
}

function record(input: {
  id: string;
  title: string;
  publisher: string;
  url: string;
  domain: AllowedOfficialDomain;
  authorityType: SourceAuthorityType;
  jurisdiction: string;
  claim?: RouteClaim;
  claims?: RouteClaim[];
}): OfficialSourceRecord {
  const claims = input.claims ?? (input.claim ? [input.claim] : []);
  return {
    source: {
      id: input.id,
      title: input.title,
      publisher: input.publisher,
      url: input.url,
      domain: input.domain,
      accessedAt: ACCESSED_AT,
      supports: claims.map((item) => item.text),
      verificationStatus: "verified",
      supportedClaimIds: claims.map((item) => item.id),
      authorityType: input.authorityType,
      jurisdiction: input.jurisdiction,
      conflictStatus: "none",
      httpStatus: 200,
    },
    claims,
  };
}
