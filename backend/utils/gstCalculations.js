// GST calculation utilities

// State code mappings for GST calculations
const STATE_CODES = {
  'AP': '37', // Andhra Pradesh
  'AR': '12', // Arunachal Pradesh
  'AS': '18', // Assam
  'BR': '10', // Bihar
  'CG': '22', // Chhattisgarh
  'GA': '30', // Goa
  'GJ': '24', // Gujarat
  'HR': '06', // Haryana
  'HP': '02', // Himachal Pradesh
  'JH': '20', // Jharkhand
  'KA': '29', // Karnataka
  'KL': '32', // Kerala
  'MP': '23', // Madhya Pradesh
  'MH': '27', // Maharashtra
  'MN': '14', // Manipur
  'ML': '17', // Meghalaya
  'MZ': '15', // Mizoram
  'NL': '13', // Nagaland
  'OR': '21', // Odisha
  'PB': '03', // Punjab
  'RJ': '08', // Rajasthan
  'SK': '11', // Sikkim
  'TN': '33', // Tamil Nadu
  'TG': '36', // Telangana
  'TR': '16', // Tripura
  'UP': '09', // Uttar Pradesh
  'UK': '05', // Uttarakhand
  'WB': '19', // West Bengal
  'AN': '35', // Andaman and Nicobar Islands
  'CH': '04', // Chandigarh
  'DH': '26', // Dadra and Nagar Haveli and Daman and Diu
  'DL': '07', // Delhi
  'JK': '01', // Jammu and Kashmir
  'LA': '02', // Ladakh
  'LD': '31', // Lakshadweep
  'PY': '34'  // Puducherry
};

/**
 * Calculate GST split based on place of supply and billing address
 * @param {number} taxableAmount - Amount before GST
 * @param {number} gstRate - GST rate percentage (e.g., 18 for 18%)
 * @param {string} placeOfSupply - State code of place of supply
 * @param {string} billingState - State code of billing address
 * @returns {Object} GST breakdown
 */
function calculateGSTSplit(taxableAmount, gstRate, placeOfSupply, billingState) {
  const gstAmount = (taxableAmount * gstRate) / 100;
  
  // If same state, use CGST + SGST
  if (placeOfSupply === billingState) {
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    
    return {
      cgstRate: gstRate / 2,
      sgstRate: gstRate / 2,
      igstRate: 0,
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      igstAmount: 0,
      totalGstAmount: parseFloat(gstAmount.toFixed(2)),
      isInterState: false
    };
  } else {
    // Different states, use IGST
    return {
      cgstRate: 0,
      sgstRate: 0,
      igstRate: gstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: parseFloat(gstAmount.toFixed(2)),
      totalGstAmount: parseFloat(gstAmount.toFixed(2)),
      isInterState: true
    };
  }
}

/**
 * Calculate tax stages for an invoice
 * @param {Array} items - Array of invoice items with quantity, rate, discount, gstRate
 * @param {number} additionalDiscount - Additional discount on total
 * @param {string} placeOfSupply - State code of place of supply
 * @param {string} billingState - State code of billing address
 * @returns {Object} Complete tax calculation
 */
