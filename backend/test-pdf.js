const PDFDocument = require('pdfkit');
const fs = require('fs');

// Test PDF generation to verify PDFKit works correctly
const testPDF = () => {
  console.log('Creating test PDF...');
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    layout: 'landscape'
  });
  
  const writeStream = fs.createWriteStream('/tmp/test-dimension-report.pdf');
  doc.pipe(writeStream);
  
  // Add content
  doc.fontSize(24).font('Helvetica-Bold').text('Dimension Report Test', {align: 'center'});
  doc.moveDown(0.5);
  doc.fontSize(12).text('Engineering Excellence Enterprises', {align: 'center'});
  doc.fontSize(10).text('This is a test PDF to verify PDFKit is working correctly.');
  doc.moveDown();
  
  // Create a simple table
  const data = [
    ['Check Type', 'Dimensional'],
    ['Description', 'Outer Diameter Check'],
    ['Specification', '25.0±0.1mm'],
    ['Sample 1', '24.95 (OK)'],
    ['Sample 2', '25.02 (OK)'],
    ['Result', 'OK']
  ];
  
  // Draw table
  let y = doc.y + 20;
  const rowHeight = 20;
  const colWidth = 200;
  
  // Add header background
  doc.fillColor('#f0f0f0');
  doc.rect(100, y, colWidth * 2, rowHeight).fill();
  doc.fillColor('black');
  
  data.forEach((row, i) => {
    const x = 100;
    const rowY = y + (i * rowHeight);
    
    // Draw rectangle
    doc.rect(x, rowY, colWidth, rowHeight).stroke();
    doc.rect(x + colWidth, rowY, colWidth, rowHeight).stroke();
    
    // Add text
    doc.text(row[0], x + 5, rowY + 5, {width: colWidth - 10});
    doc.text(row[1], x + colWidth + 5, rowY + 5, {width: colWidth - 10});
  });
  
  // Finalize the PDF
  doc.end();
  
  writeStream.on('finish', () => {
    console.log('✅ Test PDF created successfully!');
    console.log('📄 File location: /tmp/test-dimension-report.pdf');
  });
};

testPDF();
