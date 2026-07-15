import re

with open('src/app/demo/enterprise/page.tsx', 'r') as f:
    content = f.read()

# 1. Add phase state
content = re.sub(
    r'(const \[enrolling, setEnrolling\] = useState\(false\);)',
    r"const [phase, setPhase] = useState<'IDLE' | 'ENROLLMENT' | 'CHALLENGES' | 'MONITORING'>('IDLE');\n  \g<1>",
    content
)

# 2. Update startCamera
content = re.sub(
    r'(function startCamera\(\) \{[\s\S]*?setMismatchCount\(0\);)',
    r"\g<1> setPhase('ENROLLMENT');",
    content
)

# 3. Update stopCamera
content = re.sub(
    r'(function stopCamera\(\) \{[\s\S]*?setSessionTerminated\(false\);)',
    r"\g<1> setPhase('IDLE');",
    content
)

# 4. Update activeChallengeId logic in sendFrameToBackend
content = re.sub(
    r"(const activeChallengeId = isMonitoring \? 'monitoring' : \(currentChallenge < challenges\.length \? challenges\[currentChallenge\]\.id : undefined\);)",
    r"const activeChallengeId = phase === 'MONITORING' ? 'monitoring' : (phase === 'CHALLENGES' && currentChallenge < challenges.length ? challenges[currentChallenge].id : undefined);",
    content
)

# 5. Update challenge pass logic to transition to MONITORING
old_challenge_pass = """            if (nextStep >= challenges.length) console.log("LIVENESS_COMPLETE");
          }
        }
      } else {"""
new_challenge_pass = """            if (nextStep >= challenges.length) {
              console.log("LIVENESS_COMPLETE");
              setPhase('MONITORING');
              setIsMonitoring(true);
            }
          }
        }
      } else {"""
content = content.replace(old_challenge_pass, new_challenge_pass)

# 6. Update enrollFace disabled condition and transition to CHALLENGES
old_enroll_button = """disabled={enrolling || confidence < 0.5 || !faceInsideGuide || challenges.length === 0 || !challengePassed.every(Boolean)}"""
new_enroll_button = """disabled={enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1 || phase !== 'ENROLLMENT'}"""
content = content.replace(old_enroll_button, new_enroll_button)

# Also update the actual enrollFace function check
old_enroll_check = """if (enrolling || confidence < 0.5 || !faceInsideGuide || challenges.length === 0 || !challengePassed.every(Boolean)) {"""
new_enroll_check = """if (enrolling || confidence < 0.90 || !faceInsideGuide || detectedFaces !== 1) {"""
content = content.replace(old_enroll_check, new_enroll_check)

# Update enrollFace success to transition to CHALLENGES
old_enroll_success = """        setTimeout(() => { setIsStabilizing(false); setEnrollmentSuccess(false); }, 2000);"""
new_enroll_success = """        setTimeout(() => { setIsStabilizing(false); setEnrollmentSuccess(false); setPhase('CHALLENGES'); }, 2000);"""
content = content.replace(old_enroll_success, new_enroll_success)

# 7. Update BiometricScannerOverlay challengeLabel for CHALLENGES
content = re.sub(
    r"(!hasFaceEnrolled \? `ENROLLMENT CHALLENGE \$\{currentChallenge \+ 1\}/\$\{challenges\.length\}` :[\s\S]*?similarity < 0\.75 \? 'IDENTITY MISMATCH' :[\s\S]*?`VERIFYING IDENTITY\.\.\. \$\{challengeTimer\}s`)",
    r"(phase === 'ENROLLMENT' && !hasFaceEnrolled) ? 'READY TO ENROLL - CLICK BUTTON BELOW' :\n                    (phase === 'CHALLENGES') ? `LIVENESS CHALLENGE ${currentChallenge + 1}/${challenges.length}` :\n                    (phase === 'MONITORING' && similarity < 0.75) ? 'IDENTITY MISMATCH' :\n                    (phase === 'MONITORING') ? 'CONTINUOUS MONITORING ACTIVE' : 'PROCESSING...'",
    content
)

# 8. Add 3-stage UI to the Right Sidebar and hide Challenge Progress if not in CHALLENGES phase
# We will inject the 3-stage UI right above the "Identity Score" block in the right sidebar.
old_sidebar_top = """          {/* RIGHT SIDEBAR — Security Metrics */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>"""

