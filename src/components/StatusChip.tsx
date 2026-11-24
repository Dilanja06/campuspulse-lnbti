import React from 'react';
import { StatusType } from '../types';

interface StatusChipProps {
  label: string;
  status: StatusType | string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ label, status, className = '' }) => {
  let colorClasses = 'bg-light-surface-container-high text-light-on-surface-variant';

  switch (status.toLowerCase()) {
    case 'published':
    case 'confirmed':
    case 'active':
    case 'issued':
    case 'success':
    case 'successful':
      colorClasses = 'bg-success-container text-success';
      break;
    case 'warning':
    case 'pending':
    case 'payment_pending':
    case 'requirements pending':
      colorClasses = 'bg-warning-container text-on-warning-container';
      break;
    case 'info':
    case 'following':
      colorClasses = 'bg-info-container text-on-info-container';
      break;
    case 'error':
    case 'cancelled':
    case 'rejected':
      colorClasses = 'bg-light-error-container text-light-on-error-container';
      break;
    case 'closed':
    case 'expired':
    case 'neutral':
    default:
      colorClasses = 'bg-light-surface-container-high text-light-on-surface-variant';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-label-sm font-label font-medium ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      <span>{label}</span>
    </span>
  );
};

export default StatusChip;
