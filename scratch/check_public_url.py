import urllib.request
import ssl

supabase_url = "https://flygrbvvkaxriitxnzyi.supabase.co"
url = f"{supabase_url}/storage/v1/object/public/public-assets/test.jpg"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request(url, method='HEAD')
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Status:", response.status)
        print("Content-Type:", response.getheader('Content-Type'))
except Exception as e:
    print("Error:", e)
