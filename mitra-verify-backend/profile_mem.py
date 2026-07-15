import os
import psutil

def print_mem(tag):
    process = psutil.Process(os.getpid())
    mem = process.memory_info().rss / 1024 / 1024
    print(f"[{tag}] Memory Usage: {mem:.2f} MB")

print_mem("Start")

import insightface
print_mem("After insightface import")

app = insightface.app.FaceAnalysis(name='buffalo_sc', allowed_modules=['detection', 'recognition'], providers=['CPUExecutionProvider'])
print_mem("After FaceAnalysis init")

app.prepare(ctx_id=0, det_size=(640,640))
print_mem("After app.prepare")

import numpy as np
dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
app.get(dummy_img)
print_mem("After first inference")

