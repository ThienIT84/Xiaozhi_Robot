import sys
import os

def extract_srmodels(bin_path, out_model_path):
    if not os.path.exists(bin_path):
        print(f"File not found: {bin_path}")
        return False
        
    with open(bin_path, 'rb') as f:
        data = f.read()
        
    total_files = int.from_bytes(data[0:4], byteorder='little')
    checksum = int.from_bytes(data[4:8], byteorder='little')
    combined_length = int.from_bytes(data[8:12], byteorder='little')
    
    print(f"Total files in assets.bin: {total_files}")
    
    mmap_table_size = total_files * 44
    mmap_table_offset = 12
    merged_data_offset = mmap_table_offset + mmap_table_size
    
    found = False
    for i in range(total_files):
        entry_offset = mmap_table_offset + i * 44
        file_name = data[entry_offset : entry_offset+32].decode('utf-8').rstrip('\0')
        file_size = int.from_bytes(data[entry_offset+32 : entry_offset+36], byteorder='little')
        offset = int.from_bytes(data[entry_offset+36 : entry_offset+40], byteorder='little')
        
        if file_name == "srmodels.bin":
            file_data_start = merged_data_offset + offset + 2 # Skip 5A 5A header
            file_data_end = file_data_start + file_size
            
            file_data = data[file_data_start : file_data_end]
            
            with open(out_model_path, 'wb') as out_f:
                out_f.write(file_data)
                
            print(f"SUCCESS: Extracted {file_name} ({file_size} bytes) to {out_model_path}")
            found = True
            break
            
    if not found:
        print("ERROR: srmodels.bin not found inside assets.bin!")
        return False
    return True

if __name__ == "__main__":
    assets_bin = r"main\assets.bin"
    out_srmodels = r"main\srmodels_custom.bin"
    extract_srmodels(assets_bin, out_srmodels)
