import urllib.request
import json
import ssl

supabase_url = "https://flygrbvvkaxriitxnzyi.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# List files
req = urllib.request.Request(
    f"{supabase_url}/storage/v1/object/list/public-assets",
    data=json.dumps({"limit": 5, "offset": 0, "prefix": ""}).encode('utf-8'),
    headers={
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))
        files = [f for f in data if f['name'] != '.emptyFolderPlaceholder']
        if files:
            file_to_delete = files[0]['name']
            print("Trying to delete:", file_to_delete)
            
            # Delete file
            del_req = urllib.request.Request(
                f"{supabase_url}/storage/v1/object/public-assets",
                data=json.dumps({"prefixes": [file_to_delete]}).encode('utf-8'),
                method="DELETE",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            with urllib.request.urlopen(del_req, context=ctx) as del_resp:
                del_data = json.loads(del_resp.read().decode('utf-8'))
                print("Delete Response:", del_data)
        else:
            print("No files to delete.")
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
