import re
import sys

# 1. Update checkout/page.tsx
file_path_checkout = r'c:\Users\pc\Desktop\tranquil\src\app\checkout\page.tsx'

INDIAN_STATES = """const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
"""

with open(file_path_checkout, 'r', encoding='utf-8') as f:
    content = f.read()

# Add INDIAN_STATES
content = content.replace('const steps = ["Shipping", "Payment", "Review"];', INDIAN_STATES + '\nconst steps = ["Shipping", "Payment", "Review"];')

# Add formError state
state_old = """  const [isLoadingAuth, setIsLoadingAuth] = useState(true);"""
state_new = """  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [formError, setFormError] = useState("");"""
content = content.replace(state_old, state_new)

# Make sure to reset formError when nextStep or prevStep happens
next_old = """  const nextStep = async () => {"""
next_new = """  const nextStep = async () => {
    setFormError("");"""
content = content.replace(next_old, next_new)

prev_old = """  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));"""
prev_new = """  const prevStep = () => { setFormError(""); setCurrentStep(prev => Math.max(prev - 1, 0)); };"""
content = content.replace(prev_old, prev_new)

# Replace alerts
content = content.replace('alert("Please enter Transaction ID and upload screenshot.");', 'setFormError("Please enter Transaction ID and upload screenshot.");')
content = content.replace('alert("Some items in your cart are no longer available in our store. Please review and update your cart.");', 'setFormError("Some items in your cart are no longer available in our store. Please review and update your cart.");')
content = content.replace('alert("Error placing order. Please try again.");', 'setFormError("Error placing order. Please try again.");')
content = content.replace('alert("Please fill in all required address fields.");', 'setFormError("Please fill in all required address fields.");')
content = content.replace('alert("Please enter a valid address, city, and state.");', 'setFormError("Please enter a valid address, city, and state.");')
content = content.replace('alert("Please enter a valid 6-digit Indian PIN Code.");', 'setFormError("Please enter a valid 6-digit Indian PIN Code.");')
content = content.replace('alert("The PIN Code you entered does not appear to be valid. Please check and try again.");', 'setFormError("The PIN Code you entered does not appear to be valid. Please check and try again.");')

# Render formError
error_render = """            </div>

            <div>"""
error_render_new = """            </div>
            
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-sm">
                {formError}
              </div>
            )}

            <div>"""
content = content.replace(error_render, error_render_new)

# Replace state input
state_input_old1 = """<input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />"""
state_input_new1 = """<select value={state} onChange={e => setState(e.target.value)} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm text-[#666]">
                                    <option value="" disabled>Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>"""
content = content.replace(state_input_old1, state_input_new1)

state_input_old2 = """<input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />"""
state_input_new2 = """<select value={state} onChange={e => setState(e.target.value)} className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors text-[#666]">
                              <option value="" disabled>Select State</option>
                              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>"""
content = content.replace(state_input_old2, state_input_new2)


with open(file_path_checkout, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update account/page.tsx
file_path_account = r'c:\Users\pc\Desktop\tranquil\src\app\account\page.tsx'
with open(file_path_account, 'r', encoding='utf-8') as f:
    content = f.read()

# Add INDIAN_STATES
content = content.replace('export default function AccountPage() {', INDIAN_STATES + '\nexport default function AccountPage() {')

# Replace state input
state_input_old3 = """<input required type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />"""
state_input_new3 = """<select required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] text-[#666]">
                          <option value="" disabled>Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>"""
content = content.replace(state_input_old3, state_input_new3)

with open(file_path_account, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated checkout and account pages successfully.")
