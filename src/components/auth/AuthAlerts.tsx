"use client";

import React from "react";

export function AuthAlerts({ error, success }: { error?: string | null; success?: string | null }) {
  return (
    <div className="min-h-10">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-primary/15 p-3 text-sm text-primary">{success}</div>
      )}
    </div>
  );
}

export default AuthAlerts;
