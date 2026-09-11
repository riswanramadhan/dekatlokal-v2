"""Independent stdlib-only research oracle. Read canonical JSON from stdin.
Usage: python scripts/decision-oracle.py < canonical-input.json
Never invoked by production requests. No simulated observations are stored in DB.
"""
import json
import math
import sys

EPS = 1e-12
D = ['C' + str(i) for i in range(1, 9)]
M = ['A' + str(i) for i in range(1, 8)]

def geo(values):
    return math.prod(values) ** (1 / len(values))

def fuzzy(x):
    if x == 1:
        return [1., 1., 1.]
    for k in range(2, 10):
        t = [max(1, k-1), k, min(9, k+1)]
        if x == k:
            return t
        if x == 1/k:
            return [1/t[2], 1/t[1], 1/t[0]]
    raise ValueError('Invalid scale')

def run(inp):
    assert inp['dimensionCodes'] == D and inp['moduleCodes'] == M
    assert len(inp['experts']) == 3
    matrices = []
    for expert in inp['experts']:
        a = [[1. for _ in D] for _ in D]
        for p in expert['pairs']:
            i, j = D.index(p['left']), D.index(p['right'])
            x = p['intensity'] if p['preferred'] != p['right'] else 1/p['intensity']
            a[i][j], a[j][i] = x, 1/x
        matrices.append(a)
    ft = [[[fuzzy(x) for x in row] for row in a] for a in matrices]
    group = [[[geo([ft[e][i][j][k] for e in range(3)]) for k in range(3)] for j in range(8)] for i in range(8)]
    gm = [[geo([group[i][j][k] for j in range(8)]) for k in range(3)] for i in range(8)]
    totals = [sum(row[k] for row in gm) for k in range(3)]
    fw = [[row[0]/totals[2], row[1]/totals[1], row[2]/totals[0]] for row in gm]
    centroids = [sum(row)/3 for row in fw]
    w = [x/sum(centroids) for x in centroids]
    R = [[sum(e['relevance'][m][d] for e in inp['experts'])/3 for d in D] for m in M]
    answers = inp['answers']
    assert len(answers) == 32 and all(type(v) is int and 0 <= v <= 4 for v in answers.values())
    S = [sum(answers['Q' + str(4*j+k+1).zfill(2)] for k in range(4))/16*100 for j in range(8)]
    g = [1-x/100 for x in S]
    H = sum(w[j]*g[j] for j in range(8))
    result = dict(w=w, R=R, S=S, g=g, H=H, q=[0.]*8, N=[], V=[], idealPlus=[], idealMinus=[], Dplus=[], Dminus=[], C=[], rank=[], topSet=[])
    if H <= EPS:
        return dict(result, status='NO_IDENTIFIED_GAP')
    q = [w[j]*g[j]/H for j in range(8)]
    result['q'] = q
    den = [math.sqrt(sum(row[j]**2 for row in R)) for j in range(8)]
    if any(den[j] == 0 and g[j] > EPS for j in range(8)):
        return dict(result, status='UNCOVERED_DIMENSION')
    N = [[row[j]/den[j] if den[j] else 0. for j in range(8)] for row in R]
    V = [[row[j]*q[j] for j in range(8)] for row in N]
    high = [max(row[j] for row in V) for j in range(8)]
    low = [min(row[j] for row in V) for j in range(8)]
    dp = [math.sqrt(sum((row[j]-high[j])**2 for j in range(8))) for row in V]
    dm = [math.sqrt(sum((row[j]-low[j])**2 for j in range(8))) for row in V]
    result.update(N=N, V=V, idealPlus=high, idealMinus=low, Dplus=dp, Dminus=dm)
    if all(dp[i]+dm[i] <= EPS for i in range(7)):
        return dict(result, status='ALTERNATIVES_NOT_DISTINGUISHABLE')
    C = [dm[i]/(dp[i]+dm[i]) for i in range(7)]
    ranks = [1+sum(v > x+EPS for v in C) for x in C]
    return dict(result, C=C, rank=ranks, topSet=[M[i] for i in range(7) if ranks[i] == 1], status='RANKED')

if __name__ == '__main__':
    print(json.dumps(run(json.load(sys.stdin)), allow_nan=False))
