#!/usr/bin/env python3
"""
Hostinger Linux-Compatible ZIP Creator for Next.js Frontend
- Uses forward slashes (/) exclusively for Linux path compatibility.
- Explicitly writes UNIX POSIX permissions:
    - 0755 (rwxr-xr-x) for all directories (prevents EACCES on [slug] folders)
    - 0644 (rw-r--r--) for all regular files
- Excludes node_modules, .next, .git, and .env.local
- Places all frontend files directly at root of the zip archive
"""

import os
import sys
import zipfile
import time

def create_hostinger_zip(frontend_dir, output_zip_path):
    print(f"[*] Packaging Next.js Frontend for Hostinger Linux...")
    print(f"[*] Source: {frontend_dir}")
    print(f"[*] Output: {output_zip_path}\n")

    # Exclusions
    EXCLUDE_DIRS = {'node_modules', '.next', '.git'}
    EXCLUDE_FILES = {'.env.local', 'denish-cookies-frontend.zip'}

    # Current timestamp for zip entries
    now_time = time.localtime(time.time())[:6]

    file_count = 0
    dir_count = 0

    with zipfile.ZipFile(output_zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        # Walk through the frontend directory
        for root, dirs, files in os.walk(frontend_dir):
            # Filter directories in-place to avoid descending into excluded dirs
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            # Calculate relative path from frontend directory
            rel_root = os.path.relpath(root, frontend_dir)
            if rel_root == '.':
                rel_root = ''

            # Add directory entry with explicit 0755 POSIX permissions
            if rel_root:
                arc_dir = rel_root.replace('\\', '/') + '/'
                zinfo = zipfile.ZipInfo(arc_dir, now_time)
                zinfo.create_system = 3  # UNIX
                # S_IFDIR (0o040000) | 0o0755 (rwxr-xr-x)
                zinfo.external_attr = (0o040755 << 16) | 0x10  # 0x10 is MS-DOS directory flag
                zf.writestr(zinfo, '')
                dir_count += 1
                # print(f"  [DIR 0755] {arc_dir}")

            # Add files with explicit 0644 POSIX permissions
            for f in files:
                if f in EXCLUDE_FILES:
                    print(f"  [EXCLUDED] {f}")
                    continue

                full_path = os.path.join(root, f)
                rel_file = os.path.relpath(full_path, frontend_dir).replace('\\', '/')

                with open(full_path, 'rb') as fp:
                    content = fp.read()

                zinfo = zipfile.ZipInfo(rel_file, now_time)
                zinfo.create_system = 3  # UNIX
                # S_IFREG (0o100000) | 0o0644 (rw-r--r--)
                zinfo.external_attr = 0o100644 << 16
                zf.writestr(zinfo, content)
                file_count += 1

    zip_size_kb = os.path.getsize(output_zip_path) / 1024
    print(f"\n[+] SUCCESS: Archive created successfully!")
    print(f"    - Directories archived: {dir_count} (all with 0755 permissions)")
    print(f"    - Files archived:       {file_count} (all with 0644 permissions)")
    print(f"    - Output file size:     {zip_size_kb:.2f} KB")
    print(f"    - Destination:          {output_zip_path}\n")

if __name__ == '__main__':
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    frontend_path = os.path.join(base_dir, 'frontend')
    output_path = os.path.join(base_dir, 'denish-cookies-frontend.zip')

    if not os.path.exists(frontend_path):
        print(f"Error: {frontend_path} not found!")
        sys.exit(1)

    create_hostinger_zip(frontend_path, output_path)
