import re

file_path = r'c:\Users\pc\Desktop\tranquil\src\app\account\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update addressForm state initialization
state_old = """  const [addressForm, setAddressForm] = useState({
    name: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", phone: ""
  });"""
state_new = """  const [addressForm, setAddressForm] = useState({
    name: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", phone: "", landmark: "", alternate_phone: ""
  });"""
content = content.replace(state_old, state_new)

# 2. Update addressForm state reset
reset_old = """      setAddressForm({ name: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", phone: "" });"""
reset_new = """      setAddressForm({ name: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", phone: "", landmark: "", alternate_phone: "" });"""
content = content.replace(reset_old, reset_new)

# 3. Add fields to form UI
form_old = """                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Phone Number</label>
                        <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                    </div>"""
form_new = """                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Landmark (Optional)</label>
                        <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Phone Number</label>
                        <input required type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Alternate Phone (Optional)</label>
                        <input type="tel" value={addressForm.alternate_phone} onChange={e => setAddressForm({...addressForm, alternate_phone: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                    </div>"""
content = content.replace(form_old, form_new)

# 4. Update address display to show the fields
display_old = """                          {addr.city}, {addr.state} {addr.postal_code}<br />
                          {addr.country}<br />
                          Phone: {addr.phone || userProfile?.phone || 'Not provided'}
                        </p>"""
display_new = """                          {addr.city}, {addr.state} {addr.postal_code}<br />
                          {addr.country}<br />
                          {addr.landmark && <>Landmark: {addr.landmark}<br /></>}
                          Phone: {addr.phone || userProfile?.phone || 'Not provided'}<br />
                          {addr.alternate_phone && <>Alternate Phone: {addr.alternate_phone}</>}
                        </p>"""
content = content.replace(display_old, display_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated account page successfully.")
