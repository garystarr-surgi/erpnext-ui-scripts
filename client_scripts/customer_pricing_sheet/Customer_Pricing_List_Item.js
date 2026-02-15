frappe.ui.form.on('Customer Pricing Sheet Item', {
    base_item_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        if (!row.base_item_code) {
            return;
        }
        
        let customer = frm.doc.customer;
        
        if (!customer) {
            frappe.msgprint('Please select a Customer first');
            return;
        }
        
        // Clear all fields
        row.qty_ea = 0;
        row.qty_bx = 0;
        row.last_price_ea = 0;
        row.last_price_bx = 0;
        
        // Fetch data based on item suffix
        if (row.base_item_code.endsWith('E')) {
            fetch_and_populate(frm, customer, row.base_item_code, cdt, cdn, 'ea');
        }
        
        if (row.base_item_code.endsWith('B')) {
            fetch_and_populate(frm, customer, row.base_item_code, cdt, cdn, 'bx');
        }
    }
});

function fetch_and_populate(frm, customer, item_code, cdt, cdn, suffix) {
    frappe.call({
        method: 'get_customer_item_data',
        args: {
            customer: customer,
            item_code: item_code
        },
        callback: function(r) {
            console.log('Response for ' + item_code + ':', r);
            
            if (r.message) {
                let row = locals[cdt][cdn];
                
                // Update the row directly
                row['qty_' + suffix] = r.message.qty;
                row['last_price_' + suffix] = r.message.last_price;
                
                // Try to refresh the grid
                frm.refresh_field('items');
            }
        },
        error: function(err) {
            console.error('API Error:', err);
        }
    });
}
