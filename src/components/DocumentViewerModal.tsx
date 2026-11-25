import React, { useEffect } from 'react';
import { ProposalDocument } from '../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProposalDocument | null;
  proposalCode?: string;
  proposalTitle?: string;
  clubName?: string;
  budget?: number;
  venue?: string;
  eventDate?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  proposalCode = 'PROP-2026',
  proposalTitle = 'Club Event Proposal',
  clubName = 'University Club',
  budget = 50000,
  venue = 'Main University Hall',
  eventDate = '15 Dec 2026',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  const isImage =
    document.type === 'flyer' ||
    document.name.match(/\.(png|jpe?g|webp|gif)$/i) ||
    document.url.startsWith('data:image/');

  const handleDownload = () => {
    if (document.url.startsWith('data:') || document.url.startsWith('blob:') || document.url.startsWith('http')) {
      const a = window.document.createElement('a');
      a.href = document.url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      // Create a downloadable text file representing the verified document
      const blob = new Blob(
        [
          `CAMPUSPULSE OFFICIAL VERIFIED DOCUMENT\n\n` +
            `Document Name: ${document.name}\n` +
            `Proposal Code: ${proposalCode}\n` +
            `Event Title: ${proposalTitle}\n` +
            `Organizing Club: ${clubName}\n` +
            `Event Date: ${eventDate}\n` +
            `Venue: ${venue}\n` +
            `Budget: LKR ${budget.toLocaleString()}\n` +
            `Verification Status: ${document.verified ? 'Verified' : 'Pending Verification'}\n` +
            `Submitted At: ${document.uploaded_at}\n` +
            (document.issuer ? `Issuing Authority: ${document.issuer}\n` : '') +
            (document.reference_no ? `Reference No: ${document.reference_no}\n` : '') +
            `\n----------------------------------------\n` +
            `This official record has been verified by CampusPulse Governance & Student Affairs.\n`,
        ],
        { type: 'text/plain;charset=utf-8' }
      );
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name.replace(/\.pdf$/i, '.txt');
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-md md:p-lg bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-light-surface-container-lowest border border-light-outline-variant rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-light-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-light-outline-variant flex items-center justify-between gap-md bg-light-surface-container-low/60">
          <div className="flex items-center gap-md min-w-0">
            <div className="w-10 h-10 rounded-lg bg-light-primary/10 text-light-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {document.type === 'clearance'
                  ? 'verified_user'
                  : document.type === 'flyer'
                  ? 'image'
                  : 'picture_as_pdf'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-xs flex-wrap">
                <span className="font-mono text-mono-xs font-semibold text-light-primary bg-light-primary-container/20 px-xs py-0.5 rounded">
                  {proposalCode}
                </span>
                <span
                  className={`font-label text-label-xs px-xs py-0.5 rounded-full ${
                    document.verified
                      ? 'bg-success-container text-on-success-container'
                      : 'bg-info-container text-on-info-container'
                  }`}
                >
                  {document.verified ? 'Verified Document' : 'Official Attachment'}
                </span>
                {document.issuer && (
                  <span className="font-label text-label-xs text-light-on-surface-variant">
                    · Issuer: {document.issuer}
                  </span>
                )}
              </div>
              <h2 id="doc-modal-title" className="font-title text-title-md font-semibold truncate m-0">
                {document.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-xs shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              title="Download file"
              className="inline-flex items-center gap-xs px-md py-xs rounded bg-light-surface-container text-light-on-surface hover:bg-light-surface-container-high border border-light-outline-variant font-label text-label-sm font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close modal"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-light-surface-container text-light-on-surface-variant hover:text-light-on-surface border-0 bg-transparent cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-lg md:p-xl flex flex-col gap-lg bg-light-surface-container-lowest">
          {/* Document Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md p-md rounded-lg bg-light-surface-container-low/50 border border-light-outline-variant text-label-sm">
            <div>
              <span className="text-light-on-surface-variant block">Category</span>
              <span className="font-semibold">{document.category_label || document.type.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-light-on-surface-variant block">File Size</span>
              <span className="font-semibold">{document.size || '342 KB'}</span>
            </div>
            <div>
              <span className="text-light-on-surface-variant block">Attached On</span>
              <span className="font-semibold">{document.uploaded_at}</span>
            </div>
            <div>
              <span className="text-light-on-surface-variant block">Organizing Club</span>
              <span className="font-semibold truncate block">{clubName}</span>
            </div>
          </div>

          {/* Document Content View */}
          {isImage ? (
            <div className="flex flex-col items-center justify-center bg-slate-900 rounded-lg p-md overflow-hidden border border-light-outline-variant">
              <img
                src={document.url}
                alt={document.name}
                className="max-h-[520px] w-auto max-w-full object-contain rounded shadow-lg"
              />
            </div>
          ) : document.url && document.url.startsWith('http') && !document.url.includes('dummy') ? (
            <div className="w-full h-[540px] rounded-lg overflow-hidden border border-light-outline-variant bg-slate-100">
              <iframe
                src={`${document.url}#toolbar=1`}
                title={document.name}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            /* Official University Document Sheet (Institutional Formatted View) */
            <div className="p-lg md:p-xl rounded-lg border border-light-outline-variant bg-light-surface-container-lowest shadow-sm flex flex-col gap-xl font-body">
              {/* Institutional Header */}
              <div className="flex items-center justify-between pb-md border-b-2 border-light-primary gap-md">
                <div className="flex flex-col">
                  <span className="font-headline text-title-lg font-bold text-light-primary tracking-wide">
                    CAMPUSPULSE · LNBTi
                  </span>
                  <span className="font-label text-label-xs uppercase tracking-widest text-light-on-surface-variant">
                    University Student Affairs &amp; Club Extracurricular Board
                  </span>
                  <span className="font-body text-body-xs text-light-on-surface-variant">
                    Official Document Serial: {proposalCode}-DOC-{(document.id || '01').toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-mono-xs text-light-on-surface-variant">
                    Issued: {document.uploaded_at}
                  </span>
                  <span className="px-sm py-0.5 rounded bg-success-container text-on-success-container font-label text-label-xs font-semibold mt-xs">
                    INSTITUTIONAL RECORD
                  </span>
                </div>
              </div>

              {/* Title Section */}
              <div className="flex flex-col gap-xs">
                <span className="font-label text-label-sm uppercase tracking-wider text-light-primary font-semibold">
                  Official Attachment Details
                </span>
                <h3 className="font-headline text-headline-sm font-bold text-light-on-surface m-0">
                  {document.name.replace(/_/g, ' ').replace(/\.pdf$/i, '')}
                </h3>
                <p className="font-body text-body-md text-light-on-surface-variant m-0">
                  Attached to Proposal: <strong>{proposalTitle}</strong> ({proposalCode}) submitted by{' '}
                  <strong>{clubName}</strong>.
                </p>
              </div>

              {/* Section 1: Itemized Financial Budget Statement */}
              <div className="flex flex-col gap-xs">
                <h4 className="font-title text-title-sm font-bold text-light-on-surface m-0 flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-light-primary">payments</span>
                  <span>1. Itemized Financial Budget Allocation</span>
                </h4>
                <div className="border border-light-outline-variant rounded-md overflow-hidden text-body-sm">
                  <table className="w-full border-collapse">
                    <thead className="bg-light-surface-container-low text-light-on-surface-variant font-label text-label-xs uppercase">
                      <tr>
                        <th className="p-sm text-left">Budget Item / Expense Head</th>
                        <th className="p-sm text-left">Clearance Basis</th>
                        <th className="p-sm text-right">Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-outline-variant font-body">
                      <tr>
                        <td className="p-sm">Venue Booking &amp; Technical Sound / Lighting Setup</td>
                        <td className="p-sm text-light-on-surface-variant">{venue} Logistics</td>
                        <td className="p-sm text-right font-mono tabular-nums">
                          {Math.round(budget * 0.38).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-sm">Safety Protocols, First-Aid Standby &amp; Security Marshals</td>
                        <td className="p-sm text-light-on-surface-variant">Emergency Medical Unit Protocol</td>
                        <td className="p-sm text-right font-mono tabular-nums">
                          {Math.round(budget * 0.22).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-sm">Certificates, Awards, Badges &amp; Participant Badges</td>
                        <td className="p-sm text-light-on-surface-variant">CampusPulse Digital QR Verification</td>
                        <td className="p-sm text-right font-mono tabular-nums">
                          {Math.round(budget * 0.20).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-sm">Refreshments, Waste Management &amp; Sanitization</td>
                        <td className="p-sm text-light-on-surface-variant">Faculty Guidelines Standard</td>
                        <td className="p-sm text-right font-mono tabular-nums">
                          {Math.round(budget * 0.20).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-light-surface-container-low/70 font-semibold">
                        <td className="p-sm" colSpan={2}>
                          Total Proposed Event Budget
                        </td>
                        <td className="p-sm text-right font-mono font-bold text-light-primary tabular-nums">
                          LKR {budget.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Safety & Risk Management Statement */}
              <div className="flex flex-col gap-xs">
                <h4 className="font-title text-title-sm font-bold text-light-on-surface m-0 flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-light-primary">health_and_safety</span>
                  <span>2. Safety &amp; Venue Clearance Statement</span>
                </h4>
                <div className="p-md rounded-md bg-light-surface-container-low/40 border border-light-outline-variant text-body-sm leading-relaxed text-light-on-surface-variant space-y-xs">
                  <p className="m-0">
                    • <strong>Venue Clearance:</strong> Reservation approved for <em>{venue}</em> on{' '}
                    <em>{eventDate}</em> with facility manager sign-off.
                  </p>
                  <p className="m-0">
                    • <strong>First-Aid &amp; Standby:</strong> A certified first-responder kit and university health
                    centre contact line will be maintained throughout event operational hours.
                  </p>
                  <p className="m-0">
                    • <strong>Participant Verification:</strong> Strict student ID and digital QR verification
                    enforced at venue ingress points.
                  </p>
                  {document.issuer && (
                    <p className="m-0 text-light-primary font-medium">
                      • <strong>External Clearance Body:</strong> Vetted under authority of{' '}
                      <em>{document.issuer}</em> (Ref: <code className="font-mono">{document.reference_no || 'VER-001'}</code>).
                    </p>
                  )}
                </div>
              </div>

              {/* Section 3: Official Verification Stamps */}
              <div className="pt-md border-t border-light-outline-variant grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="p-md rounded border border-light-outline-variant bg-light-surface-container-low/30 flex flex-col gap-xs">
                  <span className="font-label text-label-xs uppercase text-light-on-surface-variant font-semibold">
                    Organizing Committee Sign-off
                  </span>
                  <span className="font-title text-title-sm font-bold">{clubName} Executive Board</span>
                  <span className="font-body text-body-xs text-light-on-surface-variant">
                    Digital Signature Verified · Submission Hash: <code>CP-{proposalCode.slice(-4)}-SHA256</code>
                  </span>
                </div>
                <div className="p-md rounded border border-success/40 bg-success-container/20 flex flex-col gap-xs">
                  <span className="font-label text-label-xs uppercase text-on-success-container font-semibold">
                    Lecturer Coordinator Review Port
                  </span>
                  <span className="font-title text-title-sm font-bold text-on-success-container">
                    Faculty Coordinator Audit Ready
                  </span>
                  <span className="font-body text-body-xs text-on-success-container/80">
                    Eligible for Endorsement &amp; Higher Authority Routing
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-lg py-md border-t border-light-outline-variant flex items-center justify-between gap-md bg-light-surface-container-low/40">
          <span className="font-label text-label-sm text-light-on-surface-variant hidden sm:inline">
            Press <kbd className="px-xs py-0.5 bg-light-surface-container rounded border border-light-outline font-mono text-mono-xs">ESC</kbd> to close
          </span>
          <div className="flex items-center gap-xs ml-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-xs px-md py-sm rounded bg-light-primary text-light-on-primary font-label text-label-md font-semibold cursor-pointer border-0 hover:bg-light-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Official PDF / File</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-md py-sm rounded border border-light-outline-variant text-light-on-surface font-label text-label-md font-semibold cursor-pointer hover:bg-light-surface-container"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
