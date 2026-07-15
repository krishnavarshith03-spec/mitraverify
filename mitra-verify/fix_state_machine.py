import re

with open('src/app/demo/enterprise/page.tsx', 'r') as f:
    content = f.read()

# 1. Update the state machine progression to ONLY run during CHALLENGES phase
old_progression = """        // State machine progression
        if (currentChallenge === 0) {"""

new_progression = """        // State machine progression
        if (phase === 'CHALLENGES') {
          console.log(`[STATE] Frame processed. Stage: ${phase}, isFaceEnrolled: ${hasFaceEnrolled}, currentChallenge: ${currentChallenge}`);
          if (currentChallenge === 0) {"""

content = content.replace(old_progression, new_progression)

# Close the if block
old_progression_close = """              setPhase('MONITORING');
              setIsMonitoring(true);
            }
          }
        }
      } else {"""

new_progression_close = """              console.log(`[STATE] State transition: CHALLENGES -> MONITORING`);
              setPhase('MONITORING');
              setIsMonitoring(true);
            }
          }
        }
        } // End if phase === CHALLENGES
      } else {"""
content = content.replace(old_progression_close, new_progression_close)

# 2. Fix the visual styling of the Enroll Button (removing old challenge conditions)
old_button = """                  <button 
                    onClick={enrollFace} 
                    disabled={enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1 || phase !== 'ENROLLMENT'}
                    style={{ 
                      flex: 1, 
                      padding: '10px 0', 
                      borderRadius: 10, 
                      background: (enrolling || confidence < 0.5 || !faceInsideGuide || challenges.length === 0 || !challengePassed.every(Boolean)) ? 'rgba(100,100,100,0.3)' : 'linear-gradient(135deg, #00ff88, #00cc66)', 
                      color: (enrolling || confidence < 0.5 || !faceInsideGuide || challenges.length === 0 || !challengePassed.every(Boolean)) ? '#94a3b8' : '#000', 
                      fontWeight: 700, 
                      fontSize: 13, 
                      border: 'none', 
                      cursor: (enrolling || confidence < 0.5 || !faceInsideGuide || challenges.length === 0 || !challengePassed.every(Boolean)) ? 'not-allowed' : 'pointer', 
                      transition: 'all 0.3s ease'
                    }}>"""

new_button = """                  <button 
                    onClick={enrollFace} 
                    disabled={enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1 || phase !== 'ENROLLMENT'}
                    style={{ 
                      flex: 1, 
                      padding: '10px 0', 
                      borderRadius: 10, 
                      background: (enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1 || phase !== 'ENROLLMENT') ? 'rgba(100,100,100,0.3)' : 'linear-gradient(135deg, #00ff88, #00cc66)', 
                      color: (enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1 || phase !== 'ENROLLMENT') ? '#94a3b8' : '#000', 
                      fontWeight: 700, 
                      fontSize: 13, 
                      border: 'none', 
                      cursor: (enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1 || phase !== 'ENROLLMENT') ? 'not-allowed' : 'pointer', 
                      transition: 'all 0.3s ease'
                    }}>"""
content = content.replace(old_button, new_button)

# 3. Add explicit logging to enrollFace
old_enroll = """  const enrollFace = async () => {
    console.log("=== ENROLL BUTTON CLICKED ===");
    
    if (enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1) {"""

new_enroll = """  const enrollFace = async () => {
    console.log(`[STATE] === ENROLL BUTTON CLICKED ===`);
    console.log(`[STATE] Current Stage: ${phase}, isFaceEnrolled: ${hasFaceEnrolled}, enrolling: ${enrolling}, sessionId: ${sessionId}, challengeIndex: ${currentChallenge}, buttonDisabled: false`);
    
    if (enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1) {"""
content = content.replace(old_enroll, new_enroll)

old_enroll_req = """    try {
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      const res = await axios.post('/identity/enroll', {"""

new_enroll_req = """    try {
      console.log(`[STATE] API request sent: POST /identity/enroll for session ${sessionId}`);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      const res = await axios.post('/identity/enroll', {"""
content = content.replace(old_enroll_req, new_enroll_req)

old_enroll_res = """      if (res.data && res.data.embedding_vector) {
        setIsStabilizing(true);"""

new_enroll_res = """      console.log(`[STATE] API response received:`, res.data);
      if (res.data && res.data.embedding_vector) {
        console.log(`[STATE] Embedding saved!`);
        setIsStabilizing(true);"""
content = content.replace(old_enroll_res, new_enroll_res)

old_enroll_success = """        setTimeout(() => { setIsStabilizing(false); setEnrollmentSuccess(false); setPhase('CHALLENGES'); }, 2000);"""
new_enroll_success = """        setTimeout(() => { setIsStabilizing(false); setEnrollmentSuccess(false); console.log(`[STATE] State transition: ENROLLMENT -> CHALLENGES`); setPhase('CHALLENGES'); }, 2000);"""
content = content.replace(old_enroll_success, new_enroll_success)

# 4. Fix BiometricScannerOverlay challengeLabel 
# (Since my previous regex missed it, I will replace the exact lines)
import re
content = re.sub(
    r"\(!hasFaceEnrolled && challengePassed\.length > 0 && challengePassed\.every\(Boolean\)\) \? 'READY TO ENROLL' :\n\s*\(!hasFaceEnrolled\) \? `ENROLLMENT CHALLENGE \$\{currentChallenge \+ 1\}/\$\{challenges\.length\}` :",
    r"phase === 'ENROLLMENT' ? 'READY TO ENROLL - CLICK BUTTON BELOW' :\n                    phase === 'CHALLENGES' ? `LIVENESS CHALLENGE ${currentChallenge + 1}/${challenges.length}` :",
    content
)

with open('src/app/demo/enterprise/page.tsx', 'w') as f:
    f.write(content)

print("State machine fixed!")
