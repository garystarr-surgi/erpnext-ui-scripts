frappe.ui.form.on('Purchase Order', {
    refresh: function(frm) {
        if (frm.doc.custom_acquisition) {
            frm.meta.default_print_format = "Surgi Acquisition Order";
        } else {
            frm.meta.default_print_format = "Surgi Purchase Order";
        }
    }
});
