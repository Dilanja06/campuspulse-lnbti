import { ProposalItem, ProposalDocument } from '../types';
import { initialExternalVerifications } from '../data/mockData';
import { getEventFlyerImage } from './eventImages';

export function getProposalDocuments(proposal: ProposalItem | null): ProposalDocument[] {
  if (!proposal) return [];

  const list: ProposalDocument[] = [];

  // 1. Explicit proposal.documents array if present
  if (proposal.documents && proposal.documents.length > 0) {
    list.push(...proposal.documents);
  }

  // 2. Primary proposal document (from document_name / document_url)
  const primaryName = proposal.document_name || `${proposal.title.replace(/[^a-zA-Z0-9]/g, '_')}_Budget_and_Safety_Proposal.pdf`;
  const primaryUrl = proposal.document_url || '';
  const alreadyHasPrimary = list.some((d) => d.name === primaryName || d.type === 'budget');

  if (!alreadyHasPrimary) {
    list.unshift({
      id: `doc-budget-${proposal.id}`,
      name: primaryName,
      url: primaryUrl,
      type: 'budget',
      category_label: 'Budget & Safety Proposal PDF',
      size: '428 KB',
      uploaded_at: proposal.submitted_at || 'Nov 2026',
      verified: proposal.status === 'Approved' || proposal.status === 'Higher Authority' || proposal.stage >= 3,
    });
  }

  // 3. External Body Clearance Letters (if applicable)
  const matchingVerifications = initialExternalVerifications.filter(
    (v) => v.proposal_id === proposal.id || v.proposal_code === proposal.code
  );

  matchingVerifications.forEach((ver) => {
    const exists = list.some((d) => d.name === ver.document_name);
    if (!exists) {
      list.push({
        id: `doc-ext-${ver.id}`,
        name: ver.document_name,
        url: ver.document_url || '',
        type: 'clearance',
        category_label: 'External Authority Clearance Letter',
        size: '315 KB',
        uploaded_at: ver.submitted_at,
        issuer: ver.issuer,
        reference_no: ver.reference_no,
        verified: ver.status === 'Verified',
      });
    }
  });

  // If proposal mentions external clearance but not in initialExternalVerifications, synthesize one
  if (
    proposal.external_approval &&
    proposal.external_approval.toLowerCase().includes('yes') &&
    !list.some((d) => d.type === 'clearance')
  ) {
    list.push({
      id: `doc-ext-${proposal.id}`,
      name: `${proposal.club_name.replace(/[^a-zA-Z0-9]/g, '_')}_External_Clearance_Permit.pdf`,
      url: '',
      type: 'clearance',
      category_label: 'External Body Clearance Permit',
      size: '280 KB',
      uploaded_at: proposal.submitted_at,
      issuer: 'University Facilities & External Regulatory Board',
      reference_no: `EXT-${proposal.code.slice(-4)}-26`,
      verified: proposal.stage >= 3,
    });
  }

  // 4. Official Flyer / Poster Asset
  const flyerUrl = proposal.image_url || getEventFlyerImage(proposal);
  if (flyerUrl && !list.some((d) => d.type === 'flyer')) {
    list.push({
      id: `doc-flyer-${proposal.id}`,
      name: `${proposal.code}_Official_Event_Flyer.png`,
      url: flyerUrl,
      type: 'flyer',
      category_label: 'Event Flyer / Public Poster',
      size: '860 KB',
      uploaded_at: proposal.submitted_at,
      verified: true,
    });
  }

  return list;
}
