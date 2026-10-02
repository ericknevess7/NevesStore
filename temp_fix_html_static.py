from pathlib import Path
import re

root = Path(r'c:\Users\erick neves\NevesStore\frontend')

for path in root.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    original = text

    if not text.lstrip('\ufeff').startswith('{% load static %}'):
        text = '{% load static %}\n' + text.lstrip('\ufeff')

    def replace_assets(match):
        path_value = match.group('path')
        return "\"{% static '" + path_value + "' %}\""

    text = re.sub(r'(?P<quote>["\'])assets/(?P<path>[^"\']+)(?P=quote)', replace_assets, text)

    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Updated {path.relative_to(root)}')
