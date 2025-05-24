"use client";

import { useCommissionsSummary } from "@/hooks/use-commissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
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
      <div className="flex h-40 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex h-40 flex-col items-center justify-center space-y-2">
        <AlertCircle className="h-8 w-8 text-red-500" />
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
        <CardTitle className="text-xl flex items-center">
          <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
          Commission Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryItem
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            label="Total Commission"
            value={formatCurrency(summary.totalCommission)}
          />
          <SummaryItem
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            label="Paid Commission"
            value={formatCurrency(summary.paidCommission)}
          />
          <SummaryItem
            icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
            label="Unpaid Commission"
            value={formatCurrency(summary.unpaidCommission)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground mr-1">Total Records:</span>
            <span className="font-medium">{summary.commissionsCount}</span>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/commissions">
              <History className="h-4 w-4 mr-2" />
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
        <span className="text-lg font-semibold ml-1">{value}</span>
      </div>
    </div>
  );
}
