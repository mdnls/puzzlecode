import numpy as np 
import json 

letters = "abcdefghijklmnopqrstuvwxyz"

def random_edge(jitter=0.05):
	edge = np.array([[0, 0], [0.375, 0], [0.25, 0], [0.25, 0.25], [0.5, 0.25], [0.5, 0], [0.375, 0], [1, 0]])
	
	edge[2:6] = edge[2:6] + np.random.normal(size=(4, 2), scale=0.05)
	if(np.random.uniform() > 0.5):
		edge[2:6, 1] = -edge[2:6, 1]
	return [[round(e[0], 3), round(e[1], 3)] for e in edge]

edges = { k: random_edge() for k in letters}
print(json.dumps(edges))
