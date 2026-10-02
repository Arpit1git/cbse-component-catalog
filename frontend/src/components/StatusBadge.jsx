import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const normStatus = (status || '').toLowerCase();

  const config = {
    approved: {
      label: 'Approved',
      bg: 'bg-[#2F7D4F]/10',
      text: 'text-[#2F7D4F]',
      border: 'border-[#2F7D4F]/30',
      dot: 'bg-[#2F7D4F]',
    },
    active: {
      label: 'Active',
      bg: 'bg-[#2F7D4F]/10',
      text: 'text-[#2F7D4F]',
      border: 'border-[#2F7D4F]/30',
      dot: 'bg-[#2F7D4F]',
    },
    pending: {
      label: 'Pending Review',
      bg: 'bg-[#B7791F]/10',
      text: 'text-[#B7791F]',
      border: 'border-[#B7791F]/30',
      dot: 'bg-[#B7791F]',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-[#B3402F]/10',
      text: 'text-[#B3402F]',
      border: 'border-[#B3402F]/30',
      dot: 'bg-[#B3402F]',
    },
    deprecated: {
      label: 'Deprecated',
      bg: 'bg-[#7A7F87]/10',
      text: 'text-[#7A7F87]',
      border: 'border-[#7A7F87]/30',
      dot: 'bg-[#7A7F87]',
    },
  };

  const style = config[normStatus] || {
    label: status,
    bg: 'bg-paper-border/20',
    text: 'text-paper-muted',
    border: 'border-paper-border',
    dot: 'bg-paper-muted',
  };

  const sizeClasses = size === 'xs' 
    ? 'text-[11px] px-2 py-0.5' 
    : size === 'md' 
    ? 'text-xs px-2.5 py-1 font-medium'
    : 'text-xs px-2 py-0.5 font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
