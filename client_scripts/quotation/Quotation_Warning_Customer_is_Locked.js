frappe.ui.form.on(["Quotation", "Sales Order"], {
  onload(frm) {
    // Attach listener directly to the customer field once the form loads
    frm.fields_dict.customer.df.onchange = () => {
      if (frm.doc.customer) {
        check_customer_lock(frm);
      }
    };
  },

  refresh(frm) {
    // Also check when loading or refreshing
    if (frm.doc.customer) {
      check_customer_lock(frm);
    }
  },

  validate(frm) {
    // Block saving if locked
    if (frm.doc.customer) {
      frappe.call({
        method: "frappe.client.get_value",
        args: {
          doctype: "Customer",
          fieldname: "custom_account_locked",
          filters: { name: frm.doc.customer }
        },
        async: false,
        callback: function (r) {
          if (r.message && r.message.custom_account_locked) {
            frappe.throw(__("This customer is locked and cannot be used for " + frm.doctype + "."));
          }
        }
      });
    }
  }
});

function check_customer_lock(frm) {
  frappe.call({
    method: "frappe.client.get_value",
    args: {
      doctype: "Customer",
      fieldname: "custom_account_locked",
      filters: { name: frm.doc.customer }
    },
    callback: function (r) {
      if (r.message && r.message.custom_account_locked) {
        frappe.msgprint({
          title: __("Customer Locked"),
          message: __("This customer is locked and cannot be used for " + frm.doctype + "."),
          indicator: "red"
        });
        frm.set_value("customer", null);
      }
    }
  });
}
