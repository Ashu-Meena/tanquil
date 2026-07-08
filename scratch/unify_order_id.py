import re

# 1. checkout/page.tsx
file_checkout = r'c:\Users\pc\Desktop\tranquil\src\app\checkout\page.tsx'
with open(file_checkout, 'r', encoding='utf-8') as f:
    content_checkout = f.read()

email_old = """                  <p>Thank you for your order! We've received it and will process it shortly.</p>"""
email_new = """                  <p>Thank you for your order! We've received it and will process it shortly.</p>
                  <p><strong>Order ID:</strong> #{orderNumber}</p>"""
if email_old in content_checkout:
    content_checkout = content_checkout.replace(email_old, email_new)
with open(file_checkout, 'w', encoding='utf-8') as f:
    f.write(content_checkout)


# 2. account/page.tsx
file_account = r'c:\Users\pc\Desktop\tranquil\src\app\account\page.tsx'
with open(file_account, 'r', encoding='utf-8') as f:
    content_account = f.read()

type_old_acc = """interface Order {
  id: string;"""
type_new_acc = """interface Order {
  id: string;
  order_number?: string;"""
if type_old_acc in content_account:
    content_account = content_account.replace(type_old_acc, type_new_acc)

render_old_acc = """<p className="text-sm font-medium text-[#111111]">{order.id.split('-')[0].toUpperCase()}</p>"""
render_new_acc = """<p className="text-sm font-medium text-[#111111]">{(order.order_number || order.id.split('-')[0]).toUpperCase()}</p>"""
if render_old_acc in content_account:
    content_account = content_account.replace(render_old_acc, render_new_acc)

with open(file_account, 'w', encoding='utf-8') as f:
    f.write(content_account)


# 3. admin/(dashboard)/orders/page.tsx
file_admin = r'c:\Users\pc\Desktop\tranquil\src\app\admin\(dashboard)\orders\page.tsx'
with open(file_admin, 'r', encoding='utf-8') as f:
    content_admin = f.read()

type_old_admin = """type Order = {
  id: string;"""
type_new_admin = """type Order = {
  id: string;
  order_number?: string;"""
if type_old_admin in content_admin:
    content_admin = content_admin.replace(type_old_admin, type_new_admin)

search_old = """o.id.toLowerCase().includes(search.toLowerCase())"""
search_new = """(o.order_number || o.id).toLowerCase().includes(search.toLowerCase())"""
if search_old in content_admin:
    content_admin = content_admin.replace(search_old, search_new)

render_old_admin_1 = """#{order.id.slice(0, 8).toUpperCase()}"""
render_new_admin_1 = """#{order.order_number || order.id.slice(0, 8).toUpperCase()}"""
if render_old_admin_1 in content_admin:
    content_admin = content_admin.replace(render_old_admin_1, render_new_admin_1)

render_old_admin_2 = """#{selectedOrder.id.slice(0, 8).toUpperCase()}"""
render_new_admin_2 = """#{selectedOrder.order_number || selectedOrder.id.slice(0, 8).toUpperCase()}"""
if render_old_admin_2 in content_admin:
    content_admin = content_admin.replace(render_old_admin_2, render_new_admin_2)

with open(file_admin, 'w', encoding='utf-8') as f:
    f.write(content_admin)

print("Order IDs unified successfully.")
