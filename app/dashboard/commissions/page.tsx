"use client";

import { useState } from "react";
import { CommissionList } from "@/components/commissions/commission-list";
import { CommissionReportPrint } from "@/components/commissions/commission-report-print";
import { useCommissions } from "@/hooks/use-commissions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function CommissionsPage() {
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Get current user to check role and apply appropriate filters
  const { data: currentUser } = useCurrentUser();
  const isSales = currentUser?.role === "sales";

  // Fetch commissions data for the report
  const { data: commissions = [] } = useCommissions(
    isSales ? { salesPersonId: currentUser?.id } : {}
  );

  const handleExportReport = () => {
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commissions</h1>
        <Button variant="outline" onClick={handleExportReport}>
          <FileText className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid gap-6">
        <CommissionList />
      </div>

      {/* Print Modal */}
      <CommissionReportPrint
        commissions={commissions}
        filters={isSales ? { salesPersonId: currentUser?.id } : {}}
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
      />
    </div>
  );
}
