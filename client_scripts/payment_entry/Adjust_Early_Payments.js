frappe.ui.form.on('Payment Entry', {
    // Triggered when the main reference_date is entered or changed
    reference_date: function(frm) {
        if (frm.doc.reference_date && frm.doc.references && frm.doc.references.length > 0) {
            
            // Target only the first reference row (the one from the "Payment" button click)
            let target_row = frm.doc.references[0];

            if (target_row.reference_doctype === 'Sales Invoice' && target_row.reference_name) {
                frappe.db.get_value('Sales Invoice', target_row.reference_name, ['posting_date', 'base_net_total'], (r) => {
                    if (r) {
                        apply_single_discount_logic(frm, target_row, r.posting_date, r.base_net_total, frm.doc.reference_date);
                    }
                });
            }
        }
    }
});

function apply_single_discount_logic(frm, row, invoice_date, subtotal, ref_date) {
    let diff = frappe.datetime.get_diff(ref_date, invoice_date);
    let discount_perc = 0;

    // Logic for discount brackets
    if (diff >= 0 && diff <= 10) {
        discount_perc = 1.5;
    } else if (diff > 10 && diff <= 15) {
        discount_perc = 1.0;
    } else if (diff > 15 && diff <= 20) {
        discount_perc = 0.5;
    } else {
        // Clear if date is outside range and stop
        remove_discount_by_invoice(frm, row.reference_name);
        recalculate_final_paid_amount(frm);
        return;
    }

    if (discount_perc > 0) {
        let discount_amount = flt(subtotal * (discount_perc / 100), precision("amount", "Payment Entry Deduction"));
        
        // Ensure no double-entry for this specific invoice
        remove_discount_by_invoice(frm, row.reference_name);

        // Add to deductions
        let d = frm.add_child('deductions');
        d.account = "Revenue - Sales -SS"; 
        d.cost_center = "Main - SS";
        d.label = "Early Payment Discount";
        d.description = `Discount for ${row.reference_name}`;
        d.amount = discount_amount;
        
        recalculate_final_paid_amount(frm);
        
        frappe.show_alert({
            message: __(`${discount_perc}% discount applied for ${row.reference_name}`),
            indicator: 'green'
        });
    }
}

function remove_discount_by_invoice(frm, invoice_no) {
    let deductions = frm.doc.deductions || [];
    frm.doc.deductions = deductions.filter(d => d.description !== `Discount for ${invoice_no}`);
}

function recalculate_final_paid_amount(frm) {
    let total_allocated = frm.doc.references.reduce((sum, ref) => sum + flt(ref.allocated_amount), 0);
    let total_deductions = frm.doc.deductions.reduce((sum, ded) => sum + flt(ded.amount), 0);
    
    frm.set_value('paid_amount', total_allocated - total_deductions);
    frm.refresh_field('deductions');
    frm.refresh_field('paid_amount');
}
