require('dotenv').config();
const {
  sequelize,
  User,
  Party,
  Order,
  Job,
  COC,
  DimensionReport
} = require('../models');

async function seedDimensionReports() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connection established successfully.');

    console.log('🗑️  Clearing existing dimension reports...');
    await DimensionReport.destroy({ where: {} });
    console.log('✅ Existing dimension reports cleared.');

    console.log('🌱 Creating sample dimension reports...');

    // Get existing users for realistic data
    const users = await User.findAll({ limit: 5 });
    const parties = await Party.findAll({ limit: 3 });
    const orders = await Order.findAll({ limit: 3 });
    
    if (users.length === 0 || parties.length === 0 || orders.length === 0) {
      console.log('⚠️  No existing data found. Please run the main seed script first.');
      console.log('   Run: npm run seed');
      process.exit(1);
    }

    // Create sample COCs first if they don't exist
    let cocs = await COC.findAll();
    if (cocs.length === 0) {
      console.log('📋 Creating sample COCs for dimension reports...');
      
      // Create sample jobs first if they don't exist
      let jobs = await Job.findAll();
      if (jobs.length === 0) {
        console.log('🔧 Creating sample jobs...');
        for (let i = 0; i < 3; i++) {
          await Job.create({
            jobNumber: `JOB-2025-${(100 + i).toString().padStart(3, '0')}`,
            jobTitle: `Motor Assembly Job ${i + 1}`,
            description: `Assembly and testing of motor unit ${i + 1}`,
            status: 'in_progress',
            priority: ['low', 'medium', 'high'][i],
            startDate: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)), // i weeks ago
            targetEndDate: new Date(Date.now() + ((3 - i) * 7 * 24 * 60 * 60 * 1000)), // future dates
            employeeId: users[i % users.length].id,
            createdBy: users[0].id
          });
        }
        jobs = await Job.findAll();
      }

      // Create sample COCs
      for (let i = 0; i < 3; i++) {
        await COC.create({
          cocNumber: `COC-2025-${(200 + i).toString().padStart(3, '0')}`,
          cocId: `COC-${Date.now()}-${i}`,
          jobId: jobs[i].id,
          partyId: parties[i % parties.length].id,
          orderId: orders[i % orders.length].id,
          invoiceNumber: `INV-2025-${(300 + i).toString().padStart(3, '0')}`,
          batchNumber: `BATCH-${Date.now()}-${i}`,
          partDescription: `Motor Assembly Unit ${i + 1} - High Performance Motor with Quality Testing`,
          quantity: (i + 1) * 10,
          materialsUsed: [
            { material: 'Steel Rod 12mm', quantity: 2, unit: 'PCS' },
            { material: 'Motor Housing', quantity: 1, unit: 'PCS' },
            { material: 'Electrical Components', quantity: 1, unit: 'SET' }
          ],
          processesUsed: [
            { process: 'Assembly', duration: 240, operator: users[i % users.length].username },
            { process: 'Testing', duration: 60, operator: users[(i + 1) % users.length].username }
          ],
          qualityChecks: [
            { check: 'Visual Inspection', result: 'PASS', inspector: users[i % users.length].username },
            { check: 'Electrical Test', result: 'PASS', inspector: users[(i + 1) % users.length].username }
          ],
          complianceDeclaration: 'This certificate confirms that the above mentioned parts/products comply with the specified requirements and have been manufactured, inspected and tested in accordance with the applicable standards.',
          processChartList: [
            { step: 1, process: 'Material Inspection', status: 'Completed' },
            { step: 2, process: 'Assembly', status: 'Completed' },
            { step: 3, process: 'Quality Testing', status: 'Completed' },
            { step: 4, process: 'Final Inspection', status: 'Completed' }
          ],
          status: 'approved',
          approvedBy: users[0].id,
          approvedDate: new Date(),
          createdBy: users[i % users.length].id
        });
      }
      cocs = await COC.findAll();
    }

    const jobs = await Job.findAll();

    // Sample dimension check types and descriptions
    const checkTypes = [
      { type: 'dimensional', description: 'Outer Diameter Check', specification: '25.0±0.1mm', tolerance: '±0.1' },
      { type: 'dimensional', description: 'Length Measurement', specification: '150.0±0.5mm', tolerance: '±0.5' },
      { type: 'dimensional', description: 'Bore Diameter', specification: '12.0±0.05mm', tolerance: '±0.05' },
      { type: 'visual', description: 'Surface Finish Inspection', specification: 'Ra 1.6', tolerance: 'Visual' },
      { type: 'functional', description: 'Electrical Resistance', specification: '5.0±0.2Ω', tolerance: '±0.2' },
      { type: 'material', description: 'Hardness Test', specification: '45-50 HRC', tolerance: '±2.5' },
      { type: 'dimensional', description: 'Thread Pitch Check', specification: 'M12x1.75', tolerance: '±0.02' },
      { type: 'functional', description: 'Torque Test', specification: '50±5 Nm', tolerance: '±5' },
      { type: 'visual', description: 'Coating Thickness', specification: '25±3 μm', tolerance: '±3' },
      { type: 'dimensional', description: 'Concentricity Check', specification: '0.05mm TIR', tolerance: '0.05' }
    ];

    // Function to generate realistic sample data
    const generateSampleData = (specification, checkType) => {
      const baseValue = parseFloat(specification.match(/[\d.]+/)?.[0] || '25');
      const tolerance = parseFloat(specification.match(/±([\d.]+)/)?.[1] || '0.1');
      
      // Generate 5 sample values with some variation
      const samples = [];
      for (let i = 0; i < 5; i++) {
        let value;
        let status;
        
        if (checkType === 'visual') {
          // For visual checks, use descriptive values
          const visualResults = ['Excellent', 'Good', 'Acceptable', 'Minor Defect', 'Major Defect'];
          const visualStatuses = ['OK', 'OK', 'OK', 'NOT_OK', 'NOT_OK'];
          const index = Math.floor(Math.random() * visualResults.length);
          value = visualResults[index];
          status = visualStatuses[index];
        } else {
          // For measurable values, generate within or slightly outside tolerance
          const variation = (Math.random() - 0.5) * tolerance * 2 * 1.2; // 20% chance of being out of tolerance
          value = (baseValue + variation).toFixed(2);
          status = Math.abs(variation) <= tolerance ? 'OK' : 'NOT_OK';
        }
        
        samples.push({ value, status });
      }
      
      return samples;
    };

    // Create dimension reports for each COC
    let reportCount = 0;
    for (const coc of cocs) {
      // Create 3-5 dimension reports per COC
      const numReports = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numReports; i++) {
        const checkData = checkTypes[reportCount % checkTypes.length];
        const samples = generateSampleData(checkData.specification, checkData.type);
        
        // Determine overall result based on sample results
        const overallResult = samples.some(s => s.status === 'NOT_OK') ? 'NOT_OK' : 'OK';
        
        // Random measurement date within last 30 days
        const measurementDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        await DimensionReport.create({
          cocId: coc.id,
          jobId: jobs[reportCount % jobs.length].id,
          checkType: checkData.type,
          checkDescription: checkData.description,
          specification: checkData.specification,
          tolerance: checkData.tolerance,
          sample1: samples[0],
          sample2: samples[1],
          sample3: samples[2],
          sample4: samples[3],
          sample5: samples[4],
          result: overallResult,
          hasImage: Math.random() > 0.7, // 30% chance of having an image
          imagePath: Math.random() > 0.7 ? `/uploads/dimension-reports/sample-${reportCount}.jpg` : null,
          measuredBy: users[reportCount % users.length].id,
          measurementDate: measurementDate,
          notes: overallResult === 'NOT_OK' ? 
            'Sample values outside tolerance. Recommended for rework or further inspection.' :
            'All measurements within specified tolerance. Component approved.'
        });
        
        reportCount++;
      }
    }

    console.log('✅ Sample dimension reports created successfully!');
    console.log('');
    console.log('📊 Created dimension report data:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`• ${reportCount} Dimension Reports`);
    console.log(`• ${cocs.length} COCs (Certificate of Conformance)`);
    console.log(`• ${jobs.length} Associated Jobs`);
    console.log('• Various check types: Dimensional, Visual, Functional, Material');
    console.log('• 5-sample measurement data for each report');
    console.log('• Realistic tolerance and specification data');
    console.log('• Sample images for some reports');
    console.log('• Mixed OK/NOT_OK results for testing');
    console.log('');
    console.log('🎯 Sample check types included:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    checkTypes.forEach((check, index) => {
      console.log(`• ${check.description} (${check.type}) - ${check.specification}`);
    });
    console.log('');
    console.log('🚀 Dimension reports are now ready for testing!');
    console.log('   Navigate to the Dimension Reports page to view the sample data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding dimension reports:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

seedDimensionReports();
