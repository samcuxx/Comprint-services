"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface CommissionReportData {
  id: string;
  commission_amount: number;
  is_paid: boolean;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  sale?: {
    id: string;
    invoice_number: string;
    sale_date: string;
    total_amount: number;
    customer?: {
      name: string;
    };
  };
  sales_person?: {
    id: string;
    full_name: string;
    staff_id: string;
    email?: string;
  };
}

interface CommissionReportPrintProps {
  commissions: CommissionReportData[];
  filters: {
    startDate?: string;
    endDate?: string;
    salesPersonId?: string;
    isPaid?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function CommissionReportPrint({
  commissions,
  filters,
  isOpen,
  onClose,
}: CommissionReportPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000 !important;
          background: white !important;
        }

        .report-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          background: white !important;
          color: #000 !important;
        }

        .report-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }

        .company-info h1 {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af !important;
          margin-bottom: 8px;
        }

        .company-info p {
          color: #4a5568 !important;
          margin-bottom: 4px;
        }

        .report-title {
          margin-top: 20px;
        }

        .report-title h2 {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af !important;
          margin-bottom: 8px;
        }

        .report-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .report-info {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc !important;
        }

        .report-info h3 {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748 !important;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .info-label {
          color: #4a5568 !important;
          font-weight: 500;
        }

        .info-value {
          font-weight: 600;
          color: #000 !important;
        }

        .summary-section {
          margin-bottom: 40px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .summary-card {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
          background: #f8fafc !important;
        }

        .summary-card h4 {
          font-size: 12px;
          font-weight: 600;
          color: #4a5568 !important;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-card .amount {
          font-size: 18px;
          font-weight: bold;
          color: #000 !important;
        }

        .commission-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: white !important;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .commission-table th {
          background: #f1f5f9 !important;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          color: #2d3748 !important;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .commission-table th:last-child,
        .commission-table td:last-child {
          text-align: right;
        }

        .commission-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
          font-size: 11px;
        }

        .commission-table tbody tr:last-child td {
          border-bottom: none;
        }

        .sales-person-header {
          background: #e2e8f0 !important;
          font-weight: bold;
          color: #000 !important;
        }

        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-paid {
          background: #dcfce7 !important;
          color: #166534 !important;
        }

        .status-unpaid {
          background: #fef3c7 !important;
          color: #92400e !important;
        }

        .page-break {
          page-break-before: always;
        }

        .report-footer {
          border-top: 2px solid #e2e8f0;
          padding-top: 20px;
          text-align: center;
          color: #4a5568 !important;
          font-size: 10px;
          margin-top: 40px;
        }

        .footer-line {
          margin-bottom: 4px;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .report-container {
            max-width: none;
            margin: 0;
            padding: 20px;
          }
          
          .no-print {
            display: none;
          }

          .page-break {
            page-break-before: always;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Commission Report - ${format(
            new Date(),
            "MMM d, yyyy"
          )}</title>
          ${styles}
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Calculate summary statistics
  const summary = {
    totalCommissions: commissions.length,
    totalAmount: commissions.reduce(
      (sum, comm) => sum + comm.commission_amount,
      0
    ),
    paidAmount: commissions
      .filter((comm) => comm.is_paid)
      .reduce((sum, comm) => sum + comm.commission_amount, 0),
    unpaidAmount: commissions
      .filter((comm) => !comm.is_paid)
      .reduce((sum, comm) => sum + comm.commission_amount, 0),
    paidCount: commissions.filter((comm) => comm.is_paid).length,
  };

  // Group commissions by sales person
  const groupedBySalesPerson = commissions.reduce((groups, commission) => {
    if (!commission.sales_person) return groups;

    const key = commission.sales_person.id;
    if (!groups[key]) {
      groups[key] = {
        salesPerson: commission.sales_person,
        commissions: [],
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
      };
    }

    groups[key].commissions.push(commission);
    groups[key].totalAmount += commission.commission_amount;

    if (commission.is_paid) {
      groups[key].paidAmount += commission.commission_amount;
    } else {
      groups[key].unpaidAmount += commission.commission_amount;
    }

    return groups;
  }, {} as Record<string, any>);

  const salesPersonGroups = Object.values(groupedBySalesPerson);

  // Get filter descriptions
  const getFilterDescription = () => {
    const descriptions = [];

    if (filters.startDate) {
      descriptions.push(
        `From: ${format(new Date(filters.startDate), "MMM d, yyyy")}`
      );
    }
    if (filters.endDate) {
      descriptions.push(
        `To: ${format(new Date(filters.endDate), "MMM d, yyyy")}`
      );
    }
    if (filters.isPaid !== undefined) {
      descriptions.push(`Status: ${filters.isPaid ? "Paid" : "Unpaid"}`);
    }

    return descriptions.length > 0
      ? descriptions.join(" • ")
      : "All Commissions";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col text-black"
        style={{ backgroundColor: "white", color: "black" }}
      >
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 border-b no-print">
          <h3 className="text-lg font-semibold">Commission Report Preview</h3>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Report content */}
        <div className="flex-1 p-4 overflow-auto bg-white">
          <div
            ref={printRef}
            className="text-black bg-white report-container"
            style={{ backgroundColor: "white", color: "black" }}
          >
            {/* Header */}
            <div className="report-header">
              <div className="company-info">
                <h1>Comprint Services</h1>
                <p>Bompata</p>
                <p>Kumasi - Ghana</p>
                <p>Phone: +233 24-463-9827</p>
                <p>Email: boadiemmanuel@gmail.com</p>
              </div>
              <div className="report-title">
                <h2>COMMISSION REPORT</h2>
                <p style={{ color: "#4a5568", fontSize: "14px" }}>
                  Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* Report Meta */}
            <div className="report-meta">
              <div className="report-info">
                <h3>Report Criteria</h3>
                <div className="info-row">
                  <span className="info-label">Filter:</span>
                  <span className="info-value">{getFilterDescription()}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Records:</span>
                  <span className="info-value">{summary.totalCommissions}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Sales People:</span>
                  <span className="info-value">{salesPersonGroups.length}</span>
                </div>
              </div>

              <div className="report-info">
                <h3>Report Summary</h3>
                <div className="info-row">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value">
                    {formatCurrency(summary.totalAmount)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Paid Amount:</span>
                  <span className="info-value">
                    {formatCurrency(summary.paidAmount)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Unpaid Amount:</span>
                  <span className="info-value">
                    {formatCurrency(summary.unpaidAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-section">
              <h3
                style={{
                  marginBottom: "20px",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#000",
                }}
              >
                Summary Overview
              </h3>
              <div className="summary-grid">
                <div className="summary-card">
                  <h4>Total Commissions</h4>
                  <div className="amount">{summary.totalCommissions}</div>
                </div>
                <div className="summary-card">
                  <h4>Total Amount</h4>
                  <div className="amount">
                    {formatCurrency(summary.totalAmount)}
                  </div>
                </div>
                <div className="summary-card">
                  <h4>Paid Amount</h4>
                  <div className="amount">
                    {formatCurrency(summary.paidAmount)}
                  </div>
                </div>
                <div className="summary-card">
                  <h4>Unpaid Amount</h4>
                  <div className="amount">
                    {formatCurrency(summary.unpaidAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Commission Table */}
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  marginBottom: "20px",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#000",
                }}
              >
                Detailed Commission Report
              </h3>

              {salesPersonGroups.map((group, groupIndex) => (
                <div
                  key={group.salesPerson.id}
                  style={{ marginBottom: "40px" }}
                >
                  {/* Sales Person Header */}
                  <div
                    style={{
                      backgroundColor: "#f1f5f9",
                      padding: "15px",
                      borderRadius: "8px 8px 0 0",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#000",
                            marginBottom: "4px",
                          }}
                        >
                          {group.salesPerson.full_name}
                        </h4>
                        <p style={{ fontSize: "12px", color: "#4a5568" }}>
                          Staff ID: {group.salesPerson.staff_id}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#000",
                          }}
                        >
                          Total: {formatCurrency(group.totalAmount)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#4a5568" }}>
                          Paid: {formatCurrency(group.paidAmount)} • Unpaid:{" "}
                          {formatCurrency(group.unpaidAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commissions Table */}
                  <table
                    className="commission-table"
                    style={{ borderTop: "none", borderRadius: "0 0 8px 8px" }}
                  >
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Sale Amount</th>
                        <th>Commission</th>
                        <th>Status</th>
                        <th>Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.commissions.map((commission: any) => (
                        <tr key={commission.id}>
                          <td>
                            {format(
                              new Date(commission.created_at),
                              "MMM d, yyyy"
                            )}
                          </td>
                          <td>{commission.sale?.invoice_number || "N/A"}</td>
                          <td>
                            {commission.sale?.customer?.name || "Walk-in"}
                          </td>
                          <td>
                            {commission.sale
                              ? formatCurrency(commission.sale.total_amount)
                              : "N/A"}
                          </td>
                          <td style={{ fontWeight: "600" }}>
                            {formatCurrency(commission.commission_amount)}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                commission.is_paid
                                  ? "status-paid"
                                  : "status-unpaid"
                              }`}
                            >
                              {commission.is_paid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td>
                            {commission.payment_date
                              ? format(
                                  new Date(commission.payment_date),
                                  "MMM d, yyyy"
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Page break after each sales person except the last */}
                  {groupIndex < salesPersonGroups.length - 1 && (
                    <div className="page-break"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="report-footer">
              <div className="footer-line">
                Comprint Services Commission Report
              </div>
              <div className="footer-line">
                For questions about this report, please contact the accounts
                department
              </div>
              <div className="footer-line">
                Report generated on{" "}
                {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
