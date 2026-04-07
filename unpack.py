import sys
import os

def unpack_assets(bin_path, out_dir):
    if not os.path.exists(bin_path):
        print(f"File not found: {bin_path}")
        return
        
    os.makedirs(out_dir, exist_ok=True)
    
    with open(bin_path, 'rb') as f:
        data = f.read()
        
    total_files = int.from_bytes(data[0:4], byteorder='little')
    checksum = int.from_bytes(data[4:8], byteorder='little')
    combined_length = int.from_bytes(data[8:12], byteorder='little')
    
    print(f"Total files: {total_files}")
    
    mmap_table_size = total_files * 44
    mmap_table_offset = 12
    merged_data_offset = mmap_table_offset + mmap_table_size
    
    for i in range(total_files):
        entry_offset = mmap_table_offset + i * 44
        file_name = data[entry_offset : entry_offset+32].decode('utf-8').rstrip('\0')
        file_size = int.from_bytes(data[entry_offset+32 : entry_offset+36], byteorder='little')
        offset = int.from_bytes(data[entry_offset+36 : entry_offset+40], byteorder='little')
        
        file_data_start = merged_data_offset + offset + 2 # Skip 5A 5A
        file_data_end = file_data_start + file_size
        
        file_data = data[file_data_start : file_data_end]
        
        out_path = os.path.join(out_dir, file_name)
        with open(out_path, 'wb') as out_f:
            out_f.write(file_data)
            
        print(f"Extracted: {file_name} ({file_size} bytes)")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: unpack.py <assets.bin> <out_dir>")
        sys.exit(1)
    unpack_assets(sys.argv[1], sys.argv[2])
