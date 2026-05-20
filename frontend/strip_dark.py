import os
import re

def strip_dark_classes(directory):
    count = 0
    pattern = re.compile(r'\bdark:[a-zA-Z0-9_\-/#\[\]\.\\]+\b')
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        if 'dist' in dirs:
            dirs.remove('dist')
            
        for file in files:
            if file.endswith(('.jsx', '.html', '.css', '.js')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = pattern.sub('', content)
                    # clean double spaces
                    new_content = new_content.replace('  ', ' ')
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        count += 1
                        print(f"Stripped from: {path}")
                except Exception as e:
                    print(f"Failed to process {path}: {e}")
                    
    print(f"Total files updated: {count}")

strip_dark_classes(r'd:\Ai_Project\frontend')
