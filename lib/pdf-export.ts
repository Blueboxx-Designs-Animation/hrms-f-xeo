/**
 * PDF Download & Print Utilities for Invoices
 */

export function printInvoiceDocument(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  window.print();
}

export function downloadInvoiceAsPDF(invoice: any, company: any) {
  const invoiceHTML = generatePrintableInvoiceHTML(invoice, company);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for downloading and printing invoices.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  // Wait for images to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };
}

export function formatCurrency(amount: number | string | undefined | null, currency = 'EUR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  if (isNaN(num)) return '€ 0.00';
  
  const symbol = currency === 'USD' ? '$ ' : currency === 'EUR' ? '€ ' : currency === 'GBP' ? '£ ' : currency === 'INR' ? '₹ ' : `${currency} `;
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generatePrintableInvoiceHTML(invoice: any, company: any): string {
  const inv = invoice || {};
  const comp = company || {};
  const items = inv.items || [];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = comp.logo || '/images/xeoexperts-logo.jpg';
  const fullLogoUrl = logoUrl.startsWith('http') || logoUrl.startsWith('data:') ? logoUrl : `${origin}${logoUrl}`;

  // Invoice Number formatting
  const invNum = inv.invoice_number ? String(inv.invoice_number).replace(/^[^\d]*/, '') : '0024';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${inv.invoice_number || '0024'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      background: #ffffff;
      color: #111827;
      font-size: 13px;
      line-height: 1.45;
    }
    .invoice-wrapper {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      padding: 10px 0;
    }

    /* TOP HEADER */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .brand-logo {
      height: 60px;
      max-width: 220px;
      object-fit: contain;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h1 {
      font-size: 32px;
      font-weight: 400;
      color: #0b1329;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .invoice-meta .meta-date {
      font-size: 11.5px;
      color: #4b5563;
      line-height: 1.5;
    }

    /* FROM / TO TWO-COLUMN */
    .party-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .party-col {
      width: 48%;
    }
    .party-title {
      font-size: 14px;
      font-weight: 700;
      color: #0b1329;
      margin-bottom: 6px;
    }
    .party-name {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 2px;
    }
    .party-text {
      font-size: 12px;
      color: #374151;
      line-height: 1.5;
    }
    .party-text a {
      color: inherit;
      text-decoration: none;
    }

    /* ITEMS TABLE */
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    table.items-table thead tr {
      background-color: #dce0e9 !important;
    }
    table.items-table th {
      padding: 10px 14px;
      font-size: 12.5px;
      font-weight: 700;
      color: #1f2937;
      text-align: left;
    }
    table.items-table th.col-qty { text-align: center; width: 10%; }
    table.items-table th.col-price { text-align: right; width: 14%; }
    table.items-table th.col-tax { text-align: center; width: 10%; }
    table.items-table th.col-total { text-align: right; width: 15%; }

    table.items-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    table.items-table td {
      padding: 12px 14px;
      font-size: 12px;
      vertical-align: middle;
      color: #1f2937;
    }
    table.items-table td.col-qty { text-align: center; font-weight: 600; }
    table.items-table td.col-price { text-align: right; font-weight: 600; }
    table.items-table td.col-tax { text-align: center; font-weight: 600; }
    table.items-table td.col-total { text-align: right; font-weight: 700; }

    .item-title {
      font-weight: 700;
      color: #0b1329;
      font-size: 12.5px;
      margin-bottom: 2px;
    }
    .item-desc {
      color: #6b7280;
      font-size: 11px;
      line-height: 1.4;
    }

    /* SUMMARY BOTTOM */
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;
    }
    .summary-card {
      width: 280px;
    }
    .summary-header {
      background-color: #dce0e9 !important;
      padding: 8px 14px;
      font-weight: 700;
      font-size: 13px;
      color: #1f2937;
      text-align: right;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      border-radius: 4px 4px 0 0;
    }
    .summary-header svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .summary-rows {
      padding: 10px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 14px;
      font-size: 12.5px;
      color: #374151;
    }
    .summary-row.total-row {
      font-weight: 800;
      font-size: 13.5px;
      color: #0b1329;
      padding-top: 6px;
      border-top: 1px solid #e5e7eb;
      margin-top: 4px;
    }

    .page-num {
      text-align: right;
      font-size: 10.5px;
      color: #6b7280;
      margin-top: 40px;
    }

    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- HEADER -->
    <div class="header-row">
      <img src="${fullLogoUrl}" alt="XeoExperts" class="brand-logo" onerror="this.src='/images/xeoexperts-logo.jpg'" />
      <div class="invoice-meta">
        <h1>Invoice: ${invNum}</h1>
        <div class="meta-date">Issued on: ${inv.invoice_date ? new Date(inv.invoice_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}</div>
        <div class="meta-date">Due by: ${inv.due_date ? new Date(inv.due_date).toISOString().slice(0, 10) : new Date(Date.now() + 7*86400000).toISOString().slice(0, 10)}</div>
      </div>
    </div>

    <!-- FROM & TO -->
    <div class="party-grid">
      <!-- FROM (XeoExperts) -->
      <div class="party-col">
        <div class="party-title">From</div>
        <div class="party-name">${comp.name || 'XeoExperts'}</div>
        <div class="party-text">
          ${comp.contact_person || 'Hardik Shah'}<br>
          ${comp.address || '617 Ganesh Glory Gota'}<br>
          ${comp.city_postal || '382481 Ahmedabad'}<br>
          ${comp.country || 'India'}<br>
          ${comp.email || 'hardik.shah@xeoexperts.com'}<br>
          ${comp.phone || '+919904839139'}<br>
          <a href="${comp.website || 'https://www.xeoexperts.com/'}">${comp.website || 'https://www.xeoexperts.com/'}</a>
        </div>
      </div>

      <!-- TO (Client) -->
      <div class="party-col">
        <div class="party-title">To</div>
        <div class="party-name">${inv.client_company_name || inv.client_name || 'Perform Recruitment'}</div>
        <div class="party-text">
          ${inv.client_name && inv.client_company_name ? `${inv.client_name}<br>` : ''}
          ${inv.client_address ? `${inv.client_address}<br>` : '77 Camden Street Lower<br>'}
          ${inv.client_city || inv.client_state ? `${inv.client_postal_code || 'D02 XE80'} ${inv.client_city || 'Dublin'}<br>` : 'D02 XE80 Dublin<br>'}
          ${inv.client_country || 'Ireland'}<br>
          ${inv.client_email || 'georgijs.rodionovs@perform-recruitment.com'}<br>
          ${inv.client_phone || '+353833169867'}
        </div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th class="col-qty">Quantity</th>
          <th class="col-price">Unit Price</th>
          <th class="col-tax">Tax</th>
          <th class="col-total">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map((it: any) => `
          <tr>
            <td>
              <div class="item-title">${it.item_name}</div>
              ${it.description ? `<div class="item-desc">${it.description}</div>` : ''}
            </td>
            <td class="col-qty">${Number(it.quantity) || 1}</td>
            <td class="col-price">${formatCurrency(it.rate, inv.currency)}</td>
            <td class="col-tax">${it.tax_percentage ? `${it.tax_percentage}%` : '-'}</td>
            <td class="col-total">${formatCurrency(it.total, inv.currency)}</td>
          </tr>
        `).join('') : `
          <tr>
            <td>
              <div class="item-title">Mapping & Sourcing</div>
              <div class="item-desc">RPO Model Service: Staffing and Recruitment Solutions<br>(From 1st Aug to 31st Aug = 21 Working Days)</div>
            </td>
            <td class="col-qty">1</td>
            <td class="col-price">€ 420.00</td>
            <td class="col-tax">-</td>
            <td class="col-total">€ 420.00</td>
          </tr>
          <tr>
            <td>
              <div class="item-title">Email Finder Tools</div>
              <div class="item-desc">Apollo Email Finder ($79.99/month {converted USD to EUR})</div>
            </td>
            <td class="col-qty">1</td>
            <td class="col-price">€ 68.67</td>
            <td class="col-tax">-</td>
            <td class="col-total">€ 68.67</td>
          </tr>
        `}
      </tbody>
    </table>

    <!-- INVOICE SUMMARY -->
    <div class="summary-section">
      <div class="summary-card">
        <div class="summary-header">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
          <span>Invoice Summary</span>
        </div>
        <div class="summary-rows">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatCurrency(inv.subtotal, inv.currency)}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>${formatCurrency(inv.tax_amount || 0, inv.currency)}</span>
          </div>
          <div class="summary-row total-row">
            <span>Total</span>
            <span>${formatCurrency(inv.total_amount || inv.subtotal, inv.currency)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-num">1 / 1</div>
  </div>
</body>
</html>
  `;
}
