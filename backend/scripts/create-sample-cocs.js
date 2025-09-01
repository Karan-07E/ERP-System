const { COC, User, Party, Order, OrderItem, Job } = require('../models');
const sequelize = require('../config/database');

async function createSampleCOCs() {
  try {
    console.log('Creating sample COC data...');

    // Get or create admin user
    let adminUser = await User.findOne({ where: { email: 'admin@company.com' } });
    if (!adminUser) {
      console.log('Admin user not found. Please ensure admin user exists.');
      return;
    }

    // Sample data 1: Steel Plate COC
    const sampleCOC1 = {
      cocNumber: 'COC-2025-001',
      cocId: 'SP-2025-A001',
      productPartNumber: 'ASTM-A36-PL-12x8x0.5',
      lotBatchNumber: 'LOT-25-A001',
      referenceStandard: 'ASTM A36/A36M - Standard Specification for Carbon Structural Steel, AWS D1.1 Structural Welding Code',
      statementOfCompliance: 'This is to certify that the above mentioned steel plate material has been manufactured, tested, and inspected in accordance with the specified standards. All chemical composition, mechanical properties, and dimensional tolerances meet the requirements of ASTM A36. Heat treatment records and test certificates are available upon request.',
      qaPersonSignature: 'John Mitchell, Senior Quality Assurance Engineer, Cert. No. QA-2024-156'
    };

    // Sample data 2: Aluminum Component COC
    const sampleCOC2 = {
      cocNumber: 'COC-2025-002',
      cocId: 'AC-2025-B002',
      productPartNumber: 'AL-6061-T6-ROD-25.4x300',
      lotBatchNumber: 'LOT-25-B002',
      referenceStandard: 'ASTM B221 - Standard Specification for Aluminum and Aluminum-Alloy Extruded Bars, Rods, Wire, Profiles, and Tubes, AS 1664.1 - Aluminum Structures',
      statementOfCompliance: 'We hereby certify that the aluminum rod specified above conforms to all requirements of ASTM B221 and AS 1664.1. The material has undergone complete chemical analysis, mechanical testing including tensile strength, yield strength, and elongation tests. All results are within specified tolerances and documented in our quality control records.',
      qaPersonSignature: 'Sarah Chen, Lead Materials Engineer, Cert. No. QA-2024-287'
    };

    // Create default entities for foreign key requirements
    let defaultParty = await Party.findOne({ where: { partyCode: 'DEFAULT' } });
    if (!defaultParty) {
      defaultParty = await Party.create({
        partyCode: 'DEFAULT',
        name: 'Default Customer',
        type: 'customer',
        contactPerson: 'Default Contact',
        email: 'default@example.com',
        phone: '0000000000',
        address: 'Default Address',
        city: 'Default City',
        state: 'Default State',
        stateCode: '00',
        pincode: '000000'
      });
    }

    // Create sample COCs
    const sampleCOCs = [sampleCOC1, sampleCOC2];

    for (let i = 0; i < sampleCOCs.length; i++) {
      const sample = sampleCOCs[i];
      
      // Create dummy order
      const timestamp = Date.now();
      const order = await Order.create({
        orderNumber: `ORD-SAMPLE-${timestamp}-${i + 1}`,
        poNumber: `PO-SAMPLE-${timestamp}-${i + 1}`,
        type: 'sales_order',
        partyId: defaultParty.id,
        orderDate: new Date(),
        expectedDeliveryDate: new Date(),
        subtotal: 1000.00,
        totalGst: 180.00,
        grandTotal: 1180.00,
        status: 'completed',
        createdBy: adminUser.id
      });

      // Create dummy order item
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productName: sample.productPartNumber,
        partNumber: sample.productPartNumber,
        description: `Product: ${sample.productPartNumber}`,
        quantity: 1,
        unit: 'PCS',
        unitPrice: 1000.00,
        totalPrice: 1000.00,
        hsnCode: '7208.10.00',
        gstRate: 18.00,
        finalAmount: 1180.00,
        deliveryDate: new Date()
      });

      // Create dummy job
      const job = await Job.create({
        jobNumber: `JOB-SAMPLE-${timestamp}-${i + 1}`,
        jobId: `JID-${timestamp}-${i + 1}`,
        partNumber: sample.productPartNumber,
        quantity: 1,
        orderItemId: orderItem.id,
        employeeId: adminUser.id,
        description: `Job for ${sample.productPartNumber}`,
        targetCompletionDate: new Date(),
        status: 'completed',
        createdBy: adminUser.id
      });

      // Create COC
      await COC.create({
        cocNumber: sample.cocNumber,
        cocId: sample.cocId,
        jobId: job.id,
        partyId: defaultParty.id,
        orderId: order.id,
        invoiceNumber: `INV-SAMPLE-${timestamp}-${i + 1}`,
        batchNumber: sample.lotBatchNumber,
        partDescription: sample.productPartNumber,
        quantity: 1,
        complianceDeclaration: `Reference Standard: ${sample.referenceStandard}\n\nStatement of Compliance: ${sample.statementOfCompliance}\n\nQA Person: ${sample.qaPersonSignature}`,
        notes: `Product/Part: ${sample.productPartNumber}\nLot/Batch: ${sample.lotBatchNumber}\nCOC ID: ${sample.cocId}`,
        createdBy: adminUser.id,
        status: 'approved',
        generatedDate: new Date(),
        approvedBy: adminUser.id,
        approvedAt: new Date()
      });

      console.log(`Created sample COC: ${sample.cocNumber} - ${sample.productPartNumber}`);
    }

    console.log('Sample COC data created successfully!');
    
  } catch (error) {
    console.error('Error creating sample COC data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createSampleCOCs()
    .then(() => {
      console.log('Sample data creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sample data creation failed:', error);
      process.exit(1);
    });
}

module.exports = createSampleCOCs;
