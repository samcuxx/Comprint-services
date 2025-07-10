"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface InvoiceItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percent: number;
  product?: {
    name: string;
    sku: string;
    description?: string;
  };
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  sale_date: string;
  subtotal: number;
  tax_amount?: number | null;
  discount_amount?: number | null;
  total_amount: number;
  payment_method: string | null;
  payment_status: string;
  notes?: string | null;
  customer?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    company?: string | null;
  } | null;
  sales_person?: {
    id: string;
    full_name: string;
    staff_id: string;
    email?: string | null;
  } | null;
  items?: InvoiceItem[];
}

interface InvoicePrintProps {
  sale: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoicePrint({ sale, isOpen, onClose }: InvoicePrintProps) {
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

        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          background: white !important;
          color: #000 !important;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }

        .company-info h1 {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 8px;
        }

        .company-info p {
          color: #4a5568 !important;
          margin-bottom: 4px;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h2 {
          font-size: 32px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 8px;
        }

        .invoice-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .bill-to, .invoice-details {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .bill-to h3, .invoice-details h3 {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748 !important;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .customer-name {
          font-size: 18px;
          font-weight: 600;
          color: #000 !important;
          margin-bottom: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .detail-label {
          color: #4a5568 !important;
          font-weight: 500;
        }

        .detail-value {
          font-weight: 600;
          color: #000 !important;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .items-table th {
          background: #f1f5f9 !important;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          color: #2d3748 !important;
          border-bottom: 1px solid #e2e8f0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .items-table th:last-child,
        .items-table td:last-child {
          text-align: right;
        }

        .items-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .items-table tbody tr:last-child td {
          border-bottom: none;
        }

        .item-name {
          font-weight: 600;
          color: #000 !important;
          margin-bottom: 4px;
        }

        .item-sku {
          font-size: 10px;
          color: #4a5568 !important;
        }

        .totals-section {
          margin-left: auto;
          width: 300px;
          margin-bottom: 30px;
        }

        .totals-table {
          width: 100%;
          border-collapse: collapse;
        }

        .totals-table td {
          padding: 8px 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .totals-table .total-label {
          text-align: left;
          color: #4a5568 !important;
          font-weight: 500;
        }

        .totals-table .total-value {
          text-align: right;
          font-weight: 600;
          color: #000 !important;
        }

        .totals-table .grand-total {
          border-top: 2px solid #e2e8f0;
          border-bottom: 2px solid #e2e8f0;
          background: #f8fafc;
        }

        .totals-table .grand-total .total-label,
        .totals-table .grand-total .total-value {
          font-weight: bold;
          color: #1e40af;
          font-size: 16px;
          padding: 12px 16px;
        }

        .payment-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .payment-details {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .payment-details h4 {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748 !important;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-paid {
          background: #dcfce7;
          color: #166534;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .notes-section {
          margin-bottom: 30px;
        }

        .notes-section h4 {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748 !important;
          margin-bottom: 8px;
        }

        .notes-content {
          padding: 15px;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #4a5568 !important;
          white-space: pre-line;
        }

        .invoice-footer {
          border-top: 2px solid #e2e8f0;
          padding-top: 20px;
          text-align: center;
          color: #4a5568 !important;
          font-size: 10px;
        }

        .footer-line {
          margin-bottom: 4px;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .invoice-container {
            max-width: none;
            margin: 0;
            padding: 20px;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${sale.invoice_number}</title>
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

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      paid: "status-badge status-paid",
      pending: "status-badge status-pending",
      cancelled: "status-badge status-cancelled",
      partial: "status-badge status-pending",
    };

    return (
      <span
        className={
          statusClasses[status as keyof typeof statusClasses] || "status-badge"
        }
      >
        {status}
      </span>
    );
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
          <h3 className="text-lg font-semibold">Invoice Preview</h3>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="flex-1 p-4 overflow-auto bg-white">
          <div
            ref={printRef}
            className="text-black bg-white invoice-container"
            style={{ backgroundColor: "white", color: "black" }}
          >
            {/* Header */}
            <div className="invoice-header">
              <div className="company-info">
                <h1>Comprint Services</h1>
                <p>Bompata</p>
                <p>Kumasi - Ghana</p>
                <p>Phone: +233 24-463-9827</p>
                <p>Email: boadiemmanuel@gmail.com</p>
              </div>
              <div className="invoice-title">
                <h2>INVOICE</h2>
                <p style={{ color: "#4a5568", fontSize: "14px" }}>
                  #{sale.invoice_number}
                </p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="invoice-meta">
              <div className="bill-to">
                <h3>Bill To</h3>
                {sale.customer ? (
                  <>
                    <div className="customer-name">{sale.customer.name}</div>
                    {sale.customer.company && <p>{sale.customer.company}</p>}
                    {sale.customer.address && <p>{sale.customer.address}</p>}
                    {sale.customer.email && <p>{sale.customer.email}</p>}
                    {sale.customer.phone && <p>{sale.customer.phone}</p>}
                  </>
                ) : (
                  <div className="customer-name">Walk-in Customer</div>
                )}
              </div>

              <div className="invoice-details">
                <h3>Invoice Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Invoice Date:</span>
                  <span className="detail-value">
                    {format(new Date(sale.sale_date), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Due Date:</span>
                  <span className="detail-value">
                    {format(new Date(sale.sale_date), "MMM d, yyyy")}
                  </span>
                </div>
                {sale.sales_person && (
                  <div className="detail-row">
                    <span className="detail-label">Sales Rep:</span>
                    <span className="detail-value">
                      {sale.sales_person.full_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="item-name">{item.product?.name}</div>
                      <div className="item-sku">SKU: {item.product?.sku}</div>
                      {item.product?.description && (
                        <div className="item-sku">
                          {item.product.description}
                        </div>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{item.discount_percent}%</td>
                    <td>{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals-section">
              <table className="totals-table">
                <tbody>
                  <tr>
                    <td className="total-label">Subtotal:</td>
                    <td className="total-value">
                      {formatCurrency(sale.subtotal)}
                    </td>
                  </tr>
                  {sale.discount_amount && sale.discount_amount > 0 && (
                    <tr>
                      <td className="total-label">Discount:</td>
                      <td className="total-value">
                        -{formatCurrency(sale.discount_amount)}
                      </td>
                    </tr>
                  )}
                  {sale.tax_amount && sale.tax_amount > 0 && (
                    <tr>
                      <td className="total-label">Tax:</td>
                      <td className="total-value">
                        {formatCurrency(sale.tax_amount)}
                      </td>
                    </tr>
                  )}
                  <tr className="grand-total">
                    <td className="total-label">TOTAL:</td>
                    <td className="total-value">
                      {formatCurrency(sale.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Information */}
            <div className="payment-info">
              <div className="payment-details">
                <h4>Payment Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span
                    className="detail-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {sale.payment_method || "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className="detail-value">
                    {getStatusBadge(sale.payment_status)}
                  </span>
                </div>
              </div>

              <div className="payment-details">
                <h4>Terms & Conditions</h4>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#4a5568",
                    lineHeight: "1.4",
                  }}
                >
                  Payment is due within 30 days of invoice date. Late payments
                  may be subject to a 1.5% monthly service charge.
                </p>
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="notes-section">
                <h4>Notes</h4>
                <div className="notes-content">{sale.notes}</div>
              </div>
            )}

            {/* Footer */}
            <div className="invoice-footer">
              <div className="footer-line">Thank you for your business!</div>
              <div className="footer-line">
                For questions about this invoice, please contact us at
                info@comprintservices.com
              </div>
              <div className="footer-line">
                Invoice generated on{" "}
                {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
