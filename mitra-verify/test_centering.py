import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Values from the first output!
enrolled = np.array([
    0.11919040556968177, 0.045184934751123805, 0.0897520816397279, 0.0842527373918626,
    0.037416776883634956, 0.038022964552163294, 0.1531476679895284, 0.03921846974683037,
    0.12863067240699327, 0.00981872395044741, 0.04373446101508453, 0.016731232535734646,
    0.09853668308188986, 0.09789568716256573, 0.0714683213364627, 0.07054232082139397,
    0.06413724137251307, 0.00023831563492225977, 0.058619159504858076, 0.014711035585195186,
    0.0712114748311662, 0.07134172893245935, 0.23634606786441795, 0.18521971941394125
])

# Let's say different user has slightly different values (+/- 5%)
np.random.seed(42)
different = enrolled * (1.0 + np.random.uniform(-0.05, 0.05, len(enrolled)))

print("Raw Cosine:", cosine_sim(enrolled, different))

# Centering
enrolled_c = enrolled - np.mean(enrolled)
different_c = different - np.mean(different)
print("Centered Cosine:", cosine_sim(enrolled_c, different_c))

# Standardization
enrolled_s = (enrolled - np.mean(enrolled)) / np.std(enrolled)
different_s = (different - np.mean(different)) / np.std(different)
print("Standardized Cosine:", cosine_sim(enrolled_s, different_s))

