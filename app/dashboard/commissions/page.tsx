"use client";

import { CommissionList } from "@/components/commissions/commission-list";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText } from "lucide-react";

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commissions</h1>
        <Button variant="outline" asChild>
          <a href="#" onClick={() => window.print()}>
            <FileText className="mr-2 h-4 w-4" /> Export Report
          </a>
        </Button>
      </div>

      <div className="grid gap-6">
        <CommissionList />
      </div>
    </div>
  );
}