new_sidebar_top = """          {/* RIGHT SIDEBAR — Security Metrics */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* 3-Stage Workflow Indicator */}
            {streaming && !overallResult && (
              <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 16 }}>Enterprise Verification Stages</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: phase === 'ENROLLMENT' ? 1 : (phase === 'IDLE' ? 0.3 : 0.6) }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: phase === 'ENROLLMENT' ? '#00d4ff22' : (phase === 'CHALLENGES' || phase === 'MONITORING' ? '#00ff8822' : '#334155'), border: `1px solid ${phase === 'ENROLLMENT' ? '#00d4ff' : (phase === 'CHALLENGES' || phase === 'MONITORING' ? '#00ff88' : '#475569')}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {phase === 'CHALLENGES' || phase === 'MONITORING' ? <CheckCircle size={14} color="#00ff88" /> : <span style={{ fontSize: 10, color: phase === 'ENROLLMENT' ? '#00d4ff' : '#475569' }}>1</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: phase === 'ENROLLMENT' ? 700 : 500, color: phase === 'ENROLLMENT' ? '#00d4ff' : (phase === 'CHALLENGES' || phase === 'MONITORING' ? '#00ff88' : '#94a3b8') }}>Enrollment</div>
                  </div>
                  
                  <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.1)', marginLeft: 11, marginTop: -8, marginBottom: -8 }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: phase === 'CHALLENGES' ? 1 : 0.5 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: phase === 'CHALLENGES' ? '#00d4ff22' : (phase === 'MONITORING' ? '#00ff8822' : '#334155'), border: `1px solid ${phase === 'CHALLENGES' ? '#00d4ff' : (phase === 'MONITORING' ? '#00ff88' : '#475569')}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {phase === 'MONITORING' ? <CheckCircle size={14} color="#00ff88" /> : <span style={{ fontSize: 10, color: phase === 'CHALLENGES' ? '#00d4ff' : '#475569' }}>2</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: phase === 'CHALLENGES' ? 700 : 500, color: phase === 'CHALLENGES' ? '#00d4ff' : (phase === 'MONITORING' ? '#00ff88' : '#94a3b8') }}>Liveness Challenges</div>
                  </div>
                  
                  <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.1)', marginLeft: 11, marginTop: -8, marginBottom: -8 }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: phase === 'MONITORING' ? 1 : 0.5 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: phase === 'MONITORING' ? '#00ff8822' : '#334155', border: `1px solid ${phase === 'MONITORING' ? '#00ff88' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, color: phase === 'MONITORING' ? '#00ff88' : '#475569' }}>3</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: phase === 'MONITORING' ? 700 : 500, color: phase === 'MONITORING' ? '#00ff88' : '#94a3b8' }}>Continuous Monitoring</div>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>"""

content = content.replace(old_sidebar_top, new_sidebar_top)

# Hide Challenge Progress unless phase === 'CHALLENGES'
old_challenge_progress_start = """            {/* Challenge Progress */}
            <div className="glass" style={{ padding: 16, borderRadius: 14 }}>"""
new_challenge_progress_start = """            {/* Challenge Progress */}
            {phase === 'CHALLENGES' && (
              <div className="glass" style={{ padding: 16, borderRadius: 14 }}>"""

old_challenge_progress_end = """                  {challengeError}
                </div>
              )}
            </div>"""
new_challenge_progress_end = """                  {challengeError}
                </div>
              )}
              {/* Show instructions explicitly */}
              {challenges[currentChallenge] && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,212,255,0.1)', border: '1px solid #00d4ff', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{challenges[currentChallenge].icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff' }}>{challenges[currentChallenge].label}</div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 4 }}>{challenges[currentChallenge].instruction}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>Time remaining: {challengeTimer}s</div>
                </div>
              )}
            </div>
            )}"""
content = content.replace(old_challenge_progress_start, new_challenge_progress_start)
content = content.replace(old_challenge_progress_end, new_challenge_progress_end)

with open('src/app/demo/enterprise/page.tsx', 'w') as f:
    f.write(content)

print("Enterprise page updated successfully!")
