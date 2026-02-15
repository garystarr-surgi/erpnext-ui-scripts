"""
Server Script for Payment Entry (After Submit)
Automatically closes linked Purchase Orders when their Purchase Invoices are paid via this payment
"""

# Only process if this is a payment against supplier (Purchase Invoice payment)
if doc.payment_type == 'Pay' and doc.party_type == 'Supplier':
    
    # Loop through all references in the payment entry
    for ref in doc.references:
        # Check if this reference is a Purchase Invoice
        if ref.reference_doctype == 'Purchase Invoice':
            try:
                # Get the Purchase Invoice
                pi = frappe.get_doc('Purchase Invoice', ref.reference_name)
                
                # Check if PI has a linked Purchase Order
                if pi.custom_purchase_order_number:
                    # Get the Purchase Order
                    po = frappe.get_doc('Purchase Order', pi.custom_purchase_order_number)
                    
                    # Check if PO is not already closed
                    if po.status != 'Closed':
                        # Close the Purchase Order
                        po.db_set('status', 'Closed')
                        po.add_comment('Comment', 
                            f'Auto-closed: Purchase Invoice {pi.name} paid via Payment Entry {doc.name}')
                        
                        frappe.msgprint(
                            f'Purchase Order {pi.custom_purchase_order_number} auto-closed (PI {pi.name} paid)',
                            alert=True,
                            indicator='green'
                        )
                        
            except Exception as e:
                frappe.log_error(
                    message=f'Error closing PO for PI {ref.reference_name}: {str(e)}',
                    title='Auto-Close PO from Payment Entry Failed'
                )
                # Don't prevent payment submission, just log the error
