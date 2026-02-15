# Target emails that are 'Open' and older than 30 days
# This ensures active conversations aren't deleted
days_to_keep = -30
threshold_date = frappe.utils.add_days(frappe.utils.nowdate(), days_to_keep)

# Fetch the list of open, unlinked emails older than the threshold
emails_to_delete = frappe.get_all("Communication", filters={
    "status": "Open",
    "reference_doctype": ["is", "not set"], # Only junk not attached to a record
    "sent_or_received": "Received",
    "creation": ["<", threshold_date]
})

# Delete the records
for email in emails_to_delete:
    frappe.delete_doc("Communication", email.name, ignore_permissions=True)

# Optional: Log the action to the system console
if emails_to_delete:
    frappe.msgprint(f"Cleaned up {len(emails_to_delete)} old open emails.")
