const { Party } = require('../models');
const sequelize = require('../config/database');

// Sample party data
const sampleParties = [
  {
    name: 'ABC Industries',
    type: 'customer',
    contactPerson: 'John Smith',
    email: 'john@abcindustries.com',
    phone: '9876543210',
    mobile: '9876543210',
    address: '123 Industrial Area, Phase 1',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    gstNumber: '27AAAAA0000A1Z5',
    panNumber: 'AAAAA0000A',
    stateCode: '27',
    creditLimit: 100000,
    creditDays: 30,
    paymentTerms: 'Net 30',
    notes: 'Regular customer for precision parts'
  },
  {
    name: 'XYZ Enterprises',
    type: 'vendor',
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@xyzenterprises.com',
    phone: '8765432109',
    mobile: '8765432109',
    address: '456 MIDC, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    gstNumber: '27BBBBB0000B1Z4',
    panNumber: 'BBBBB0000B',
    stateCode: '27',
    creditLimit: 50000,
    creditDays: 15,
    paymentTerms: 'Net 15',
    notes: 'Regular supplier of raw materials'
  },
  {
    name: 'Delta Engineering',
    type: 'customer',
    contactPerson: 'Amit Patel',
    email: 'amit@deltaeng.com',
    phone: '7654321098',
    mobile: '7654321098',
    address: '789 Tech Park, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    gstNumber: '29CCCCC0000C1Z2',
    panNumber: 'CCCCC0000C',
    stateCode: '29',
    creditLimit: 200000,
    creditDays: 45,
    paymentTerms: 'Net 45',
    notes: 'Long-term client for precision components'
  },
  {
    name: 'Omega Suppliers',
    type: 'vendor',
    contactPerson: 'Suresh Mehta',
    email: 'suresh@omegasuppliers.com',
    phone: '6543210987',
    mobile: '6543210987',
    address: '321 Industrial Estate',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    gstNumber: '27DDDDD0000D1Z1',
    panNumber: 'DDDDD0000D',
    stateCode: '27',
    creditLimit: 75000,
    creditDays: 30,
    paymentTerms: 'Net 30',
    notes: 'Quality metal supplier'
  },
  {
    name: 'Precision Tools Ltd',
    type: 'customer',
    contactPerson: 'Neha Sharma',
    email: 'neha@precisiontools.com',
    phone: '5432109876',
    mobile: '5432109876',
    address: '567 Manufacturing Hub, Phase 2',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600042',
    gstNumber: '33EEEEE0000E1Z8',
    panNumber: 'EEEEE0000E',
    stateCode: '33',
    creditLimit: 150000,
    creditDays: 60,
    paymentTerms: 'Net 60',
    notes: 'Bulk order customer'
  }
];

async function seedParties() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Check if parties already exist
    const existingPartyCount = await Party.count();
    if (existingPartyCount > 0) {
      console.log(`${existingPartyCount} parties already exist. Skipping seed.`);
      return;
    }
    
    // Create sample parties
    console.log('Creating sample parties...');
    await Promise.all(sampleParties.map(async (party) => {
      await Party.create(party);
    }));
    
    console.log(`✅ Successfully seeded ${sampleParties.length} parties`);
  } catch (error) {
    console.error('Error seeding parties:', error);
  } finally {
    process.exit();
  }
}

// Run the seed function
seedParties();