function calculateInvoiceTax(items, additionalDiscount = 0, placeOfSupply, billingState) {
  let beforeTaxAmount = 0;
  let totalDiscount = additionalDiscount;
  let totalGstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  const itemCalculations = items.map(item => {
    const lineTotal = item.quantity * item.rate;
    const itemDiscount = item.discount || 0;
    const discountAmount = (lineTotal * itemDiscount) / 100;
    const taxableAmount = lineTotal - discountAmount;
    
    const gstCalc = calculateGSTSplit(taxableAmount, item.gstRate || 0, placeOfSupply, billingState);
    
    beforeTaxAmount += lineTotal;
    totalDiscount += discountAmount;
    totalGstAmount += gstCalc.totalGstAmount;
    cgstAmount += gstCalc.cgstAmount;
    sgstAmount += gstCalc.sgstAmount;
    igstAmount += gstCalc.igstAmount;
    
    return {
      ...item,
      lineTotal,
      discountAmount,
      taxableAmount,
      gstCalculation: gstCalc,
      afterTaxAmount: taxableAmount + gstCalc.totalGstAmount
    };
  });
  
  // Apply additional discount
  const additionalDiscountAmount = (beforeTaxAmount * additionalDiscount) / 100;
  totalDiscount += additionalDiscountAmount;
  
  const taxableAmount = beforeTaxAmount - totalDiscount;
  const afterTaxAmount = taxableAmount + totalGstAmount;
  
  return {
    beforeTaxAmount: parseFloat(beforeTaxAmount.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    cgstAmount: parseFloat(cgstAmount.toFixed(2)),
    sgstAmount: parseFloat(sgstAmount.toFixed(2)),
    igstAmount: parseFloat(igstAmount.toFixed(2)),
    totalGstAmount: parseFloat(totalGstAmount.toFixed(2)),
    afterTaxAmount: parseFloat(afterTaxAmount.toFixed(2)),
    grandTotal: parseFloat(afterTaxAmount.toFixed(2)),
    itemCalculations,
    isInterState: placeOfSupply !== billingState
  };
}

/**
 * Validate GST number format
 * @param {string} gstNumber - GST number to validate
 * @returns {boolean} Whether GST number is valid
 */
function validateGSTNumber(gstNumber) {
  if (!gstNumber) return false;
  
  // GST number format: XXAAAPXXXXAXZ
  // Where XX = State code, AAA = PAN first 3 chars, P = PAN 4th char,
  // XXXX = PAN last 4 chars, A = Additional code, X = Check digit, Z = Check sum
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  return gstRegex.test(gstNumber);
}

/**
 * Extract state code from GST number
 * @param {string} gstNumber - GST number
 * @returns {string} State code
 */
function getStateCodeFromGST(gstNumber) {
  if (!validateGSTNumber(gstNumber)) return null;
  return gstNumber.substring(0, 2);
}

/**
 * Get state name from state code
 * @param {string} stateCode - State code
 * @returns {string} State name
 */
function getStateName(stateCode) {
  const stateNames = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli and Daman and Diu',
    '27': 'Maharashtra',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh'
  };
  
  return stateNames[stateCode] || 'Unknown State';
}

/**
 * Calculate HSN-wise summary for GST returns
 * @param {Array} invoices - Array of invoices
 * @returns {Array} HSN-wise summary
 */
function calculateHSNSummary(invoices) {
  const hsnSummary = {};
  
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const hsn = item.hsnCode || 'UNCLASSIFIED';
      
      if (!hsnSummary[hsn]) {
        hsnSummary[hsn] = {
          hsnCode: hsn,
          description: item.description || '',
          uom: item.uom || 'NOS',
          quantity: 0,
          totalValue: 0,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalTax: 0
        };
      }
      
      hsnSummary[hsn].quantity += item.quantity || 0;
      hsnSummary[hsn].totalValue += (item.quantity * item.rate) || 0;
      hsnSummary[hsn].taxableAmount += item.taxableAmount || 0;
      hsnSummary[hsn].cgstAmount += item.cgstAmount || 0;
      hsnSummary[hsn].sgstAmount += item.sgstAmount || 0;
      hsnSummary[hsn].igstAmount += item.igstAmount || 0;
      hsnSummary[hsn].totalTax += (item.cgstAmount + item.sgstAmount + item.igstAmount) || 0;
    });
  });
  
  return Object.values(hsnSummary).map(item => ({
    ...item,
    totalValue: parseFloat(item.totalValue.toFixed(2)),
    taxableAmount: parseFloat(item.taxableAmount.toFixed(2)),
    cgstAmount: parseFloat(item.cgstAmount.toFixed(2)),
    sgstAmount: parseFloat(item.sgstAmount.toFixed(2)),
    igstAmount: parseFloat(item.igstAmount.toFixed(2)),
    totalTax: parseFloat(item.totalTax.toFixed(2))
  }));
}

module.exports = {
  STATE_CODES,
  calculateGSTSplit,
  calculateInvoiceTax,
  validateGSTNumber,
  getStateCodeFromGST,
  getStateName,
  calculateHSNSummary
};
