const { COC, DimensionReport, Job, OrderItem, Order, Party, User, Material } = require('../models');
const sequelize = require('../config/database');

// Helper function to generate COC number
const generateCOCNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `COC-${currentYear}-`;
  
  const lastCOC = await COC.findOne({
    where: {
      cocNumber: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['createdAt', 'DESC']]
  });
  
  let nextNumber = 1;
  if (lastCOC) {
    const lastNumber = parseInt(lastCOC.cocNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

const { Op } = require('sequelize');

async function seedCOCs() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Check if COCs already exist
    const existingCOCCount = await COC.count();
    if (existingCOCCount > 0) {
      console.log(`${existingCOCCount} COCs already exist. Skipping seed.`);
      return;
    }

    // Get users for creating and approving COCs
    const users = await User.findAll();
    if (users.length === 0) {
      console.error('No users found. Please seed users first.');
      return;
    }

    // Get parties for COCs
    const parties = await Party.findAll();
    if (parties.length === 0) {
      console.error('No parties found. Please seed parties first.');
      return;
    }

    // Get or create some orders for COCs
    let orders = await Order.findAll();
    if (orders.length === 0) {
      console.log('Creating sample orders...');
      
      // Create some orders
      orders = await Promise.all(parties.slice(0, 5).map(async (party, index) => {
        return Order.create({
          orderNumber: `ORD-2023-${1000 + index}`,
          poNumber: `PO-${2000 + index}`,
          type: 'sales_order',
          partyId: party.id,
          orderDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
          subtotal: 10000 + (index * 1000),
          totalGst: 1800 + (index * 180),
          grandTotal: 11800 + (index * 1180),
          status: 'completed',
          createdBy: users[0].id
        });
      }));
    }

    // Get materials or create dummy ones
    let materials = await Material.findAll();
    if (materials.length === 0) {
      console.log('Creating sample materials...');
      
      // Create some materials
      materials = await Promise.all([
        Material.create({
          name: 'Stainless Steel 304',
          description: 'High-quality stainless steel grade 304',
          type: 'raw',
          code: 'SS304',
          unit: 'kg',
          price: 120,
          preferredSupplierId: parties[1].id,
          specs: {
            hardness: '88 HRB',
            density: '8.0 g/cm³',
            tensileStrength: '505 MPa'
          }
        }),
        Material.create({
          name: 'Aluminum 6061',
          description: 'Aluminum alloy 6061-T6',
          type: 'raw',
          code: 'AL6061',
          unit: 'kg',
          price: 85,
          preferredSupplierId: parties[1].id,
          specs: {
            hardness: '60 HRB',
            density: '2.7 g/cm³',
            tensileStrength: '310 MPa'
          }
        }),
        Material.create({
          name: 'Brass C260',
          description: 'Cartridge brass C260',
          type: 'raw',
          code: 'BR260',
          unit: 'kg',
          price: 150,
          preferredSupplierId: parties[1].id,
          specs: {
            hardness: '65 HRB',
            density: '8.53 g/cm³',
            tensileStrength: '330 MPa'
          }
        })
      ]);
    }

    // Create order items if needed
    let orderItems = await OrderItem.findAll();
    if (orderItems.length === 0) {
      console.log('Creating sample order items...');
      
      // Create order items for each order
      orderItems = await Promise.all(orders.map(async (order, index) => {
        const material = materials[index % materials.length];
        return OrderItem.create({
          orderId: order.id,
          materialId: material.id,
          partNumber: `PART-${1000 + index}`,
          description: `Precision machined component made from ${material.name}`,
          quantity: 10 + (index * 5),
          unitPrice: 1000 + (index * 100),
          totalPrice: (1000 + (index * 100)) * (10 + (index * 5)),
          hsnCode: '7326',
          gstRate: 18,
          finalAmount: (1000 + (index * 100)) * (10 + (index * 5)) * 1.18,
          deliveryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
        });
      }));
    }

    // Create jobs if needed
    let jobs = await Job.findAll();
    if (jobs.length === 0) {
      console.log('Creating sample jobs...');
      
      // Create jobs for each order item
      jobs = await Promise.all(orderItems.map(async (orderItem, index) => {
        return Job.create({
          jobNumber: `JOB-${2000 + index}`,
          orderItemId: orderItem.id,
          employeeId: users[index % users.length].id,
          partNumber: orderItem.partNumber,
          description: orderItem.description,
          quantity: orderItem.quantity,
          targetCompletionDate: new Date(Date.now() + (15 * 24 * 60 * 60 * 1000)),
          status: 'completed',
          createdBy: users[0].id
        });
      }));
    }

    // Create COCs
    console.log('Creating sample COCs...');
    const currentYear = new Date().getFullYear();

    const cocs = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const orderItem = await OrderItem.findByPk(job.orderItemId, {
        include: [{ model: Order, as: 'order' }]
      });
      const order = orderItem.order;

      const cocNumber = `COC-${currentYear}-${(1000 + i).toString().padStart(4, '0')}`;
      
      const coc = await COC.create({
        cocNumber,
        cocId: `COCID-${i + 1}`,
        jobId: job.id,
        partyId: order.partyId,
        orderId: order.id,
        invoiceNumber: `INV-${2000 + i}`,
        batchNumber: `BATCH-${3000 + i}`,
        partDescription: job.description,
        quantity: job.quantity,
        materialsUsed: [
          {
            name: materials[i % materials.length].name,
            specification: materials[i % materials.length].specs.tensileStrength,
            heatNumber: `HT-${1000 + i}`
          }
        ],
        processesUsed: [
          { name: 'CNC Machining', parameters: 'Speed: 1000 RPM, Feed: 0.2 mm/rev' },
          { name: 'Surface Finishing', parameters: 'Ra < 0.8 μm' }
        ],
        qualityChecks: [
          { check: 'Dimensional Inspection', result: 'Pass' },
          { check: 'Visual Inspection', result: 'Pass' },
          { check: 'Material Verification', result: 'Pass' }
        ],
        complianceDeclaration: `Reference Standard: ISO 9001:2015, AS9100D, ISO 13485:2016\n\nStatement of Compliance: This is to certify that the parts identified above have been manufactured in accordance with all applicable specifications and standards. All required inspections and tests have been performed and the results are in compliance with the specified requirements.\n\nQA Person: John Smith, Quality Manager`,
        generatedDate: new Date(),
        createdBy: users[0].id,
        status: i % 2 === 0 ? 'approved' : 'draft',
        notes: `This certificate covers ${job.quantity} pieces of ${job.partNumber} manufactured for ${parties[i % parties.length].name}.`
      });

      // If the COC is approved, set the approver
      if (coc.status === 'approved') {
        await coc.update({
          approvedBy: users[1].id,
          approvedDate: new Date()
        });
      }

      // Create dimension reports for each COC
      const dimensionReports = [
        {
          cocId: coc.id,
          jobId: job.id,
          checkType: 'dimensional',
          checkDescription: 'Outer Diameter',
          specification: '50.00 mm',
          tolerance: '±0.02 mm',
          sample1: { value: '49.99', status: 'OK' },
          sample2: { value: '50.01', status: 'OK' },
          sample3: { value: '50.00', status: 'OK' },
          sample4: { value: '49.98', status: 'OK' },
          sample5: { value: '50.02', status: 'OK' },
          result: 'OK',
          measuredBy: users[0].id,
          measurementDate: new Date()
        },
        {
          cocId: coc.id,
          jobId: job.id,
          checkType: 'dimensional',
          checkDescription: 'Length',
          specification: '120.00 mm',
          tolerance: '±0.05 mm',
          sample1: { value: '119.97', status: 'OK' },
          sample2: { value: '120.03', status: 'OK' },
          sample3: { value: '120.01', status: 'OK' },
          sample4: { value: '119.99', status: 'OK' },
          sample5: { value: '120.02', status: 'OK' },
          result: 'OK',
          measuredBy: users[0].id,
          measurementDate: new Date()
        },
        {
          cocId: coc.id,
          jobId: job.id,
          checkType: 'visual',
          checkDescription: 'Surface Finish',
          specification: 'Ra < 0.8 μm',
          result: 'OK',
          measuredBy: users[0].id,
          measurementDate: new Date()
        }
      ];

      await DimensionReport.bulkCreate(dimensionReports);
      cocs.push(coc);
    }
    
    console.log(`✅ Successfully seeded ${cocs.length} COCs with dimension reports`);
  } catch (error) {
    console.error('Error seeding COCs:', error);
  } finally {
    process.exit();
  }
}

// Run the seed function
seedCOCs();
