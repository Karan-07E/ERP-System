#!/usr/bin/env node

// Quick test script to verify CSV export alignment
const fs = require('fs');

// Simulate dimension report data with various field types
const mockReport = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  cocId: 'COC-2025-001',
  jobId: 'JOB-2025-100',
  checkType: 'dimensional',
  checkDescription: 'Outer Diameter Check',
  specification: '25.0±0.1mm',
  tolerance: '±0.1',
  sample1: { value: '24.95', status: 'OK' },
  sample2: { value: '25.02', status: 'OK' },
  sample3: { value: '24.98', status: 'OK' },
  sample4: { value: '25.01', status: 'OK' },
  sample5: { value: '24.97', status: 'OK' },
  result: 'OK',
  MeasuredBy: { firstName: 'John', lastName: 'Smith' },
  measurementDate: '2025-09-03T10:30:00.000Z',
  notes: 'All measurements within\nspecified tolerance.\n\nComponent approved for production.'
};

// Test the improved CSV formatting functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', { hour12: false });
  } catch (e) {
    return '';
  }
};

const formatMeasuredBy = (user) => {
  if (user && user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return '';
};

const formatNotes = (notes) => {
  if (!notes) return '';
  return String(notes).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
};

const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  // Always wrap values in quotes for consistent alignment
  return `"${stringValue.replace(/"/g, '""')}"`;
};

// Headers
const headers = [
  'Report ID',
  'COC ID', 
  'Job ID',
  'Check Type',
  'Check Description',
  'Parameter',
  'Specification',
  'Tolerance',
  'Sample 1 Value',
  'Sample 1 Status',
  'Sample 2 Value', 
  'Sample 2 Status',
  'Sample 3 Value',
  'Sample 3 Status', 
  'Sample 4 Value',
  'Sample 4 Status',
  'Sample 5 Value',
  'Sample 5 Status',
  'Final Result',
  'Measured By',
  'Measurement Date',
  'Notes'
];

// Data row
const rows = [
  mockReport.id || '',
  mockReport.cocId || '',
  mockReport.jobId || '',
  mockReport.checkType || '',
  mockReport.checkDescription || '',
  mockReport.checkDescription || '', // parameter field
  mockReport.specification || '',
  mockReport.tolerance || '',
  mockReport.sample1?.value || '',
  mockReport.sample1?.status || '',
  mockReport.sample2?.value || '',
  mockReport.sample2?.status || '',
  mockReport.sample3?.value || '',
  mockReport.sample3?.status || '',
  mockReport.sample4?.value || '',
  mockReport.sample4?.status || '',
  mockReport.sample5?.value || '',
  mockReport.sample5?.status || '',
  mockReport.result || '',
  formatMeasuredBy(mockReport.MeasuredBy),
  formatDate(mockReport.measurementDate),
  formatNotes(mockReport.notes)
];

// Generate CSV
const csvRows = [headers.map(escapeCSVValue).join(',')];
csvRows.push(rows.map(escapeCSVValue).join(','));

// Add UTF-8 BOM for better Excel compatibility
const csvContent = '\uFEFF' + csvRows.join('\n');

// Write to file for inspection
fs.writeFileSync('/tmp/test_dimension_report.csv', csvContent);

console.log('✅ Test CSV generated successfully!');
console.log('📁 File location: /tmp/test_dimension_report.csv');
console.log('');
console.log('🔍 CSV Content Preview:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(csvContent.substring(1, 500) + '...'); // Remove BOM for console display
console.log('');
console.log('📊 Key improvements:');
console.log('• All values wrapped in quotes for consistent alignment');
console.log('• UTF-8 BOM added for Excel compatibility');
console.log('• Newlines in notes properly escaped');
console.log('• Dates formatted consistently');
console.log('• User names properly formatted');
console.log('• Empty values handled as empty quoted strings');
console.log('');
console.log('🚀 Ready for testing with real data!');
