# Get parameters from the request
customer = frappe.form_dict.get('customer')
item_code = frappe.form_dict.get('item_code')

result = {
    'qty': 0,
    'last_price': 0
}

# Validate we have the required parameters
if not customer or not item_code:
    frappe.response['message'] = result
else:
    # Get warehouse quantity
    bin_qty = frappe.db.get_value('Bin', 
        {
            'item_code': item_code, 
            'warehouse': 'Stores - SS'
        }, 
        'actual_qty'
    )
    
    result['qty'] = bin_qty or 0
    
    # Get last price from Sales Invoice
    last_price_query = frappe.db.sql("""
        SELECT sii.rate 
        FROM `tabSales Invoice Item` sii
        INNER JOIN `tabSales Invoice` si ON si.name = sii.parent
        WHERE si.customer = %s 
        AND sii.item_code = %s
        AND si.docstatus = 1
        ORDER BY si.posting_date DESC, si.creation DESC
        LIMIT 1
    """, (customer, item_code))
    
    if last_price_query and len(last_price_query) > 0:
        result['last_price'] = last_price_query[0][0] or 0
    
    # Set the response
    frappe.response['message'] = result
