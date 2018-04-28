
var donnees = {
	"nodes": [
	  { nom: 'A', fixed: true, x: 200, y:100},
	  { nom: 'B', fixed: true, x: 500, y:100},
	  { nom: 'C', fixed: true, x: 200, y:300},
	  { nom: 'D', fixed: true, x: 500, y:300},
	  { nom: 'S', fixed: true, x: 100, y:200},
	  { nom: 'T', fixed: true, x: 600, y:200}
	],
	"links" :  [
		{ "source" : 'S' , "target" : 'C', "flot": 0 ,"capacite" : 10},
		{ "source" : 'S' , "target" : 'A', "flot": 0 ,"capacite" : 8 },
		{ "source" : 'A' , "target" : 'B', "flot": 0 ,"capacite" : 4 },
		{ "source" : 'A' , "target" : 'D', "flot": 0 ,"capacite" : 8 },
		{ "source" : 'A' , "target" : 'C', "flot": 0 ,"capacite" : 2 },
		{ "source" : 'C' , "target" : 'D', "flot": 0 ,"capacite" : 9 },
		{ "source" : 'B' , "target" : 'T', "flot": 0 ,"capacite" : 10 },
		{ "source" : 'D' , "target" : 'B', "flot": 0 ,"capacite" : 6 },
		{ "source" : 'D' , "target" : 'T', "flot": 0 ,"capacite" : 10 }
	]
};

var indNodeConcerné = null;

var pointmenucontextuel = d3.select(".pointmenucontextuel");
var graphemenucontextuel = d3.select(".graphemenucontextuel");
pointmenucontextuel.style("display","none");
graphemenucontextuel.style("display","none");


var graphe = d3.select("#graphe")
			.append("svg")	// graphe = svg
			.on("click", function(d,i){
				pointmenucontextuel
					.style("display", "none");
				graphemenucontextuel
					.style("display", "none");
				d3.event.preventDefault();
			})
			.on("contextmenu", function(d,i){
				var x = d3.event.pageX;
				var y = d3.event.pageY;
				var elementPointe=d3.event.target.nodeName;
				if(elementPointe == "svg"){
					graphemenucontextuel
						.style("left", x+"px")
						.style("top", y+"px")
						.style("display", "block");
				}
				coordonneesSouris.x = x;
				coordonneesSouris.y = y;
				d3.event.preventDefault();
			});
        graphe.append("g")
            .attr("class","groupe-path");

        graphe.append("g")
            .attr("class","groupe-capacite");

        graphe.append("g")
            .attr("class","groupe-point");

graphe.attr("width" , "100%")
		  .attr("height", "400px");

var defs = graphe.append("defs")
	.append("marker")
		.attr("id", "fleche")
		.attr({
			"viewBox":"0 -5 10 10",
			"refX":30,
			"refY":0,
			"markerWidth":15,
			"markerHeight":10,
			"orient":"auto"
		})
		.append("path")
			.attr("d", "M0,-5L10,0L0,5")
			.attr("fill", "white")
			.attr("class","arrowHead");


var force = d3.layout.force()
    .size([750, 400]);
