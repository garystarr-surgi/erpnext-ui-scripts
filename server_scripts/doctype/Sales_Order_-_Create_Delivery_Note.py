if doc.docstatus == 1:
    dn_created = False
    dn_name = None
    # --- PHASE 1: CREATE DELIVERY NOTE ---
    try:
        result = frappe.call(
            "erpnext.selling.doctype.sales_order.sales_order.make_delivery_note",
            source_name=doc.name
        )
        if result and result.get("items"):
            dn = frappe.get_doc(result)
            
            # Ensure warehouse is set
            for item in dn.items:
                if not item.warehouse:
                    item.warehouse = doc.set_warehouse or "Stores - SS"
            
            dn.insert(ignore_permissions=True)
            
            dn_name = dn.name
            dn_created = True
                
    except Exception as e:
        # Silently log the error in the Background Error Logs
        frappe.log_error(message=str(e), title=f"Auto DN creation failed for {doc.name}")
    
    # --- PHASE 2: PRINTING DELIVERY NOTE ---
    if dn_created and dn_name:
        try:
            frappe.call(
                "surgi_print_dn.api.print_delivery_note_via_webhook",
                doc_name=dn_name,
                printer_name="HP_LaserJet_Pro_4001_75BDC1",
                print_format="Surgi Delivery Note"
            )
        except Exception as e:
            # Silently log the print error
            frappe.logger().error(f"Auto-print webhook failed for {dn_name}: {str(e)}")
    
    # --- PHASE 3: PRINT ATTACHMENTS ---
    try:
        # Get all attachments for this Sales Order
        attachments = frappe.get_all(
            "File",
            filters={
                "attached_to_doctype": "Sales Order",
                "attached_to_name": doc.name
            },
            fields=["name", "file_name", "file_url", "is_private"]
        )
        
        if attachments:
            for attachment in attachments:
                file_extension = attachment.file_name.lower().split('.')[-1]
                
                # Only print PDFs and DOC/DOCX files
                if file_extension in ['pdf', 'doc', 'docx']:
                    try:
                        # Call your print bridge to print the attachment
                        frappe.call(
                            "surgi_print_dn.api.print_attachment_via_webhook",
                            file_url=attachment.file_url,
                            file_name=attachment.file_name,
                            printer_name="HP_LaserJet_Pro_4001_75BDC1"
                        )
                    except Exception as e:
                        frappe.logger().error(f"Failed to print attachment {attachment.file_name} for {doc.name}: {str(e)}")
                        
    except Exception as e:
        frappe.log_error(message=str(e), title=f"Attachment printing failed for {doc.name}")
