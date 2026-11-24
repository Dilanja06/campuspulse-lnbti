import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { VerificationLayout } from '../../components/VerificationLayout';
import { ExternalVerificationItem } from '../../types';
import { dataService } from '../../services/dataService';

export const VerificationQueue: React.FC = () => {
  const location = useLocation();
  const isHistoryRoute = location.pathname.includes('/history');

  const [items, setItems] = useState<ExternalVerificationItem[]>([]);
  const [selected, setSelected] = useState<ExternalVerificationItem | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const list = await dataService.getExternalVerifications();
      setItems(list);
      const pendingFirst = list.find((v) => v.status === 'Pending Verification') || list[0] || null;
      if (!selected && pendingFirst) setSelected(pendingFirst);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const displayed = isHistoryRoute
    ? items.filter((v) => v.status !== 'Pending Verification')
    : items.filter((v) => v.status === 'Pending Verification');

  const handleDecision = async (decision: 'Verified' | 'Flagged Invalid') => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await dataService.decideExternalVerification(
        selected.id,
        decision,
        note.trim() || `Marked as ${decision} after external document check.`
      );
      setNote('');
      await loadQueue();
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VerificationLayout>
      <main className="p-lg md:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
        <header className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface font-semibold m-0">
            {isHistoryRoute ? 'External Verification Audit History (V03)' : 'External Evidence Verification Queue (V01 · V02)'}
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant m-0">
            Verify third-party sponsor permits, ministry letters, and municipal clearances attached to club event proposals.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* List Table (7 cols) */}
          <section className="lg:col-span-7 bg-light-surface-container-lowest border border-light-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-light-outline-variant bg-light-surface-container-low/50">
              <h2 className="font-headline text-headline-sm font-semibold m-0">
                {isHistoryRoute ? `Completed Verifications (${displayed.length})` : `Pending Submissions (${displayed.length})`}
              </h2>
            </div>

            <div className="divide-y divide-light-outline-variant">
              {loading ? (
                <div className="p-xl text-center text-light-on-surface-variant">Loading verification submissions...</div>
              ) : displayed.length === 0 ? (
                <div className="p-xl text-center text-light-on-surface-variant">
                  {isHistoryRoute ? 'No historical decisions recorded.' : 'No external clearance evidence awaiting verification.'}
                </div>
              ) : (
                displayed.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelected(item);
                      setNote(item.reviewer_note || '');
                    }}
                    className={`w-full text-left p-lg flex items-start justify-between gap-md border-0 cursor-pointer transition-colors ${
                      selected?.id === item.id
                        ? 'bg-light-primary-container/10'
                        : 'bg-transparent hover:bg-light-surface-container-low/40'
                    }`}
                  >
                    <div className="flex flex-col gap-xs">
                      <div className="flex items-center gap-xs">
                        <span className="font-mono text-mono-sm text-light-primary font-bold">{item.proposal_code}</span>
                        <span className="text-light-outline">·</span>
                        <span className="font-mono text-mono-sm text-light-on-surface-variant">{item.reference_no}</span>
                      </div>
                      <h3 className="font-title text-title-md text-light-on-surface font-semibold m-0">
                        {item.event_title}
                      </h3>
                      <span className="font-body text-body-sm text-light-on-surface-variant">
                        {item.club_name} · Issuer: <strong>{item.issuer}</strong>
                      </span>
                      {item.reviewer_note && (
                        <span className="font-label text-label-sm text-light-on-surface-variant italic">
                          Decision Note: {item.reviewer_note}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-sm py-0.5 rounded-full font-label text-label-sm shrink-0 ${
                        item.status === 'Verified'
                          ? 'bg-success-container text-on-success-container'
                          : item.status === 'Flagged Invalid'
                          ? 'bg-light-error-container text-light-on-error-container'
                          : 'bg-warning-container text-on-warning-container'
                      }`}
                    >
                      {item.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Inspection Drawer / Panel (5 cols) */}
          <aside className="lg:col-span-5 bg-light-surface-container-lowest border border-light-outline-variant rounded-md p-lg flex flex-col gap-md shadow-sm">
            <h2 className="font-headline text-headline-sm text-light-on-surface font-semibold m-0">
              Evidence Inspection Panel (V02)
            </h2>

            {!selected ? (
              <p className="font-body text-body-md text-light-on-surface-variant m-0">
                Select a verification item from the queue to review attached issuer documents and record authenticity status.
              </p>
            ) : (
              <>
                <div className="p-md rounded bg-light-surface-container-low/50 border border-light-outline-variant flex flex-col gap-xs text-body-md">
                  <div><strong>Proposal:</strong> {selected.proposal_code} · {selected.event_title}</div>
                  <div><strong>External Issuer:</strong> {selected.issuer}</div>
                  <div><strong>Reference Number:</strong> <code className="font-mono">{selected.reference_no}</code></div>
                  <div><strong>Document File:</strong> <span className="font-mono text-light-primary">{selected.document_name}</span></div>
                  <div><strong>Submitted:</strong> {selected.submitted_at}</div>
                </div>

                {selected.status === 'Pending Verification' && (
                  <>
                    <label className="flex flex-col gap-xs">
                      <span className="font-label text-label-md font-semibold">
                        Verification Findings / Authenticity Check Note
                      </span>
                      <textarea
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Record reference confirmation details with issuing authority..."
                        className="px-md py-sm rounded border border-light-outline bg-light-surface-container-lowest resize-none"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-sm pt-xs">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDecision('Flagged Invalid')}
                        className="py-sm px-md rounded bg-light-error-container text-light-on-error-container font-label text-label-md font-semibold border-0 cursor-pointer"
                      >
                        Flag Invalid
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDecision('Verified')}
                        className="py-sm px-md rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold border-0 cursor-pointer"
                      >
                        Verify Authentic
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </aside>
        </div>
      </main>
    </VerificationLayout>
  );
};

export default VerificationQueue;
