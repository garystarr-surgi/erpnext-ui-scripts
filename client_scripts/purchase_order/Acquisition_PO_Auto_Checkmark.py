frappe.ui.form.on("Purchase Order", {
    onload(frm) {
        // only set on new document
        if (!frm.is_new()) return;

        // check if user has Acquisition role
        if (frappe.user.has_role("Acquisitions")) {
            frm.set_value("custom_acquisition", 1);
        }
    }
});
