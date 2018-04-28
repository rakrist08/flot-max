'use strict'

/*
 * s = source
 * t = destination
 * rGraph = matrice de la graphe
*/
function bfs(rGraph, s, t, parent) {
	var visited = [];
	var pile = [];
	var V = rGraph.length;
	// Créer le matrice de visite pour les points
	for (var i = 0; i < V; i++) {
		visited[i] = false;
	}
	// Creation de pile, empiler la source et la marquer comme visité
	pile.push(s);
	visited[s] = true;
	parent[s] = -1;

	while (pile.length != 0) {
		var u = pile.shift();
		for (var v = 0; v < V; v++) {
			if (visited[v] == false && rGraph[u][v] > 0) {
				pile.push(v);
				parent[v] = u;
				visited[v] = true;
			}
		}
	}
	//retourner true si il t est visité après avoir parcouru depuis s
	return (visited[t] == true);
}

function fordFulkerson(graph, s, t) {
  if (s < 0 || t < 0 || s > graph.length-1 || t > graph.length-1){
    throw new Error("FlotMax - Ford-Fulkerson :: source ou destination invalide");
  }
  if(graph.length === 0){
    throw new Error("FlotMax - Ford-Fulkerson :: matrice invalide");
  }
	var rGraph = [];
	for (var u = 0; u < graph.length; u++) {
		var temp = [];
    if(graph[u].length !== graph.length){
      throw new Error("FlotMax - Ford-Fulkerson :: la matrice de graphe doit être carée");
    }
		for (v = 0; v < graph.length; v++) {
			temp.push(graph[u][v]);
		}
		rGraph.push(temp);
	}
	var parent = [];
	var maxFlow = 0;
	var traitements = [];
	while (bfs(rGraph, s, t, parent)) {
		var pathFlow = Number.MAX_VALUE;
		var chemin = [];
		for (var v = t; v != s; v = parent[v]) {
			u = parent[v];
			chemin.push([u,v]);
			pathFlow = Math.min(pathFlow, rGraph[u][v]);
		}
		traitements.push({
			flot : pathFlow,
			chemin: chemin.reverse()
		});

		for (v = t; v != s; v = parent[v]) {
			u = parent[v];
			rGraph[u][v] -= pathFlow;
			rGraph[v][u] += pathFlow;
		}

		maxFlow += pathFlow;
	}
	return {
		"flotmax": maxFlow,
		"grapheresiduel": rGraph,
		"traitements": traitements
	};
}
