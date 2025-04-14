'use client';

import { Loader2 } from "lucide-react";

export default function SubmissionSpinner() {
  return (
    <Loader2 className="h-4 w-4 animate-spin text-mainbg1" />
  );
}