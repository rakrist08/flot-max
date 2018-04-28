var app = angular.module("flot-max",[]);

var coordonneesSouris = {
    x:0, y: 0
};
app
    .service("grapheProvider", function(){
        this.traitements = [];

        this.getGraphe = function(){
		/* 
		 * donnees est une variable partagé entre d3 et AngularJs ou bien app.js et graphe.js
		 *
		*/
            return donnees;
        };

        this.update = function(){
        	//g = variable de sauvegarde de grapheprovider
            var g = this;
            //Reconstruction de données
            var arcs = [];
            for(var i=0; i<donnees.links.length; i++){
            	var link = donnees.links[i];
                var src = donnees.nodes.filter(function(node){
                    return link.source === node.nom;
                })[0], dest = donnees.nodes.filter(function(node){
                    return link.target === node.nom;
                })[0];
                arcs.push({
                    source: src,
                    target: dest,
                    flot: link.flot,
                    capacite: link.capacite
                });
            }
            force
                .nodes(donnees.nodes)
                .links(arcs);
            var lineFunction = d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .interpolate("line");

            var link = graphe.select(".groupe-path").selectAll(".link")
                .data(force.links())
                /// Mise à jour des liens
                .attr("stroke", function (d){
                    return (d.flot == d.capacite) ? "red" : "white";
                });
            ///Création de nouveaux liens
            link.enter().append("path")
                .attr("id", function(d,i){
                    return "path"+i;
                })
                .attr("class", "link")
                .attr("stroke", function (d){
                    return (d.flot == d.capacite) ? "red" : "white";
                })
                .attr("marker-end", "url(#fleche)");
            //Suppression des liens inutiles
            link.exit().remove();
            var capacite = graphe.select(".groupe-capacite").selectAll(".capacite")
                .data(force.links())
                .attr("stroke", function (d){
                    return (d.flot == d.capacite) ? "red" : "white";
                })
                .attr("fill", function (d){
                    return (d.flot == d.capacite) ? "red" : "white";
                });

            capacite.select("textPath").text(function(d) { return d.flot + ' / ' +d.capacite });

            capacite.enter().append("text")
                .attr("class","capacite")
                .attr("stroke", function (d){
                    return (d.flot == d.capacite) ? "red" : "white";
                })
                .attr("fill", function (d){
                    return (d.flot == d.capacite) ? "red" : "white";
                })
                .attr("dy", -10)
                .attr("text-anchor", "middle")
                .append("textPath")
                    .attr("startOffset", "40%")
                    .attr("xlink:href",function(d,i) { return "#path" + i; })
                    .text(function(d) { return d.flot + ' / ' +d.capacite })
                    .on("click", function(d,i){
                        var capacite =  prompt("Capacité de transport : ", d.capacite);
                        capacite = (!capacite) ? d.capacite : (capacite == "" ? 0 : parseInt(capacite));
                        donnees.links[i].capacite = capacite;
                        g.update(); 
                    });
            capacite.exit().remove();

            //////////////////////////////////////////////////////////////////
            var pt = graphe.select(".groupe-point").selectAll(".point")
                .data(donnees.nodes);
                pt.select("text")
                .text(function(d){
                    return d.nom;
                });
            pt.enter()
            	.append("g")
            	.attr("class", "point")
            	.on("contextmenu", function (d,i) {
					var x = d3.event.pageX;
					var y = d3.event.pageY;

					indNodeConcerné = i;
					pointmenucontextuel
						.style("left", x+"px")
						.style("top", y+"px")
						.style("display", "block");
				});

            var cercle = pt.append("circle")
                .attr("r", 20)
                .attr("stroke" , "white")
                .attr("fill", "dodgerblue");

            var texte = pt.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", 8)
                .attr("stroke", "white")
                .attr("fill", "white")
                .text(function(d){
                    return d.nom;
                });

            pt.call(force.drag());

            pt.exit().remove();

            force.start();
            force.on("tick", function() {
                link.attr("d", function(d){
                    return lineFunction([
                        { x: d.source.x, y : d.source.y },
                        { x: d.target.x, y : d.target.y }
                    ]);
                });
                pt.attr("transform", function(d){
                    return "translate("+d.x + ", "+d.y+")";
                });
            });

        };

        this.createPoint = function(point){
            donnees.nodes.push(point);
            this.update();
            return donnees;
        };

        this.convertirEnMatrice = function(){
            var matrice = [];
            //Création matrice carée
            for(var i=0; i<force.nodes().length; i++){
                var colzero = [];
            	for(var j=0; j<force.nodes().length; j++){
                    colzero.push(0);
                }
                matrice.push(colzero);
            }
            //Remplissage des liens entre les noeuds dans le matrice
            for(var ind = 0, links = force.links(); ind < links.length; ind++){
               var lien = links[ind];
               var i = parseInt(lien.source.index),
                   j = parseInt(lien.target.index);

                matrice[i][j] = lien.capacite;
            }

            return matrice;
        };
        this.calculerFlotMax = function(source, target){
            var matrice = this.convertirEnMatrice();
            var res = fordFulkerson(matrice, source, target); //definit dans scripts/flomax.js
            for(var ind = 0, links = force.links(); ind < links.length; ind++){
            	var lien = links[ind];
                var i = parseInt(lien.source.index),
                    j = parseInt(lien.target.index);
                var flot = eval(lien.capacite - res.grapheresiduel[i][j]);
                donnees.links[ind].flot = flot;
            }
            this.traitements = res.traitements;
            return res.flotmax;
        };
        this.getAllTraitements = function(){
            return this.traitements;
        };
        this.getIndNodeConcerne = function(){
            return indNodeConcerné;
        };
        this.getNodeConcerne = function(){
            return donnees.nodes[indNodeConcerné];
        };
        this.supprimerNodeConcerne = function (indice) {
            var pointSupprimé = donnees.nodes[indice];
            var liensVaovao = donnees.links.filter(function(link){
                return !(link.source === pointSupprimé.nom || link.target === pointSupprimé.nom);
            });
            donnees.links = liensVaovao;
            donnees.nodes.splice(indice,1);
        };
        this.creerLien = function (lien){
            donnees.links.push(lien);
        }
    })
    .service("sourisProvider", function(){
        this.getCoordonnees = function(){
            return coordonneesSouris;
        }
    });
