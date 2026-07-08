import os
import re

root_dir = r"c:\Users\pc\Desktop\tranquil\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'alert(' not in content:
        return

    # Add import
    if 'import { toast }' not in content:
        lines = content.split('\n')
        # Find last import
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import_idx = i
        
        lines.insert(last_import_idx + 1, 'import { toast } from "@/store/useToastStore";')
        content = '\n'.join(lines)

    # Replace alert
    # Logic: if 'error' or 'fail' in the alert message (case insensitive), use toast.error. Otherwise use toast.success.
    
    def replacer(match):
        full_match = match.group(0)
        inner_content = match.group(1)
        if 'error' in inner_content.lower() or 'fail' in inner_content.lower() or 'not found' in inner_content.lower():
            return f"toast.error({inner_content})"
        else:
            # Info or success? Usually success or warning. Let's use toast.success as default for everything that is not an error
            # Wait, CartDrawer says "Please login or register" -> this is an info/warning.
            if 'login' in inner_content.lower() or 'please' in inner_content.lower():
                return f"toast.info({inner_content})"
            return f"toast.success({inner_content})"
            
    content = re.sub(r'alert\((.*?)\)', replacer, content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith('.tsx') or filename.endswith('.ts'):
            filepath = os.path.join(dirpath, filename)
            process_file(filepath)

print("Alerts replaced.")
