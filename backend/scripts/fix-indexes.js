const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');

// Common camelCase to snake_case conversions for index fields
const fieldMappings = {
  // Order model
  'orderNumber': 'order_number',
  'poNumber': 'po_number', 
  'partyId': 'party_id',
  'orderDate': 'order_date',
  'hasNegativeFlag': 'has_negative_flag',
  
  // Party model  
  'partyCode': 'party_code',
  'gstNumber': 'gst_number',
  
  // OrderItem model
  'orderId': 'order_id',
  'itemId': 'item_id',
  'unitPrice': 'unit_price',
  'totalPrice': 'total_price',
  'partNumber': 'part_number',
  'hsnCode': 'hsn_code',
  'orderItemId': 'order_item_id',
  'employeeId': 'employee_id',
  'targetCompletionDate': 'target_completion_date',
  'processId': 'process_id',
  'stepNumber': 'step_number',
  
  // Job model
  'jobNumber': 'job_number',
  'startDate': 'start_date',
  'endDate': 'end_date',
  'actualStartDate': 'actual_start_date',
  'actualEndDate': 'actual_end_date',
  
  // COC model
  'cocNumber': 'coc_number',
  'jobId': 'job_id',
  'createdBy': 'created_by',
  'approvedBy': 'approved_by',
  'issueDate': 'issue_date',
  'invoiceNumber': 'invoice_number',
  'batchNumber': 'batch_number',
  'cocId': 'coc_id',
  
  // Dimension Reports model
  'checkType': 'check_type',
  'measuredBy': 'measured_by',
  
  // InternalMessage model
  'messageType': 'message_type',
  'readAt': 'read_at',
  'createdAt': 'created_at',
  'messageId': 'message_id',
  'fromUserId': 'from_user_id',
  'toUserId': 'to_user_id',
  'relatedJobId': 'related_job_id',
  'isArchived': 'is_archived',
  
  // Material model
  'materialCode': 'material_code',
  'materialName': 'material_name',
  'reorderLevel': 'reorder_level',
  'currentStock': 'current_stock',
  'lastStockUpdate': 'last_stock_update',
  'isLowStock': 'is_low_stock',
  'expiryAlert': 'expiry_alert',
  
  // Common patterns
  'userId': 'user_id',
  'updatedAt': 'updated_at',
  'isActive': 'is_active',
  'isRead': 'is_read'
};

function fixIndexFields(content) {
  let fixed = content;
  
  // Replace field names in index definitions
  for (const [camelCase, snakeCase] of Object.entries(fieldMappings)) {
    // Match patterns like: fields: ['fieldName']
    const regex = new RegExp(`(fields:\\s*\\[\\s*['"]\)${camelCase}(['"]\\s*\\])`, 'g');
    fixed = fixed.replace(regex, `$1${snakeCase}$2`);
    
    // Match patterns like: fields: ['field1', 'fieldName']  
    const regex2 = new RegExp(`(['"]\\s*,\\s*['"]\)${camelCase}(['"]\\s*\\])`, 'g');
    fixed = fixed.replace(regex2, `$1${snakeCase}$2`);
    
    // Match patterns like: fields: ['fieldName', 'field2']
    const regex3 = new RegExp(`(fields:\\s*\\[\\s*['"]\)${camelCase}(['"]\\s*,)`, 'g');
    fixed = fixed.replace(regex3, `$1${snakeCase}$2`);
  }
  
  return fixed;
}

function fixModelFiles() {
  const files = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  
  for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has indexes
    if (content.includes('indexes: [')) {
      console.log(`Fixing indexes in ${file}...`);
      const fixedContent = fixIndexFields(content);
      
      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ Fixed indexes in ${file}`);
      } else {
        console.log(`ℹ️  No changes needed in ${file}`);
      }
    }
  }
}

console.log('Starting index field name fixes...');
fixModelFiles();
console.log('✅ Index fixes completed!');
