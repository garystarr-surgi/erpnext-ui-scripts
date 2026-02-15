frappe.ui.form.on('Customer', {
    refresh: function(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__('Purchase History'), function() {
                frappe.set_route('query-report', 'Customer Item Purchase History', {
                    'customer': frm.doc.name  // lowercase
                });
            }, __('Reports'));
        }
    }
});
