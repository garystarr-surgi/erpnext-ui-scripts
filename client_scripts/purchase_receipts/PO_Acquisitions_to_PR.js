frappe.ui.form.on("Purchase Receipt", {
    refresh(frm) {
        set_acquisition_from_po(frm);
    },

    items_add(frm) {
        set_acquisition_from_po(frm);
    }
});

function set_acquisition_from_po(frm) {
    if (!frm.doc.items || frm.doc.items.length === 0) return;

    // get PO from first item
    let po = frm.doc.items[0].purchase_order;
    if (!po) return;

    frappe.db.get_value("Purchase Order", po, "custom_acquisition")
        .then(r => {
            if (r.message && r.message.custom_acquisition !== undefined) {
                frm.set_value("custom_acquisition", r.message.custom_acquisition);
            }
        });
}
