'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { RequestDraftInput } from '../src/web/domain.ts';
import { StatusPill } from './site-shell.tsx';

type CaseRecord = {
  id: string;
  status: string;
  draftBody: string;
};

type ApiError = { error: { code: string; message: string } };

async function requestJson<T>(input: string, init: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = (await response.json()) as T | ApiError;
  if (!response.ok) {
    const error = (body as ApiError).error ?? { code: 'REQUEST_FAILED', message: 'The request could not be completed.' };
    throw new Error(error.message);
  }
  return body as T;
}

export function PrepareFlow() {
  const [stage, setStage] = useState<'form' | 'review'>('form');
  const [input, setInput] = useState<RequestDraftInput>({ requesterName: '', requesterEmail: '', requestPurpose: '' });
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key: keyof RequestDraftInput, value: string) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.requesterName.trim() || !input.requesterEmail.trim() || !input.requestPurpose.trim()) {
      setError('Please complete all fields before preparing the draft.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const created = await requestJson<{ case: CaseRecord }>('/api/cases', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      setCaseRecord(created.case);
      setDraft(created.case.draftBody);
      setStage('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare the draft.');
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!caseRecord) {
      return;
    }
    setError('');
    setBusy(true);
    try {
      const updated = await requestJson<{ case: CaseRecord }>(`/api/cases/${caseRecord.id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'update-draft', draftBody: draft }),
      });
      setCaseRecord(updated.case);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the draft.');
    } finally {
      setBusy(false);
    }
  }

  if (stage === 'review') {
    return <section className="workspace-shell">
      <div className="workspace-kicker"><span className="step-badge">03</span><span>REVIEW BEFORE HANDOFF</span></div>
      <div className="workspace-header"><div><p className="eyebrow accent">DEMO CORP · SYNTHETIC DESTINATION</p><h1>Draft prepared.<br /><em>Your review is next.</em></h1><p className="detail-intro">This draft is ready for your edits. It has not been sent, filed, or submitted.</p></div><StatusPill label="Draft ready" kind="demo" /></div>
      <div className="handoff-grid"><section className="panel draft-panel"><div className="panel-label">Access request draft</div><textarea className="draft-text" aria-label="Editable access request draft" value={draft} onChange={(event) => setDraft(event.target.value)} /><div className="draft-footer"><span>{caseRecord ? `Case ${caseRecord.id.slice(0, 8)} · local demo state` : 'Local demo state'}</span><button className="button button-quiet" type="button" onClick={saveDraft} disabled={busy}>Save draft</button></div>{error && <p className="field-note" role="status">{error}</p>}</section><aside className="panel handoff-panel"><div className="panel-label">Human handoff</div><div className="handoff-icon" aria-hidden="true">↗</div><h2>Open destination to review and submit</h2><p>Nyaya will never submit this request for you. Review the draft, then continue directly on the destination website.</p><Link className="button button-primary button-full" href="/prepare/destination">Open synthetic destination</Link><p className="fine-print">DemoCorp is synthetic. No real request will be transmitted.</p></aside></div>
      <div className="timeline"><div className="timeline-item done"><span>01</span><div><strong>Route found</strong><small>Synthetic privacy page</small></div></div><div className="timeline-item done"><span>02</span><div><strong>Draft prepared</strong><small>Access request · ready for review</small></div></div><div className="timeline-item current"><span>03</span><div><strong>Your decision</strong><small>Edit, review, then open destination</small></div></div></div>
    </section>;
  }

  return <section className="workspace-shell">
    <div className="workspace-kicker"><span className="step-badge">01</span><span>NEW PRIVACY REQUEST</span></div>
    <div className="workspace-header"><div><p className="eyebrow accent">CONTROLLED DEMO</p><h1>Prepare an access<br /><em>request with care.</em></h1><p className="detail-intro">A small, synthetic journey that shows how Nyaya finds a route, prepares a draft, and stops before submission.</p></div><StatusPill label="No account required for demo" kind="neutral" /></div>
    <div className="process-rail"><div className="rail-step active"><span>01</span><strong>Choose</strong><small>Select destination</small></div><div className="rail-step"><span>02</span><strong>Prepare</strong><small>Shape your request</small></div><div className="rail-step"><span>03</span><strong>Review</strong><small>You stay in control</small></div></div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <form className="request-form" onSubmit={prepare}><div className="form-section"><div className="panel-label">Destination</div><label className="destination-option"><input type="radio" checked readOnly /><span><strong>DemoCorp</strong><small>Controlled synthetic destination · access request supported</small></span><StatusPill label="Synthetic" kind="demo" /></label></div><div className="form-section"><div className="panel-label">Your draft context</div><div className="form-grid"><label>Name<input name="requesterName" autoComplete="name" required placeholder="Aarav Sharma" value={input.requesterName} onChange={(event) => update('requesterName', event.target.value)} /></label><label>Email<input name="requesterEmail" type="email" autoComplete="email" required placeholder="aarav@example.test" value={input.requesterEmail} onChange={(event) => update('requesterEmail', event.target.value)} /></label></div><label>What should this request cover?<textarea name="requestPurpose" required placeholder="For example: the personal data associated with my account and how it is used." value={input.requestPurpose} onChange={(event) => update('requestPurpose', event.target.value)} /><span className="field-note">This is synthetic demo content. Do not enter real personal information.</span></label></div><div className="form-actions"><button className="button button-primary" type="submit" disabled={busy}>Prepare draft <span aria-hidden="true">→</span></button><span className="form-note">{busy ? 'Preparing…' : 'Next: review before any handoff'}</span></div></form>
  </section>;
}