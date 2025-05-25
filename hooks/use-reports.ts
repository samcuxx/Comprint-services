import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];
type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

export interface SalesPerformanceData {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topPerformers: {
    sales_person: User;
    total_sales: number;
    total_revenue: number;
  }[];
  salesTrend: {
    date: string;
    sales_count: number;
    revenue: number;
  }[];
}

export interface ProductPerformanceData {
  topProducts: {
    product: Product;
    total_quantity: number;
    total_revenue: number;
    total_profit: number;
  }[];
  categoryPerformance: {
    category_name: string;
    total_quantity: number;
    total_revenue: number;
    product_count: number;
  }[];
  lowStockProducts: {
    product: Product;
    current_stock: number;
    reorder_level: number;
  }[];
}

export interface CustomerReportData {
  topCustomers: {
    customer: Customer;
    total_purchases: number;
    total_spent: number;
    last_purchase_date: string;
  }[];
  customerAcquisition: {
    date: string;
    new_customers: number;
  }[];
  customerRetention: {
    returning_customers: number;
    new_customers: number;
    retention_rate: number;
  };
}

export interface TimeBasedAnalytics {
  dailySales: {
    date: string;
    sales_count: number;
    revenue: number;
    profit: number;
  }[];
  monthlySales: {
    month: string;
    sales_count: number;
    revenue: number;
    profit: number;
  }[];
  salesByHour: {
    hour: number;
    sales_count: number;
    revenue: number;
  }[];
  salesByDayOfWeek: {
    day_of_week: string;
    sales_count: number;
    revenue: number;
  }[];
}

/**
 * Hook to fetch sales performance data
 */
