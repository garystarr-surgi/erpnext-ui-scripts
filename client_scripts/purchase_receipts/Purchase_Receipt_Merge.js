frappe.ui.form.on('Purchase Receipt', {
    refresh(frm) {
        frm.add_custom_button(__('Combine Purchase Orders'), function() {
            // Check if supplier is selected
            if (!frm.doc.supplier) {
                frappe.msgprint(__('Please select a Supplier first'));
                return;
            }
            
            new frappe.ui.form.MultiSelectDialog({
                doctype: "Purchase Receipt",
                target: frm,
                setters: {
                    supplier: frm.doc.supplier,
                    workflow_state: null
                },
                add_filters_group: 1,
                date_field: "posting_date",
                get_query() {
                    return {
                        filters: {
                            docstatus: ['!=', 2],
                            workflow_state: ['!=', 'Completed'],
                            supplier: frm.doc.supplier,
                            name: ['!=', frm.doc.name]
                        }
                    }
                },
                action(selections) {
                    // Fetch and merge items from selected purchase receipts
                    selections.forEach(function(pr_name) {
                        frappe.model.with_doc('Purchase Receipt', pr_name, function() {
                            let source_doc = frappe.model.get_doc('Purchase Receipt', pr_name);
                            
                            // Loop through items in the source purchase receipt
                            $.each(source_doc.items, function(index, row) {
                                let child = frm.add_child('items');
                                child.item_code = row.item_code;
                                child.item_name = row.item_name;
                                child.description = row.description;
                                child.qty = row.qty;
                                child.received_qty = row.received_qty;
                                child.accepted_qty = row.accepted_qty;
                                child.rejected_qty = row.rejected_qty;
                                child.uom = row.uom;
                                child.stock_uom = row.stock_uom;
                                child.conversion_factor = row.conversion_factor;
                                child.rate = row.rate;
                                child.amount = row.amount;
                                child.warehouse = row.warehouse;
                                child.accepted_warehouse = row.accepted_warehouse;
                                child.rejected_warehouse = row.rejected_warehouse;
                                child.batch_no = row.batch_no;
                                child.purchase_order = row.purchase_order;
                                child.purchase_order_item = row.purchase_order_item;
                            });
                            
                            frm.refresh_field('items');
                        });
                    });
                    
                    frappe.show_alert({
                        message: __('Items merged from {0} purchase receipt(s)', [selections.length]),
                        indicator: 'green'
                    }, 5);
                }
            });
        });
    }
});
