import React from 'react';
import { Eye } from 'lucide-react';
import { mockUserData } from '../mock/userData';

export default function GuardianStatusBar() {
  const activeGuardian = mockUserData.guardians.find(g => g.watching);

  if (!activeGuardian) return null;

  return (
    <div className="bg-safe/10 border-b border-safe/30 p-2 flex items-center justify-center gap-2 text-safe text-sm font-medium">
      <Eye className="w-4 h-4" />
      <span>{activeGuardian.name} is watching • Online</span>
      <div className="w-2 h-2 rounded-full bg-safe custom-pulse ml-1"></div>
    </div>
  );
}
