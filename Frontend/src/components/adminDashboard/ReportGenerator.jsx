import React, { useState } from 'react';
import { generateReport, exportData } from '../../services/DataVisualizationService';
import '../../styles/DataVisualization.css'

export default function ReportGenerator({ theme }) {
  const [reportType, setReportType] = useState('yield');
  const [dateRange, setDateRange] = useState('last_month');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(true);

  const reportTypes = [
    { value: 'yield', label: 'Yield Analysis Report', icon: '' },
    { value: 'revenue', label: 'Revenue Report', icon: '' },
    { value: 'orders', label: 'Order Analysis', icon: '' },
    { value: 'farmers', label: 'Farmer Performance', icon: '' },
    { value: 'crops', label: 'Crop Distribution', icon: '' },
    { value: 'marketplace', label: 'Marketplace Activity', icon: '' }
  ];

  const dateRanges = [
    { value: 'last_week', label: 'Last Week' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV Data' },
    { value: 'html', label: 'HTML Report' }
  ];

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const parameters = {
        dateRange,
        format
      };

      const result = await generateReport(reportType, parameters);
      
      // Handle the generated report
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      } else {
        // For blob responses (like CSV/Excel)
        const blob = new Blob([result], { type: getMimeType(format) });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      console.log('Report generated successfully:', result);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getMimeType = (format) => {
    const mimeTypes = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      html: 'text/html'
    };
    return mimeTypes[format] || 'application/octet-stream';
  };

  const handleQuickExport = async (type) => {
    try {
      setGenerating(true);
      await exportData(type);
      console.log(`${type.toUpperCase()} export completed`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (!showGenerator) {
    return (
      <div className={`report-generator-minimized ${theme}`}>
        <div className="minimized-header">
          <h3>Report Generator</h3>
          <button 
            className={`toggle-generator-btn ${theme}`}
            onClick={() => setShowGenerator(true)}
          >
            Show Report Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`report-generator ${theme}`}>
      <div className="generator-header">
        <div className="header-main">
          <h3>Report Generator</h3>
          <p>Generate comprehensive reports and export data for analysis</p>
        </div>
        <button 
          className={`toggle-generator-btn ${theme}`}
          onClick={() => setShowGenerator(false)}
        >
          Hide Generator
        </button>
      </div>

      <div className="generator-content">
        {/* Quick Export Buttons */}
        <div className="quick-export-section">
          <h4>Quick Export</h4>
          <div className="quick-export-buttons">
            <button 
              className={`export-btn csv ${theme}`}
              onClick={() => handleQuickExport('csv')}
              disabled={generating}
            >
               Export CSV
            </button>
            <button 
              className={`export-btn excel ${theme}`}
              onClick={() => handleQuickExport('excel')}
              disabled={generating}
            >
               Export Excel
            </button>
            <button 
              className={`export-btn pdf ${theme}`}
              onClick={() => handleQuickExport('pdf')}
              disabled={generating}
            >
               Export PDF
            </button>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="report-configuration">
          <h4>Custom Report</h4>
          <div className="config-grid">
            <div className="config-group">
              <label>Report Type</label>
              <div className="report-type-grid">
                {reportTypes.map(type => (
                  <div 
                    key={type.value}
                    className={`report-type-card ${reportType === type.value ? 'selected' : ''} ${theme}`}
                    onClick={() => setReportType(type.value)}
                  >
                    <div className="type-icon">{type.icon}</div>
                    <div className="type-label">{type.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="config-group">
              <label>Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`config-select ${theme}`}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="config-group">
              <label>Output Format</label>
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className={`config-select ${theme}`}
              >
                {formats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="generate-section">
            <button 
              className={`generate-btn ${theme}`}
              onClick={handleGenerateReport}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="report-preview">
          <h4>Report Preview</h4>
          <div className={`preview-content ${theme}`}>
            <div className="preview-header">
              <h5>{reportTypes.find(t => t.value === reportType)?.label}</h5>
              <span className="preview-format">{format.toUpperCase()}</span>
            </div>
            <div className="preview-body">
              <div className="preview-section">
                <h6>Summary</h6>
                <p>This report will include comprehensive analysis of {reportType} data for the selected period.</p>
              </div>
              <div className="preview-section">
                <h6>Included Data</h6>
                <ul>
                  <li>Trend analysis and charts</li>
                  <li>Statistical summaries</li>
                  <li>Performance metrics</li>
                  <li>Recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}