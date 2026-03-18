#!/usr/bin/env python3
"""
Investigate KP mapping across inspection Excel files
"""

import pandas as pd
from pathlib import Path

# File paths
INSPECT_GRAY_FILE = "/Users/filberthamijoyo/Downloads/erp/InspectGray_LAPORAN IP GREIGE 26.xlsx"
BBSF_FILE = "/Users/filberthamijoyo/Downloads/erp/DATA BBSF.xlsx"
INSPECT_FINISH_FILE = "/Users/filberthamijoyo/Downloads/erp/Data INSPECT FINISH.xlsx"

def read_excel_safe(file_path, sheet_name=None, skip_rows=None):
    """Read Excel file with error handling"""
    try:
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name, engine='openpyxl', header=skip_rows)
        else:
            df = pd.read_excel(file_path, engine='openpyxl', header=skip_rows)
        return df
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

print("=" * 80)
print("1. INSPECT GRAY ANALYSIS")
print("=" * 80)

# Try different skip values to find the header
for skip in range(6):
    df_gray = read_excel_safe(INSPECT_GRAY_FILE, skip_rows=skip)
    if df_gray is not None:
        print(f"\nSkip {skip} rows:")
        print(f"Columns: {list(df_gray.columns[:15])}")
        
        # Look for KP in column names
        kp_cols = [c for c in df_gray.columns if 'KP' in str(c).upper()]
        if kp_cols:
            print(f"Found KP columns: {kp_cols}")
            kp_col = kp_cols[0]
            unique_kp = df_gray[kp_col].dropna().unique()[:20]
            print(f"\nFirst 20 unique KP values from '{kp_col}':")
            for i, kp in enumerate(unique_kp, 1):
                print(f"  {i}. '{kp}'")
            break
        # Also check first few rows for data
        if skip == 0:
            print("First few rows:")
            print(df_gray.head(3))

print("\n" + "=" * 80)
print("2. BBSF ANALYSIS")
print("=" * 80)

# Read BBSF sheets
bbsf_sheets = ['WASHING', 'SANFOR PERTAMA', 'SANFOR KEDUA']

for sheet_name in bbsf_sheets:
    print(f"\n--- Sheet: {sheet_name} ---")
    
    # Try different skip values
    for skip in range(4):
        df = read_excel_safe(BBSF_FILE, sheet_name=sheet_name, skip_rows=skip)
        if df is not None:
            # Look for KP in column names
            kp_cols = [c for c in df.columns if 'KP' in str(c).upper()]
            if kp_cols:
                print(f"Skip {skip} - Found KP columns: {kp_cols}")
                kp_col = kp_cols[0]
                unique_kp = df[kp_col].dropna().unique()[:20]
                print(f"First 20 unique KP values from '{kp_col}':")
                for i, kp in enumerate(unique_kp, 1):
                    print(f"  {i}. '{kp}'")
                
                # Count non-empty
                non_empty = df[kp_col].dropna()
                print(f"Total non-empty KP: {len(non_empty)}")
                break
            elif skip == 0:
                print(f"Skip {skip} - Columns: {list(df.columns[:10])}")

print("\n" + "=" * 80)
print("3. INSPECT FINISH ANALYSIS")
print("=" * 80)

# Try different header rows
for skip in [None, 0, 1]:
    df_finish = read_excel_safe(INSPECT_FINISH_FILE, skip_rows=skip)
    if df_finish is not None:
        print(f"\nSkip {skip}:")
        print(f"Columns: {list(df_finish.columns[:10])}")
        
        # Check if we have the columns we need
        col_names = [str(c) for c in df_finish.columns]
        if 'SN' in col_names or 'TGL' in col_names:
            print("Found header row!")
            break

# Now read with proper header
df_finish = pd.read_excel(INSPECT_FINISH_FILE, engine='openpyxl')
if df_finish is not None:
    print(f"Total rows: {len(df_finish)}")
    print(f"All columns: {list(df_finish.columns)}")
    
    # Check SN column
    sn_col = None
    for col in df_finish.columns:
        if str(col).upper() in ['SN', 'S/N']:
            sn_col = col
            break
    
    if sn_col:
        print(f"\nSN Column found: '{sn_col}'")
        unique_sn = df_finish[sn_col].dropna().unique()[:20]
        print(f"First 20 unique SN values:")
        for i, sn in enumerate(unique_sn, 1):
            print(f"  {i}. '{sn}'")
    
    # Check P column (fabric code)
    p_col = None
    for col in df_finish.columns:
        if str(col).upper() == 'P':
            p_col = col
            break
    
    if p_col:
        print(f"\nP Column found: '{p_col}'")
        unique_p = df_finish[p_col].dropna().unique()[:20]
        print(f"First 20 unique P values:")
        for i, p in enumerate(unique_p, 1):
            print(f"  {i}. '{p}'")
    
    # Check Column3 (last column)
    col3_col = None
    for col in df_finish.columns:
        if 'COLUMN' in str(col).upper() or str(col) == '61':
            col3_col = col
            break
    
    if col3_col:
        print(f"\nColumn3 found: '{col3_col}'")
        unique_col3 = df_finish[col3_col].dropna().unique()[:20]
        print(f"First 20 unique Column3 values:")
        for i, c in enumerate(unique_col3, 1):
            print(f"  {i}. '{c}'")

print("\n" + "=" * 80)
print("DONE")
print("=" * 80)
