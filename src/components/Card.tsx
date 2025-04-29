import React from 'react';

export type CardProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Card({ title, children, className }: CardProps) {
  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 ${className || ''}`}>
      {title && <h2 className="font-semibold text-midnight border-b border-gray-100 pb-3 mb-3">{title}</h2>}
      {children}
    </div>
  );
} 