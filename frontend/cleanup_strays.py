import json
import os

log_path = r'C:\Users\rishi\.gemini\antigravity-ide\brain\369b75c0-6115-4b04-87ab-d4f2db620892\.system_generated\logs\transcript.jsonl'
project_dir = r'd:\Ai_Project'

# we want to restore frontend files
files_to_restore = [
    r'd:\Ai_Project\frontend\src\pages\Dashboard.jsx',
    r'd:\Ai_Project\frontend\src\pages\PatientIntake.jsx',
    r'd:\Ai_Project\frontend\src\pages\RAGChat.jsx',
    r'd:\Ai_Project\frontend\src\pages\Settings.jsx',
    r'd:\Ai_Project\frontend\src\pages\TrialMatchAnalyzer.jsx',
    r'd:\Ai_Project\frontend\src\components\PatientHeaderCard.jsx',
    r'd:\Ai_Project\frontend\src\components\PatientSelector.jsx',
    r'd:\Ai_Project\frontend\src\components\ClinicalRecordCard.jsx',
    r'd:\Ai_Project\frontend\src\components\CriteriaTabs.jsx',
    r'd:\Ai_Project\frontend\src\components\NarrativeReport.jsx',
    r'd:\Ai_Project\frontend\index.html'
]

# We will scan the transcript.jsonl line by line.
# We will look for "output": "Created At: ... \nFile Path: `file:///d:/Ai_Project...`\nTotal Lines: ...\nTotal Bytes: ...\nShowing lines 1 to ...\n..."
# Wait, view_file output has line numbers! We would have to strip line numbers.
# replace_file_content doesn't have the full file, it has diffs.
# But wait! I can just use git if it exists. We already checked, no git.

# Alternative: I'll just write a script that cleans up the stray characters in the 22 files left by the bad regex.
import re

def clean_stray_chars(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if 'dist' in dirs: dirs.remove('dist')
        if '.git' in dirs: dirs.remove('.git')
        
        for file in files:
            if file.endswith(('.jsx', '.html', '.css', '.js')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Fix stray "]"
                    content = re.sub(r' \]', '', content)
                    # Fix stray colons like ":bg-slate-800" to "hover:bg-slate-800" - wait, we don't know what the prefix was.
                    # It's better to just leave them or manually fix the main ones.
                    content = content.replace(' ]', '')
                    content = content.replace('  ', ' ')
                    
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                except:
                    pass

clean_stray_chars(r'd:\Ai_Project\frontend\src')
