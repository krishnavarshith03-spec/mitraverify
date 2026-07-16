import numpy as np
from app.services.cv.mediapipe_engine import _calculate_face_embedding, _compute_cosine_similarity

class LM:
    def __init__(self, x, y, z):
        self.x = x; self.y = y; self.z = z

# Mock landmarks
lms1 = [LM(np.random.random(), np.random.random(), np.random.random()) for _ in range(478)]
lms2 = [LM(pt.x + 0.01, pt.y + 0.01, pt.z + 0.01) for pt in lms1]

emb1 = _calculate_face_embedding(None, lms1)
emb2 = _calculate_face_embedding(None, lms2)

print("Emb1 size:", len(emb1))
print("Emb2 size:", len(emb2))
sim, dist = _compute_cosine_similarity(emb1, emb2)
print("Sim:", sim, "Dist:", dist)
