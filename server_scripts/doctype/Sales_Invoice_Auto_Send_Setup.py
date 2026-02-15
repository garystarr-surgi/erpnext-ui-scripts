"""
Server Script: Sales Invoice - Auto Send Setup
Type: DocType Event
DocType: Sales Invoice
Event: Before Submit
"""

# Skip auto-send for returns/credit notes
if not doc.is_return:
    # Calculate send time (24 hours from now) using frappe.utils
    send_time = frappe.utils.add_to_date(frappe.utils.now_datetime(), hours=1)
    
    # Set custom field values (we only need send_time and status)
    doc.custom_scheduled_send_time = send_time
    doc.custom_auto_send_status = 'Scheduled'
    
    frappe.msgprint(
        "Invoice will be automatically sent to customer on " + str(frappe.utils.format_datetime(send_time)),
        indicator='green',
        title='Auto-Send Scheduled'
    )
