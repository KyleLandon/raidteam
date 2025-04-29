'use client';
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export function generateStaticParams() { return []; }

import AdminClient from './AdminClient';

export default function AdminPage() {
  return <AdminClient />;
} 