frappe.ui.form.on('Customer', {
    refresh(frm) {
        restrict_credit_limit_access(frm);
    },
    custom_facility_type(frm) {
        update_credit_limit(frm);
    }
});

function restrict_credit_limit_access(frm) {
    // Disable the child table fields by default
    frm.fields_dict.credit_limits.grid.wrapper.find('.grid-remove-rows').hide();
    frm.fields_dict.credit_limits.grid.wrapper.find('.grid-add-row').hide();
    
    // Check user roles
    if (!frappe.user.has_role('Accounts Manager') && !frappe.user.has_role('System Manager')) {
        // Loop through each row and disable editing
        frm.fields_dict.credit_limits.grid.wrapper.find('[data-fieldname="credit_limit"]').prop('disabled', true);
    } else {
        // Show add/remove buttons for authorized users
        frm.fields_dict.credit_limits.grid.wrapper.find('.grid-remove-rows').show();
        frm.fields_dict.credit_limits.grid.wrapper.find('.grid-add-row').show();
    }
}

function update_credit_limit(frm) {
    if (!frm.doc.custom_facility_type) return;

    const limits = {
        'Hospital': 40000,
        'Surgery Center': 10000,
        'Urgent Care': 10000,
        'Veterinary': 10000,
        'B2B': 999999,
        'Wholesale': 999999
    };

    const new_limit = limits[frm.doc.custom_facility_type] || 0;

    // Find existing child or create new
    let child = frm.doc.credit_limits && frm.doc.credit_limits.length > 0
        ? frm.doc.credit_limits[0]
        : frm.add_child('credit_limits', { company: frappe.defaults.get_default('company') });

    frappe.model.set_value(child.doctype, child.name, 'credit_limit', new_limit);
    frm.refresh_field('credit_limits');
}
