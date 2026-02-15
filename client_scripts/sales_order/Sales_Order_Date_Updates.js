frappe.ui.form.on('Sales Order', {
    transaction_date: function(frm) {
        if (frm.doc.transaction_date && !frm.doc.delivery_date) {
            frm.set_value('delivery_date', frm.doc.transaction_date);
        }
    },
    
    delivery_date: function(frm) {
        if (frm.doc.delivery_date && frm.doc.items && frm.doc.items.length > 0) {
            frm.doc.items.forEach(function(item) {
                frappe.model.set_value(item.doctype, item.name, 'delivery_date', frm.doc.delivery_date);
            });
            frm.refresh_field('items');
        }
    },
    
    refresh: function(frm) {
        if (frm.is_new() && frm.doc.transaction_date && !frm.doc.delivery_date) {
            frm.set_value('delivery_date', frm.doc.transaction_date);
        }
    }
});

frappe.ui.form.on('Sales Order Item', {
    items_add: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (frm.doc.delivery_date && !row.delivery_date) {
            frappe.model.set_value(cdt, cdn, 'delivery_date', frm.doc.delivery_date);
        }
    }
});
