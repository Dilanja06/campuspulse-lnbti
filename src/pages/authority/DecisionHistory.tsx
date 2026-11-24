import React, { useState, useEffect } from 'react';
import { AuthorityLayout } from '../../components/AuthorityLayout';
import { dataService } from '../../services/dataService';
import { DecisionRecord } from '../../types';

export const DecisionHistory: React.FC = () => {
  const [history, setHistory] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const records = await dataService.getAuthorityDecisionHistory();
        setHistory(records);
      } catch (err) {
        console.error('Failed to load authority decision history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <AuthorityLayout>
      <main className="flex-1 p-xl max-w-[1280px] w-full mx-auto flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h1 className="font-headline text-headline-lg text-light-on-surface">
            Decision History
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant">
            Completed approval decisions and official remarks recorded under your authority.
          </p>
        </div>

        <section
          aria-label="Decision history table"
          className="bg-light-surface-container-lowest border border-light-outline-variant rounded-md overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-surface-container-low border-b border-light-outline-variant">
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Proposal ID
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Event &amp; Club
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Decision Date
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Outcome
                  </th>
                  <th className="px-md py-md font-label text-label-md text-light-on-surface-variant whitespace-nowrap">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-md py-xl text-center text-light-on-surface-variant font-body">
                      Loading decision records...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-md py-xl text-center text-light-on-surface-variant font-body">
                      No decision history recorded yet.
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-light-surface-container-low transition-colors duration-state-change">
                      <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                        {record.code}
                      </td>
                      <td className="px-md py-md">
                        <div className="flex flex-col">
                          <span className="font-title text-title-md text-light-on-surface whitespace-nowrap font-medium">
                            {record.event_title}
                          </span>
                          <span className="font-body text-body-md text-light-on-surface-variant">
                            {record.club_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-md py-md font-mono text-mono-md text-light-on-surface-variant tabular-nums whitespace-nowrap">
                        {record.date}
                      </td>
                      <td className="px-md py-md whitespace-nowrap">
                        <span
                          role="status"
                          className={`inline-flex items-center gap-xs px-sm py-xs rounded-full whitespace-nowrap ${
                            record.outcome === 'Approved'
                              ? 'bg-success-container text-on-success-container'
                              : record.outcome === 'Returned'
                              ? 'bg-warning-container text-on-warning-container'
                              : 'bg-light-error-container text-light-on-error-container'
                          }`}
                        >
                          <span className="font-label text-label-sm font-semibold">
                            {record.outcome}
                          </span>
                        </span>
                      </td>
                      <td className="px-md py-md font-body text-body-md text-light-on-surface-variant">
                        {record.remarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AuthorityLayout>
  );
};

export default DecisionHistory;
