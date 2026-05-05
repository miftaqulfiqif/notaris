export function downloadCsv(data: Record<string, unknown>[], filename: string) {
    if (!data || !data.length) return false;
    
    try {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((item) => 
            Object.values(item).map(val => {
                if (val === null || val === undefined) return '""';
                // Escape quotes and wrap in quotes
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            }).join(',')
        );
        
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Error generating CSV:', error);
        return false;
    }
}

export function downloadInvoicePdf(invoice: {
    id: string;
    tenant_name: string;
    period: string;
    amount: number;
}) {
    const htmlContent = `
        <html>
            <head>
                <title>Invoice ${invoice.id}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #333; }
                    .header { border-bottom: 2px solid #C9AA6F; padding-bottom: 20px; margin-bottom: 30px; }
                    .title { font-size: 24px; font-weight: bold; color: #1E2127; }
                    .details { margin-bottom: 30px; }
                    .details p { margin: 5px 0; }
                    .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">INVOICE</div>
                    <p>Notarix - Master Admin Panel</p>
                </div>
                <div class="details">
                    <p><strong>Invoice ID:</strong> ${invoice.id}</p>
                    <p><strong>Tenant:</strong> ${invoice.tenant_name}</p>
                    <p><strong>Periode:</strong> ${invoice.period}</p>
                    <p><strong>Status:</strong> Lunas</p>
                </div>
                <div class="total">
                    Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(invoice.amount)}
                </div>
            </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

export function downloadReportByFormat(
    data: Record<string, unknown>[],
    filename: string,
    format: string
) {
    if (!data || !data.length) return false;

    if (format === 'csv') {
        return downloadCsv(data, filename);
    }

    if (format === 'excel') {
        try {
            const headers = Object.keys(data[0]);
            const headerRow = headers.map(h => `<th style="border:1px solid #ccc;padding:8px;background:#f5f5f5;font-weight:bold">${h}</th>`).join('');
            const bodyRows = data.map(item =>
                '<tr>' + headers.map(h => {
                    const val = item[h];
                    return `<td style="border:1px solid #ccc;padding:6px">${val ?? ''}</td>`;
                }).join('') + '</tr>'
            ).join('');

            const tableHtml = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
                <head><meta charset="utf-8"></head>
                <body>
                    <table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
                </body></html>
            `;

            const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.xls`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error generating Excel:', error);
            return false;
        }
    }

    if (format === 'pdf') {
        try {
            const headers = Object.keys(data[0]);
            const headerRow = headers.map(h => `<th style="border:1px solid #ccc;padding:8px;background:#C9AA6F;color:white;font-weight:bold">${h}</th>`).join('');
            const bodyRows = data.map(item =>
                '<tr>' + headers.map(h => {
                    const val = item[h];
                    return `<td style="border:1px solid #ddd;padding:6px">${val ?? ''}</td>`;
                }).join('') + '</tr>'
            ).join('');

            const htmlContent = `
                <html><head><title>${filename}</title>
                <style>
                    body { font-family: sans-serif; padding: 30px; color: #333; }
                    h1 { font-size: 20px; color: #1E2127; border-bottom: 2px solid #C9AA6F; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    p.meta { color: #666; font-size: 12px; }
                </style></head>
                <body>
                    <h1>Laporan: ${filename}</h1>
                    <p class="meta">Digenerate pada ${new Date().toLocaleDateString('id-ID')}</p>
                    <table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
                </body></html>
            `;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return false;
        }
    }

    // Fallback to CSV
    return downloadCsv(data, filename);
}
