import frappe
import json

@frappe.whitelist(allow_guest=True)
def create_log():
    try:
        data = frappe.parse_json(frappe.local.form_dict.data)

        doc = frappe.get_doc({
            "doctype": "Voice Agent Call Log",
            "caller_name": data.get("caller_name", ""),
            "phone_number": data.get("phone_number", ""),
            "intent": data.get("intent", ""),
            "summary": data.get("summary", ""),
            "transcript": data.get("transcript", ""),
            "timestamp": data.get("timestamp", frappe.utils.now()),
            "status": data.get("status", "Lead")
        })
        doc.insert(ignore_permissions=True)
        return {"status": "success", "message": "Log created"}

    except Exception as e:
        return {"status": "error", "message": str(e)}

