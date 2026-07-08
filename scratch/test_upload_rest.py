import urllib.request
import json
import ssl
import os

supabase_url = "https://flygrbvvkaxriitxnzyi.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

file_content = b"test upload data"
file_name = "test_upload_script.txt"

req = urllib.request.Request(
    f"{supabase_url}/storage/v1/object/public-assets/{file_name}",
    data=file_content,
    method="POST",
    headers={
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "text/plain"
    }
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Upload Response:", json.loads(response.read().decode('utf-8')))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