app.controller("pointsAdd", function($scope, grapheProvider, sourisProvider){
    $scope.donneesGraphe = grapheProvider.getGraphe();
    $scope.source = null;
    $scope.target = null;
    $scope.pointLienApartir = null;
    $scope.pointLienVers = null;
    $scope.lien = {
        source : null,
        target : null,
        flot : 0,
        capacite : 0
    };
    $scope.point = {
        nom: null,
        fixed: true,
        x: 0,
        y: 0
    };

    $scope.traitements = [];

    grapheProvider.update();

    grapheProvider.convertirEnMatrice();

    $scope.showModalCreationPoint = function(){
        var coord = sourisProvider.getCoordonnees();
        $scope.point.x = coord.x;
        $scope.point.y = coord.y;

        jQuery("#modalcreationpoint").modal("show");
        setTimeout(function(){
            jQuery("input[type=text]",jQuery("#modalcreationpoint")).focus();
        },1000);
        jQuery(".graphemenucontextuel").css("display","none");
    };
    $scope.creerPoint = function(point){
        $scope.points = grapheProvider.createPoint(point);
        $scope.donneesGraphe = grapheProvider.getGraphe();
        $scope.point = {
            nom: null,
            fixed: true,
            x: 0,
            y: 0
        };


        jQuery("#modalcreationpoint").modal("hide");
        grapheProvider.convertirEnMatrice();
    };
    $scope.supprPoint = function(){
        grapheProvider.supprimerNodeConcerne(grapheProvider.getIndNodeConcerne());
        grapheProvider.update();
        pointmenucontextuel.style("display","none");
    };

    $scope.afficherCalculFlotMax = function(){
        jQuery("#modalCalculFlotMax").modal("show");
        jQuery(".graphemenucontextuel").css("display","none");
        $scope.donneesGraphe = grapheProvider.getGraphe();
    };

    $scope.calculerFlotMax = function(){
        $scope.flotMax = grapheProvider.calculerFlotMax($scope.source.index,$scope.target.index);
        grapheProvider.update();
        jQuery(".graphemenucontextuel").css("display","none");
        $scope.traitements = grapheProvider.getAllTraitements();
    };

    $scope.lienApartir = function () {
        $scope.pointLienApartir = grapheProvider.getNodeConcerne();
        pointmenucontextuel.style("display","none");
    };
    $scope.lienVers = function () {
        $scope.pointLienVers = grapheProvider.getNodeConcerne();
        $scope.lien.source = $scope.pointLienApartir.nom;
        $scope.lien.target = $scope.pointLienVers.nom;
        pointmenucontextuel.style("display","none");
        jQuery("#modalLien").modal("show");
    };
    $scope.creerLien = function(lien){
        grapheProvider.creerLien(lien);
        grapheProvider.update();

        $scope.lien = {
            source : null,
            target : null,
            flot : 0,
            capacite : 0
        };
        jQuery("#modalLien").modal("hide");

    };
});
