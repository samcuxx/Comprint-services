"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/lib/types";

interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  dailyTransactions: number;
  dailyAmount: number;
}

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalAmount: 0,
    dailyTransactions: 0,
    dailyAmount: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const query = supabase.from("transactions").select("*");

        // If not admin, only show user's own transactions
        if (userRole !== "admin") {
          query.eq("user_id", user?.id);
        }

        const { data: transactions } = await query;

        if (transactions) {
          const dailyTransactions = transactions.filter((t) =>
            t.created_at.startsWith(today)
          );

          setStats({
            totalTransactions: transactions.length,
            totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
            dailyTransactions: dailyTransactions.length,
            dailyAmount: dailyTransactions.reduce(
              (sum, t) => sum + t.amount,
              0
            ),
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    if (user) {
      fetchStats();
    }
  }, [user, userRole]);

  // Different titles based on user role
  const getAmountTitle = () => {
    switch (userRole) {
      case "sales":
        return "Sales Amount";
      case "technician":
        return "Service Amount";
      default:
        return "Total Amount";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getAmountTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's {getAmountTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.dailyAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
