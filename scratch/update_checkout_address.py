import re

file_path = r'c:\Users\pc\Desktop\tranquil\src\app\checkout\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables
state_old = """  const [pinCode, setPinCode] = useState("");"""
state_new = """  const [pinCode, setPinCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");"""
content = content.replace(state_old, state_new)

# 2. Update handlePlaceOrder payload
payload_old = """            postal_code: pinCode,
            phone
          };"""
payload_new = """            postal_code: pinCode,
            phone,
            landmark,
            alternate_phone: alternatePhone
          };"""
content = content.replace(payload_old, payload_new)

# 3. Update nextStep insert
insert_old = """            postal_code: pinCode,
            country: 'India',
            phone: phone || userProfile?.phone,
            is_default: true
          }).select().single();"""
insert_new = """            postal_code: pinCode,
            country: 'India',
            phone: phone || userProfile?.phone,
            landmark,
            alternate_phone: alternatePhone,
            is_default: true
          }).select().single();"""
content = content.replace(insert_old, insert_new)

# 4. Update the form UI
form_old = """                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="PIN Code" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <button className="bg-[#111111] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C7A17A] transition-colors">
                                  Save Address
                                </button>"""
form_new = """                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="PIN Code" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Landmark (Optional)" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Primary Phone Number" required className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <input type="tel" value={alternatePhone} onChange={e => setAlternatePhone(e.target.value)} placeholder="Alternate Phone (Optional)" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <button className="bg-[#111111] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C7A17A] transition-colors">
                                  Save Address
                                </button>"""
content = content.replace(form_old, form_new)

# 5. Make sure phone is validated in nextStep
val_old = """if (!addressLine1 || !city || !state || !pinCode) {"""
val_new = """if (!addressLine1 || !city || !state || !pinCode || !phone) {"""
content = content.replace(val_old, val_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated checkout page successfully.")