export const useSalesPerformance = (
  filters: {
    startDate?: string;
    endDate?: string;
    salesPersonId?: string;
  } = {}
) => {
  return useQuery<SalesPerformanceData, Error>({
    queryKey: ["sales-performance", filters],
    queryFn: async () => {
      // Build the date filter
      let dateFilter = "";
      if (filters.startDate && filters.endDate) {
        dateFilter = `AND s.sale_date >= '${filters.startDate}' AND s.sale_date <= '${filters.endDate}'`;
      } else if (filters.startDate) {
        dateFilter = `AND s.sale_date >= '${filters.startDate}'`;
      } else if (filters.endDate) {
        dateFilter = `AND s.sale_date <= '${filters.endDate}'`;
      }

      let salesPersonFilter = "";
      if (filters.salesPersonId) {
        salesPersonFilter = `AND s.sales_person_id = '${filters.salesPersonId}'`;
      }

      // Get sales overview
      const { data: salesOverview, error: salesOverviewError } = await supabase
        .from("sales")
        .select("total_amount, payment_status")
        .eq("payment_status", "paid");

      if (salesOverviewError) throw new Error(salesOverviewError.message);

      const totalSales = salesOverview?.length || 0;
      const totalRevenue =
        salesOverview?.reduce(
          (sum, sale) => sum + (sale.total_amount || 0),
          0
        ) || 0;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Get top performers
      const { data: topPerformersData, error: topPerformersError } =
        await supabase
          .from("sales")
          .select(
            `
          sales_person_id,
          total_amount,
          sales_person:sales_person_id (id, full_name, email)
        `
          )
          .eq("payment_status", "paid");

      if (topPerformersError) throw new Error(topPerformersError.message);

      // Group by sales person
      const performerMap = new Map();
      topPerformersData?.forEach((sale) => {
        if (!sale.sales_person) return;

        const personId = sale.sales_person_id;
        const current = performerMap.get(personId) || {
          sales_person: sale.sales_person,
          total_sales: 0,
          total_revenue: 0,
        };

        current.total_sales += 1;
        current.total_revenue += sale.total_amount || 0;
        performerMap.set(personId, current);
      });

      const topPerformers = Array.from(performerMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);

      // Get sales trend (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: salesTrendData, error: salesTrendError } = await supabase
        .from("sales")
        .select("sale_date, total_amount")
        .eq("payment_status", "paid")
        .gte("sale_date", thirtyDaysAgo.toISOString());

      if (salesTrendError) throw new Error(salesTrendError.message);

      // Group by date
      const trendMap = new Map();
      salesTrendData?.forEach((sale) => {
        const date = new Date(sale.sale_date).toISOString().split("T")[0];
        const current = trendMap.get(date) || {
          date,
          sales_count: 0,
          revenue: 0,
        };

        current.sales_count += 1;
        current.revenue += sale.total_amount || 0;
        trendMap.set(date, current);
      });

      const salesTrend = Array.from(trendMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      return {
        totalSales,
        totalRevenue,
        averageOrderValue,
        topPerformers,
        salesTrend,
      };
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch product performance data
 */
export const useProductPerformance = (
  filters: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  } = {}
) => {
  return useQuery<ProductPerformanceData, Error>({
    queryKey: ["product-performance", filters],
    queryFn: async () => {
      // Get top selling products
      const { data: topProductsData, error: topProductsError } =
        await supabase.from("sale_items").select(`
          product_id,
          quantity,
          unit_price,
          product:product_id (*)
        `);

      if (topProductsError) throw new Error(topProductsError.message);

      // Group by product
      const productMap = new Map();
      topProductsData?.forEach((item) => {
        if (!item.product) return;

        const productId = item.product_id;
        const current = productMap.get(productId) || {
          product: item.product,
          total_quantity: 0,
          total_revenue: 0,
          total_profit: 0,
        };

        const itemRevenue = (item.quantity || 0) * (item.unit_price || 0);
        const itemProfit =
          (item.quantity || 0) *
          ((item.unit_price || 0) - (item.product.cost_price || 0));

        current.total_quantity += item.quantity || 0;
        current.total_revenue += itemRevenue;
        current.total_profit += itemProfit;
        productMap.set(productId, current);
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10);

      // Get category performance
      const { data: categoryData, error: categoryError } = await supabase.from(
        "sale_items"
      ).select(`
          quantity,
          unit_price,
          product:product_id (
            category_id,
            cost_price,
            product_category:category_id (name)
          )
        `);

      if (categoryError) throw new Error(categoryError.message);

      // Group by category
      const categoryMap = new Map();
      categoryData?.forEach((item) => {
        if (!item.product?.product_category) return;

        const categoryName = item.product.product_category.name;
        const current = categoryMap.get(categoryName) || {
          category_name: categoryName,
          total_quantity: 0,
          total_revenue: 0,
          product_count: new Set(),
        };

        current.total_quantity += item.quantity || 0;
        current.total_revenue += (item.quantity || 0) * (item.unit_price || 0);
        current.product_count.add(item.product.id);
        categoryMap.set(categoryName, current);
      });

      const categoryPerformance = Array.from(categoryMap.values()).map(
        (cat) => ({
          ...cat,
          product_count: cat.product_count.size,
        })
      );

      // Get low stock products
      const { data: allInventoryData, error: inventoryError } =
        await supabase.from("inventory").select(`
          product_id,
          quantity,
          reorder_level,
          product:product_id (*)
        `);

      if (inventoryError) throw new Error(inventoryError.message);

      const lowStockProducts =
        allInventoryData
          ?.filter((item) => item.quantity < item.reorder_level)
          .map((item) => ({
            product: item.product,
            current_stock: item.quantity,
            reorder_level: item.reorder_level,
          })) || [];

      return {
        topProducts,
        categoryPerformance,
        lowStockProducts,
      };
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch customer reports data
 */
export const useCustomerReports = (
  filters: {
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  return useQuery<CustomerReportData, Error>({
    queryKey: ["customer-reports", filters],
    queryFn: async () => {
      // Get top customers
      const { data: customerSalesData, error: customerSalesError } =
        await supabase
          .from("sales")
          .select(
            `
          customer_id,
          total_amount,
          sale_date,
          customer:customer_id (*)
        `
          )
          .eq("payment_status", "paid")
          .not("customer_id", "is", null);

      if (customerSalesError) throw new Error(customerSalesError.message);

      // Group by customer
      const customerMap = new Map();
      customerSalesData?.forEach((sale) => {
        if (!sale.customer) return;

        const customerId = sale.customer_id;
        const current = customerMap.get(customerId) || {
          customer: sale.customer,
          total_purchases: 0,
          total_spent: 0,
          last_purchase_date: sale.sale_date,
        };

        current.total_purchases += 1;
        current.total_spent += sale.total_amount || 0;

        if (new Date(sale.sale_date) > new Date(current.last_purchase_date)) {
          current.last_purchase_date = sale.sale_date;
        }

        customerMap.set(customerId, current);
      });

      const topCustomers = Array.from(customerMap.values())
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 10);

      // Customer acquisition (placeholder for now)
      const customerAcquisition: { date: string; new_customers: number }[] = [];

      // Customer retention (simplified calculation)
      const customerRetention = {
        returning_customers: 0,
        new_customers: topCustomers.length,
        retention_rate: 0,
      };

      return {
        topCustomers,
        customerAcquisition,
        customerRetention,
      };
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch time-based analytics
 */
export const useTimeBasedAnalytics = (
  filters: {
    startDate?: string;
    endDate?: string;
  } = {}
) => {
  return useQuery<TimeBasedAnalytics, Error>({
    queryKey: ["time-based-analytics", filters],
    queryFn: async () => {
      // Get sales data with items for profit calculation
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select(
          `
          sale_date,
          total_amount,
          sale_items (
            quantity,
            unit_price,
            product:product_id (cost_price)
          )
        `
        )
        .eq("payment_status", "paid");

      if (salesError) throw new Error(salesError.message);

      // Daily sales
      const dailyMap = new Map();
      salesData?.forEach((sale) => {
        const date = new Date(sale.sale_date).toISOString().split("T")[0];
        const current = dailyMap.get(date) || {
          date,
          sales_count: 0,
          revenue: 0,
          profit: 0,
        };

        current.sales_count += 1;
        current.revenue += sale.total_amount || 0;

        // Calculate profit from sale items
        const saleProfit =
          sale.sale_items?.reduce((profit, item) => {
            const itemProfit =
              (item.quantity || 0) *
              ((item.unit_price || 0) - (item.product?.cost_price || 0));
            return profit + itemProfit;
          }, 0) || 0;

        current.profit += saleProfit;
        dailyMap.set(date, current);
      });

      const dailySales = Array.from(dailyMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      // Monthly sales
      const monthlyMap = new Map();
      salesData?.forEach((sale) => {
        const month = new Date(sale.sale_date).toISOString().substring(0, 7); // YYYY-MM
        const current = monthlyMap.get(month) || {
          month,
          sales_count: 0,
          revenue: 0,
          profit: 0,
        };

        current.sales_count += 1;
        current.revenue += sale.total_amount || 0;

        const saleProfit =
          sale.sale_items?.reduce((profit, item) => {
            const itemProfit =
              (item.quantity || 0) *
              ((item.unit_price || 0) - (item.product?.cost_price || 0));
            return profit + itemProfit;
          }, 0) || 0;

        current.profit += saleProfit;
        monthlyMap.set(month, current);
      });

      const monthlySales = Array.from(monthlyMap.values()).sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      // Sales by hour
      const hourlyMap = new Map();
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, { hour: i, sales_count: 0, revenue: 0 });
      }

      salesData?.forEach((sale) => {
        const hour = new Date(sale.sale_date).getHours();
        const current = hourlyMap.get(hour);
        if (current) {
          current.sales_count += 1;
          current.revenue += sale.total_amount || 0;
        }
      });

      const salesByHour = Array.from(hourlyMap.values());

      // Sales by day of week
      const dayOfWeekMap = new Map([
        [0, { day_of_week: "Sunday", sales_count: 0, revenue: 0 }],
        [1, { day_of_week: "Monday", sales_count: 0, revenue: 0 }],
        [2, { day_of_week: "Tuesday", sales_count: 0, revenue: 0 }],
        [3, { day_of_week: "Wednesday", sales_count: 0, revenue: 0 }],
        [4, { day_of_week: "Thursday", sales_count: 0, revenue: 0 }],
        [5, { day_of_week: "Friday", sales_count: 0, revenue: 0 }],
        [6, { day_of_week: "Saturday", sales_count: 0, revenue: 0 }],
      ]);

      salesData?.forEach((sale) => {
        const dayOfWeek = new Date(sale.sale_date).getDay();
        const current = dayOfWeekMap.get(dayOfWeek);
        if (current) {
          current.sales_count += 1;
          current.revenue += sale.total_amount || 0;
        }
      });

      const salesByDayOfWeek = Array.from(dayOfWeekMap.values());

      return {
        dailySales,
        monthlySales,
        salesByHour,
        salesByDayOfWeek,
      };
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
