frappe.ui.form.on('Quotation', {
    refresh: function(frm) {
        if (frm.doc.__islocal && !frm.doc.valid_till) {
            let quotation_date = frappe.datetime.str_to_obj(frm.doc.transaction_date);
            // Example: Add 90 days
            let valid_till = frappe.datetime.add_days(quotation_date, 2);
            frm.set_value('valid_till', frappe.datetime.obj_to_str(valid_till));
        }
    }
});
