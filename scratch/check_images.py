import urllib.request
import json
import ssl

supabase_url = "https://flygrbvvkaxriitxnzyi.supabase.co"

# We know the bucket is 'public-assets'
# Let's list the files using the REST API if possible, or just try to construct a known URL.
# Wait, we can't easily list files without the anon key if we do it manually, but we can just use the anon key.

supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    f"{supabase_url}/storage/v1/object/list/public-assets",
    data=json.dumps({"limit": 5, "offset": 0}).encode('utf-8'),
    headers={
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("Files in bucket:")
        for f in data:
            print("-", f['name'])
            
            # Now fetch the public URL
            public_url = f"{supabase_url}/storage/v1/object/public/public-assets/{f['name']}"
            print("  URL:", public_url)
            
            # Check if public URL is accessible
            try:
                head_req = urllib.request.Request(public_url, method='HEAD')
                with urllib.request.urlopen(head_req, context=ctx) as head_response:
                    print("  Status:", head_response.status)
                    print("  Content-Type:", head_response.getheader('Content-Type'))
            except urllib.error.HTTPError as e:
                print("  HTTP Error:", e.code, e.reason)
except urllib.error.HTTPError as e:
    print("Error listing files:", e.code, e.reason)
    print(e.read().decode('utf-8'))
