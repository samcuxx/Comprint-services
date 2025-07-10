"use client";

import { useCommissionsSummary } from "@/hooks/use-commissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {

  CircleDollarSign,
  CheckCircle,
  AlertCircle,
  History,
} from "lucide-react";
import Link from "next/link";

interface CommissionSummaryProps {
  salesPersonId: string;
}

export function CommissionSummary({ salesPersonId }: CommissionSummaryProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useCommissionsSummary(salesPersonId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loading />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-2">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Failed to load commission summary"}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <CircleDollarSign className="w-5 h-5 mr-2 text-primary" />
          Commission Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryItem
            icon={<span> ₵ </span>}
            label="Total Commission"
            value={formatCurrency(summary.totalCommission)}
          />
          <SummaryItem
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            label="Paid Commission"
            value={formatCurrency(summary.paidCommission)}
          />
          <SummaryItem
            icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
            label="Unpaid Commission"
            value={formatCurrency(summary.unpaidCommission)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="mr-1 text-muted-foreground">Total Records:</span>
            <span className="font-medium">{summary.commissionsCount}</span>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/commissions">
              <History className="w-4 h-4 mr-2" />
              View All Commissions
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SummaryItem({ icon, label, value }: SummaryItemProps) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex items-center">
        {icon}
        <span className="ml-1 text-lg font-semibold">{value}</span>
      </div>
    </div>
  );
}
