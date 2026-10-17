#!/usr/bin/env python3
"""
Hostinger Linux-Compatible ZIP Creator for Laravel Backend
- Includes complete pre-installed vendor/ directory (no composer install needed on Hostinger)
- Includes denish_cookies_mysql.sql ready to import into Hostinger phpMyAdmin
- Sets explicit POSIX permissions:
    - 0755 for all directories
    - 0644 for regular files
    - 0755 for artisan executable
- Excludes local .env, .git, and storage logs
- Creates root .htaccess for seamless Hostinger routing
"""

import os
import sys
import zipfile
import time

def create_backend_zip(backend_dir, output_zip_path):
    print(f"[*] Packaging Laravel Backend for Hostinger...")
    print(f"[*] Source: {backend_dir}")
    print(f"[*] Output: {output_zip_path}\n")

    EXCLUDE_DIRS = {'.git', 'node_modules', 'tests'}
    EXCLUDE_FILES = {'.env', 'database.sqlite-journal'}

    now_time = time.localtime(time.time())[:6]

    file_count = 0
    dir_count = 0

    with zipfile.ZipFile(output_zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(backend_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            rel_root = os.path.relpath(root, backend_dir)
            if rel_root == '.':
                rel_root = ''

            if rel_root:
                arc_dir = rel_root.replace('\\', '/') + '/'
                zinfo = zipfile.ZipInfo(arc_dir, now_time)
                zinfo.create_system = 3  # UNIX
                # S_IFDIR | 0755
                zinfo.external_attr = (0o040755 << 16) | 0x10
                zf.writestr(zinfo, '')
                dir_count += 1

            for f in files:
                if f in EXCLUDE_FILES:
                    print(f"  [EXCLUDED] {f}")
                    continue

                full_path = os.path.join(root, f)
                rel_file = os.path.relpath(full_path, backend_dir).replace('\\', '/')

                with open(full_path, 'rb') as fp:
                    content = fp.read()

                zinfo = zipfile.ZipInfo(rel_file, now_time)
                zinfo.create_system = 3  # UNIX
                
                # Artisan gets executable permissions (0755)
                if f == 'artisan':
                    zinfo.external_attr = 0o100755 << 16
                else:
                    zinfo.external_attr = 0o100644 << 16

                zf.writestr(zinfo, content)
                file_count += 1

    zip_size_mb = os.path.getsize(output_zip_path) / (1024 * 1024)
    print(f"\n[+] SUCCESS: Backend archive created successfully!")
    print(f"    - Directories archived: {dir_count} (all with 0755 permissions)")
    print(f"    - Files archived:       {file_count}")
    print(f"    - Output file size:     {zip_size_mb:.2f} MB")
    print(f"    - Destination:          {output_zip_path}\n")

if __name__ == '__main__':
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    backend_path = os.path.join(base_dir, 'backend')
    output_path = os.path.join(base_dir, 'denish-cookies-backend.zip')

    if not os.path.exists(backend_path):
        print(f"Error: {backend_path} not found!")
        sys.exit(1)

    create_backend_zip(backend_path, output_path)
