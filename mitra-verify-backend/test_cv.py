import cv2
import mediapipe as mp
import numpy as np
import traceback

print("OpenCV version:", cv2.__version__)
print("MediaPipe version:", getattr(mp, '__version__', 'unknown'))

try:
    img = cv2.imread('lena.jpg')
    if img is None:
        print("Failed to load lena.jpg")
    else:
        print(f"Image loaded. Width: {img.shape[1]}, Height: {img.shape[0]}, Channels: {img.shape[2]}, dtype: {img.dtype}")
        
        mp_face_mesh = mp.solutions.face_mesh
        with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5) as face_mesh:
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb)
            if results.multi_face_landmarks:  # type: ignore
                print(f"Number of faces: {len(results.multi_face_landmarks)}")  # type: ignore
                print(f"Number of landmarks: {len(results.multi_face_landmarks[0].landmark)}")  # type: ignore
            else:
                print("No faces detected in lena.jpg.")
except Exception as e:
    print(f"Error during CV test: {e}")
    traceback.print_exc()
