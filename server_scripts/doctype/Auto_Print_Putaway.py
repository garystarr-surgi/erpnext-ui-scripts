if doc.workflow_state == "Putaway in Progress":
    # Check if this is a state change (not already in this state on load)
    if frappe.db.get_value("Purchase Receipt", doc.name, "workflow_state") == "Procurement in Progress":
        try:
            # Call the generic print webhook API
            frappe.call(
                "surgi_print_dn.api.print_document_via_webhook",
                doctype="Purchase Receipt",
                doc_name=doc.name,
                printer_name="Brother_HL_L6200DW_series",
                print_format="Surgi Put Away"
            )
        except Exception as e:
            # Silently log the print error
            frappe.log_error(
                message=str(e), 
                title=f"Auto-print Surgi Put Away failed for {doc.name}"
            )
