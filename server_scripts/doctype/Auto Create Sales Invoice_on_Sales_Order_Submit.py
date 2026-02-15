if doc.docstatus == 1:
    si_created = False
    si_name = None
    
    # --- CREATE SALES INVOICE FROM SALES ORDER ---
    try:
        result = frappe.call(
            "erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice",
            source_name=doc.name
        )
        
        if result and result.get("items"):
            si = frappe.get_doc(result)
            
            # Optional: Set due date if needed
            # si.due_date = frappe.utils.add_days(si.posting_date, 30)
            
            si.insert(ignore_permissions=True)
            si.submit()
            
            si_name = si.name
            si_created = True
                
    except Exception as e:
        frappe.log_error(
            message=str(e), 
            title=f"Auto SI creation failed for {doc.name}"
        )
    
   
