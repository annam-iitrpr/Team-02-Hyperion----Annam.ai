"use client";

import React from "react";
import { AppShell } from "@/components/AppShell";
import { VertexAIPipelineView } from "@/components/VertexAIPipelineView";

export default function PipelinePage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <VertexAIPipelineView />
      </div>
    </AppShell>
  );
}
