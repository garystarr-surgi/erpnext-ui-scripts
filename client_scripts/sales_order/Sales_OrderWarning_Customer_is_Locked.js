frappe.ui.form.on('Sales Order', {
  customer: function(frm) {
    if (!frm.doc.customer) return;

    frappe.call({
      method: "frappe.client.get",
      args: {
        doctype: "Customer",
        name: frm.doc.customer
      },
      callback: function(r) {
        if (r.message && r.message.custom_account_locked) {
          frappe.msgprint({
            title: __("Customer Locked"),
            message: __("This customer is locked and cannot be used for Sales Orders."),
            indicator: "red"
          });
        }
      }
    });
  }
});
