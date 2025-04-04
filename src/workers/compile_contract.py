import sys
import runpy
import json
import glob
import os
import time  # Add this import for time measurement
from pathlib import Path

import puyapy # type: ignore

file_count = 0

# Metrics

def _last_token_base64(line: str, idx: int) -> bool:
    try:
        *_, last = line[:idx].split()
    except ValueError:
        return False
    return last in ("base64", "b64")


def _find_unquoted_string(line: str, token: str, start: int = 0, end: int = -1) -> int | None:
    """Find the first string within a line of TEAL. Only matches outside of quotes and base64 are returned.
    Returns None if not found"""

    if end < 0:
        end = len(line)
    idx = start
    in_quotes = in_base64 = False
    while idx < end:
        current_char = line[idx]
        match current_char:
            # enter base64
            case " " | "(" if not in_quotes and _last_token_base64(line, idx):
                in_base64 = True
            # exit base64
            case " " | ")" if not in_quotes and in_base64:
                in_base64 = False
            # escaped char
            case "\\" if in_quotes:
                # skip next character
                idx += 1
            # quote boundary
            case '"':
                in_quotes = not in_quotes
            # can test for match
            case _ if not in_quotes and not in_base64 and line.startswith(token, idx):
                # only match if not in quotes and string matches
                return idx
        idx += 1
    return None

def _strip_comment(line: str) -> str:
    comment_idx = _find_unquoted_string(line, "//")
    if comment_idx is None:
        return line
    return line[:comment_idx].rstrip()


def strip_comments(program: str) -> str:
    return "\n".join(_strip_comment(line) for line in program.splitlines())

def get_num_teal_ops(teal: str) -> int:
    ops = 0
    for line in strip_comments(teal).splitlines():
        line = line.strip()
        if not line or line.endswith(":") or line.startswith("#"):
            # ignore comment only lines, labels and pragmas
            pass
        else:
            ops += 1

    return ops




# Compile Contract

def find_and_read_teal_files():
    # Find the TEAL files
    approval_file = glob.glob('*.approval.teal')[0]
    clear_file = glob.glob('*.clear.teal')[0]
    
    # Read the contents
    with open(approval_file, 'r') as f:
        approval_content = f.read()
    with open(clear_file, 'r') as f:
        clear_content = f.read()
        
    return approval_content, clear_content

def cleanup_generated_files():
    # Clean up all generated files
    for f in glob.glob('*.teal') + glob.glob('*.puya.map') + glob.glob('*.arc*') + glob.glob('contract_*'):
        try:
            os.remove(f)
        except:
            pass

def cat(*filenames):
    results = []
    for filename in filenames:
        with open(filename, 'r') as file:
            results.append(f"==> {filename} <==\\n{file.read()}")
    return "\\n\\n".join(results)


def compile_contract(code: str):
    global file_count
    file_count += 1  # Increment the counter for a unique filename
    
    # Clean up any existing files first
    cleanup_generated_files()
    
    # Write the code to a file
    print(os.getcwd())
    print(os.listdir())
    filename = f'contract_{file_count}.algo.ts'
    with open(filename, 'w') as f:
        f.write(code)

    # Set up command line arguments
    sys.argv = ["puyapy", filename]
    
    # Before run_module
    start_time = time.time()
    runpy.run_module("puyapy", run_name="__main__")
    compilation_time = time.time() - start_time

    # After finding TEAL files
    approval_content, clear_content = find_and_read_teal_files()

    # Calculate approval size in KB
    approval_size_kb = len(approval_content.encode('utf-8')) / 1024
    approval_size_no_comments_kb = len(strip_comments(approval_content).encode('utf-8')) / 1024
    # Create the JSON response with metrics
    result = json.dumps({
        "approval": approval_content,
        "clear": clear_content,
        "metrics": {
            "compilation_time_seconds": round(compilation_time, 3),
            "approval_size_kb": round(approval_size_kb, 2),
            "approval_size_no_comments_kb": round(approval_size_no_comments_kb, 2),
            "num_teal_ops": get_num_teal_ops(approval_content)
        }
    })
    print(result)
    
    return result

class FuncContainer(object):
    pass

py_funcs = FuncContainer()
py_funcs.compileContract = compile_contract

py_funcs