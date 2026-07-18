"use client";

import { useState } from "react";

import {
  BUREAUCRACY_CATEGORIES,
  getCategoryDefinition,
  type BureaucracyCategory,
} from "@/domain/categories";
import type { CaseProfile } from "@/domain/case-profile";
import { MAX_GOAL_CHARACTERS, validateCaseGoal } from "@/lib/goal-validation";

export function CaseProfileSummary({
  profile,
  isMock,
  disabled,
  onSaveContext,
  onChangeAnswer,
}: {
  profile: CaseProfile;
  isMock: boolean;
  disabled: boolean;
  onSaveContext: (goal: string, category: BureaucracyCategory | null) => void;
  onChangeAnswer: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [goalDraft, setGoalDraft] = useState(profile.goal.text);
  const [categoryDraft, setCategoryDraft] = useState(profile.category);
  const [error, setError] = useState<string | null>(null);

  function save() {
    const validation = validateCaseGoal(goalDraft);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setEditing(false);
    setError(null);
    onSaveContext(validation.normalizedGoal, categoryDraft);
  }

  const answer = profile.answers[0];
  const categoryLabel = profile.category
    ? getCategoryDefinition(profile.category).label
    : "Not selected";

  return (
    <section aria-labelledby="case-profile-heading" className="rounded-[1.5rem] border border-[#ccd5d0] bg-white p-5 shadow-[0_14px_45px_rgba(29,47,38,0.05)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">Case profile</p>
          <h2 id="case-profile-heading" className="mt-2 text-xl font-semibold text-[#1d2b24]">What the route currently uses</h2>
        </div>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} disabled={disabled} className="rounded-xl border border-[#bfc8c2] bg-white px-4 py-2 text-sm font-semibold text-[#35443c] outline-none hover:border-[#75847b] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:opacity-60">
            Edit case details
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-5 space-y-4 rounded-2xl border border-[#d9dedb] bg-[#fafbf9] p-4">
          <div>
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="profile-goal" className="text-sm font-semibold text-[#26362e]">Goal</label>
              <span className="text-xs text-[#6d7871]">{goalDraft.length} / {MAX_GOAL_CHARACTERS}</span>
            </div>
            <textarea id="profile-goal" value={goalDraft} maxLength={MAX_GOAL_CHARACTERS} rows={3} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby="profile-goal-error" onChange={(event) => { setGoalDraft(event.target.value); setError(null); }} className="mt-2 w-full rounded-xl border border-[#bfc8c2] bg-white px-3 py-2.5 text-sm leading-6 text-[#2e3e35] outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35" />
            <p id="profile-goal-error" role="alert" className="mt-1 min-h-5 text-sm font-medium text-[#a33f2d]">{error}</p>
          </div>
          <div>
            <label htmlFor="profile-category" className="text-sm font-semibold text-[#26362e]">Optional category</label>
            <select id="profile-category" value={categoryDraft ?? ""} disabled={disabled} onChange={(event) => setCategoryDraft((event.target.value || null) as BureaucracyCategory | null)} className="mt-2 w-full rounded-xl border border-[#bfc8c2] bg-white px-3 py-2.5 text-sm text-[#2e3e35] outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35">
              <option value="">No category / I&apos;m not sure</option>
              {BUREAUCRACY_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={disabled} className="rounded-xl bg-[#1d664b] px-4 py-2.5 text-sm font-semibold text-white outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:opacity-60">Save and rebuild question</button>
            <button type="button" onClick={() => { setEditing(false); setGoalDraft(profile.goal.text); setCategoryDraft(profile.category); setError(null); }} disabled={disabled} className="rounded-xl border border-[#bfc8c2] px-4 py-2.5 text-sm font-semibold text-[#35443c] outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:opacity-60">Cancel</button>
          </div>
        </div>
      ) : (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <SummaryField label="Goal" value={profile.goal.text} />
          <SummaryField label="Optional category" value={categoryLabel} />
          <SummaryField label="Evidence" value={profile.evidence[0]?.label ?? "Goal only — no document added"} />
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#66726b]">Clarification</dt>
            <dd className="mt-1 text-sm leading-6 text-[#26362e]">{answer?.label ?? "One answer still needed"}</dd>
            {answer ? <button type="button" onClick={onChangeAnswer} disabled={disabled} className="mt-2 text-sm font-semibold text-[#1d664b] underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:opacity-60">Change this answer</button> : null}
          </div>
        </dl>
      )}

      <p className="mt-5 rounded-xl bg-[#f3f6f3] px-4 py-3 text-sm leading-6 text-[#5c6861]">
        {profile.sufficiency.state === "sufficient" ? (isMock ? "Profile sufficient for this fictional mock route." : "Profile sufficient for this analyzed route.") : "One route-changing detail is needed before the route is final."}
        {profile.correctionHistory.length ? ` ${profile.correctionHistory.length} correction${profile.correctionHistory.length === 1 ? "" : "s"} remembered in this tab.` : ""}
      </p>
    </section>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#66726b]">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#26362e]">{value}</dd></div>;
}
