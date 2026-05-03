import os
import json
import traceback

def parse_file(filepath, location_name):
    items = []
    if not os.path.exists(filepath): return items
    with open(filepath, 'r', encoding='latin1') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if i == 0 and 'Código' in line:
            continue
        parts = line.strip('\n').split('\t')
        if not parts or not parts[0].strip():
            continue
            
        codigo = parts[0].strip()
        gtin = parts[1].strip() if len(parts) > 1 else ""
        nome = parts[2].strip() if len(parts) > 2 else ""
        
        quantidade_str = ""
        # The quantity is always the last element if it exists
        if len(parts) > 0:
            quantidade_str = parts[-1].strip()
            
        quantidade_str = quantidade_str.replace('.', '').replace(',', '.')
        try:
            quantidade = int(float(quantidade_str))
        except ValueError:
            quantidade = 0
            
        items.append({
            "id": codigo,
            "name": nome or f"Produto {codigo}",
            "quantity": quantidade,
            "open": 0,
            "administrative": 0,
            "available": quantidade,
            "location": location_name
        })
    return items

try:
    sp_items = parse_file(r"c:\Uzenails\box-check-joy - Copia\.estoque\SP", "SP")
    pa_items = parse_file(r"c:\Uzenails\box-check-joy - Copia\.estoque\PA", "PA")
    all_items = sp_items + pa_items

    out_path = r"c:\Uzenails\box-check-joy - Copia\src\lib\estoqueData.ts"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("export const estoqueData = ")
        f.write(json.dumps(all_items, indent=2, ensure_ascii=False))
        f.write(";\n")
    print(f"Successfully wrote {len(all_items)} items to {out_path}")
except Exception as e:
    traceback.print_exc()
