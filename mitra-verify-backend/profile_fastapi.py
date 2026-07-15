import os
import psutil

def print_mem(tag):
    process = psutil.Process(os.getpid())
    mem = process.memory_info().rss / 1024 / 1024
    print(f"[{tag}] Memory Usage: {mem:.2f} MB")

print_mem("Start")

from app.main import app
print_mem("After FastAPI app import")

