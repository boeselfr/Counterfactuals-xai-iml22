import './raphael'
import './lib/jquery/jquery.min'
import './lib/qtip/jquery.qtip-1.0.0-rc3.min'

function VerticalConnection(v1,v2,type){
	this.v1 = v1;
	this.v2 = v2;
	this.type = type;

	this.position = function(x,y1,y2){
		this.x1 = x;
		this.x2 = x;
		this.y1 = y1;
		this.y2 = y2;
	}

	this.yMin = function(){
		return Math.min(this.y1,this.y2);
	}

	this.yMax = function(){
		return Math.max(this.y1,this.y2);
	}

}

function HorizontalConnection(v1,v2,type){
	this.v1 = v1;
	this.v2 = v2;
	this.type = type;

	this.position = function(x1,x2,y){
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y;
		this.y2 = y;
	}

	this.xMin = function(){
		return Math.min(this.x1,this.x2);
	}

	this.xMax = function(){
		return Math.max(this.x1,this.x2);
	}

}

function Connection(v1,v2,type){

	this.v1 = v1;
	this.v2 = v2;
	this.type = type;

	this.links = [];

	this.addLink = function(link){
		this.links.push(link);
	}

}

function Graph(){

	this.vertices = [];
	this.vertexMap = [];

	this.getVertex = function(index){
		return this.vertexMap[index];
	}

	this.removeVertex = function(index){
		var v = this.vertexMap[index];
		for( var i=0; i<v.successors.length; i++ ){
			this.vertexMap[v.successors[i]].removePredecessor(index);
		}
		for( var i=0; i<v.predecessors.length; i++ ){
			this.vertexMap[v.predecessors[i]].removeSuccessor(index);
		}
		for( var i=0; i<this.vertices.length; i++ ){
			if( this.vertices[i] == v ){
				this.vertices.splice(i,1);
				break;
			}
		}
		delete this.vertexMap[index];
	}

	this.addVertex = function(v){
		this.vertices.push(v);
		this.vertexMap[v.index] = v;
	}

	this.mergeVertices = function(v1,v2,adjacent){
		if( adjacent ){
			if( v1.successors.length == 1 && v1.successors[0] == v2.index && v2.predecessors.length == 1 || v2.successors.length == 1 && v2.successors[0] == v1.index && v1.predecessors.length == 1 ){
				adjacent = true;
			}
			else {
				adjacent = false;
			}
		}
		var v = new Vertex(this,SentenceAlignerProperties.getVertexIndex(),v1.token);
		this.addVertex(v);
		v.count = v1.count + v2.count;
		for( var i=0; i<v1.sources.length; i++ ){
			v.sources.push(v1.sources[i]);
		}
		for( var i=0; i<v2.sources.length; i++ ){
			v.sources.push(v2.sources[i]);
		}
		for( var i=0; i<v1.predecessors.length; i++ ){
			var id = v1.predecessors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addPredecessor(id);
			this.vertexMap[id].addSuccessor(v.index);
		}
		for( var i=0; i<v2.successors.length; i++ ){
			var id = v2.successors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addSuccessor(id);
			this.vertexMap[id].addPredecessor(v.index);
		}
		for( var i=0; i<v1.successors.length; i++ ){
			var id = v1.successors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addSuccessor(id);
			this.vertexMap[id].addPredecessor(v.index);
		}
		for( var i=0; i<v2.predecessors.length; i++ ){
			var id = v2.predecessors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addPredecessor(id);
			this.vertexMap[id].addSuccessor(v.index);
		}
		this.removeVertex(v1.index);
		this.removeVertex(v2.index);
		if( adjacent ){
			v.removeSuccessor(v.index);
			v.removePredecessor(v.index);
		}
		return v;
	}

	this.clone = function(){
		var cg = new Graph();
		for( var i=0; i<this.vertices.length; i++ ){
			cg.addVertex(new Vertex(cg,this.vertices[i].index,this.vertices[i].token));
		}
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			var vc = cg.vertices[i];
			vc.count = v.count;
			for( var j=0; j<v.sources.length; j++ ){
				vc.sources.push(v.sources[j]);
			}
			for( var j=0; j<v.successors.length; j++ ){
				vc.addSuccessor(v.successors[j]);
				cg.vertexMap[v.successors[j]].addPredecessor(vc.index);
			}
			for( var j=0; j<v.predecessors.length; j++ ){
				vc.addPredecessor(v.predecessors[j]);
				cg.vertexMap[v.predecessors[j]].addSuccessor(vc.index);
			}
		}
		return cg;
	}

	this.isAcyclicFromVertex = function(v1,v2){
		var v = new Vertex(this,SentenceAlignerProperties.getVertexIndex(),v1.token);
		this.addVertex(v);
		v.count = v1.count + v2.count;
		for( var i=0; i<v1.sources.length; i++ ){
			v.sources.push(v1.sources[i]);
		}
		for( var i=0; i<v2.sources.length; i++ ){
			v.sources.push(v2.sources[i]);
		}
		for( var i=0; i<v1.predecessors.length; i++ ){
			var id = v1.predecessors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addPredecessor(id);
			this.vertexMap[id].addSuccessor(v.index);
		}
		for( var i=0; i<v2.successors.length; i++ ){
			var id = v2.successors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addSuccessor(id);
			this.vertexMap[id].addPredecessor(v.index);
		}
		for( var i=0; i<v1.successors.length; i++ ){
			var id = v1.successors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addSuccessor(id);
			this.vertexMap[id].addPredecessor(v.index);
		}
		for( var i=0; i<v2.predecessors.length; i++ ){
			var id = v2.predecessors[i];
			if( id == v1.index || id == v2.index ){
				id = v.index;
			}
			v.addPredecessor(id);
			this.vertexMap[id].addSuccessor(v.index);
		}
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].visited = 0;
			this.vertices[i].limit = this.vertices[i].predecessors.length;
			for( var j=0; j<this.vertices[i].predecessors.length; j++ ){
				if( this.vertices[i].predecessors[j] == v1.index ){
					this.vertices[i].limit--;
				}
				if( this.vertices[i].predecessors[j] == v2.index ){
					this.vertices[i].limit--;
				}
			}
		}
		v.visited = v.limit;
		var edges = [];
		for( var i=0; i<v.successors.length; i++ ){
			if( v.successors[i] != v1.index && v.successors[i] != v2.index ){
				edges.push({
					head: v,
					tail: this.getVertex(v.successors[i])
				});
			}
		}
		while( edges.length > 0 ){
			var new_edges = [];
			for( var i=0; i<edges.length; i++ ){
				var e = edges[i];
				e.tail.visited++;
				if( e.tail.visited > e.tail.limit ){
					this.removeVertex(v.index);
					return false;
				}
				for( var j=0; j<e.tail.successors.length; j++ ){
					if( v.successors[i] != v1.index && v.successors[i] != v2.index && e.tail.visited == 1 ){
						new_edges.push({
							head: e.tail,
							tail: this.getVertex(e.tail.successors[j])
						});
					}
				}
			}
			edges = new_edges;
		}
		this.removeVertex(v1.index);
		this.removeVertex(v2.index);
		return v;
	}

	this.isAcyclic = function(){
		do {
			var n = this.vertices.length;
			for( var i=0; i<this.vertices.length; i++ ){
				var vi = this.vertices[i];
				var suc = vi.successors, pred = vi.predecessors;
				if( suc.length == 0 ){
					for( var j=0; j<pred.length; j++ ){
						this.vertexMap[pred[j]].removeSuccessor(vi.index);
					}
					vi.predecessors = [];
				}
			}
			for( var i=this.vertices.length; i>0; i-- ){
				var vi = this.vertices[i-1];
				if( vi.successors.length == 0 && vi.predecessors.length == 0 ){
					this.removeVertex(vi.index);
				}
			}
		}
		while( n > this.vertices.length );
		if( this.vertices.length > 0 ){
			return false;
		}
		return true;
	}

}

function Vertex(graph,index,token) {
	this.graph = graph;
	this.token = token;
	this.successors = [];
	this.predecessors = [];
	this.count = 1;
	this.traced = false;
	this.linked = true;
	this.sources = [];
	this.index = index;
	this.verticalConnections = [];
	this.removeSuccessor = function(suc){
		for( var i=0; i<this.successors.length; i++ ){
			if( this.successors[i] == suc ){
				this.successors.splice(i,1);
				return;
			}
		}
	}
	this.removePredecessor = function(pred){
		for( var i=0; i<this.predecessors.length; i++ ){
			if( this.predecessors[i] == pred ){
				this.predecessors.splice(i,1);
				return;
			}
		}
	}
	this.addSuccessor = function(suc){
		var found = false;
		for( var i=0; i<this.successors.length; i++ ){
			if( suc == this.successors[i] ){
				found = true;
				break;
			}
		}
		if( !found ){
			this.successors.push(suc);
		}
	}
	this.addPredecessor = function(pred){
		var found = false;
		for( var i=0; i<this.predecessors.length; i++ ){
			if( pred == this.predecessors[i] ){
				found = true;
				break;
			}
		}
		if( !found ){
			this.predecessors.push(pred);
		}
	}
	this.increase = function(pos){
		this.count++;
	}
	this.merge = function(vertex){
		this.sources = this.sources.concat(vertex.sources);
		for( var i=0; i<vertex.successors.length; i++ ){
			this.addSuccessor(vertex.successors[i]);
			this.graph.vertexMap[vertex.successors[i]].addPredecessor(this.index);
			this.graph.vertexMap[vertex.successors[i]].removePredecessor(vertex.index);
		}
		for( var i=0; i<vertex.predecessors.length; i++ ){
			this.addPredecessor(vertex.predecessors[i]);
			this.graph.vertexMap[vertex.predecessors[i]].addSuccessor(this.index);
			this.graph.vertexMap[vertex.predecessors[i]].removeSuccessor(vertex.index);
		}
		this.count += vertex.count;
	}
}

function Edge(head,tail) {
	this.head = head;
	this.tail = tail;
}

var SentenceAlignerProperties = new function(){

	this.colors = [ "red", "blue", "green", "rgb(230,230,0)", "orange", "brown", "purple" ];
	this.sources = [ "0", "1", "2", "3", "4", "5", "6" ];

	var vid = 0;
	this.getVertexIndex = function(){
		return ++vid;
	}

	var hsv2rgb = function(h,s,v) {
		var var_r, var_g, var_b;
		var RGB = new Array();
		if(s==0){
		  RGB['red']=RGB['green']=RGB['blue']=Math.round(v*255);
		}else{
		  // h must be < 1
		  var var_h = h * 6;
		  if (var_h==6) var_h = 0;
		  //Or ... var_i = floor( var_h )
		  var var_i = Math.floor( var_h );
		  var var_1 = v*(1-s);
		  var var_2 = v*(1-s*(var_h-var_i));
		  var var_3 = v*(1-s*(1-(var_h-var_i)));
		  if(var_i==0){
			var_r = v;
			var_g = var_3;
			var_b = var_1;
		  }else if(var_i==1){
			var_r = var_2;
			var_g = v;
			var_b = var_1;
		  }else if(var_i==2){
			var_r = var_1;
			var_g = v;
			var_b = var_3
		  }else if(var_i==3){
			var_r = var_1;
			var_g = var_2;
			var_b = v;
		  }else if (var_i==4){
			var_r = var_3;
			var_g = var_1;
			var_b = v;
		  }else{
			var_r = v;
			var_g = var_1;
			var_b = var_2
		  }
		  //rgb results = 0 Ã· 255
		  RGB['red']=Math.round(var_r * 255);
		  RGB['green']=Math.round(var_g * 255);
		  RGB['blue']=Math.round(var_b * 255);
		  }
		return "rgb("+Math.round(var_r*255)+","+Math.round(var_g*255)+","+Math.round(var_b*255)+")";
	};

	this.getColor = function(id){
		if( id == -1 ){
			return '#3E576F';
		}
		if( this.colors.length-1 < id ){
			this.colors.push(hsv2rgb(((Math.random()*360)+1)/360,1,(25 + (Math.random()*50)+1)/100));
		}
		return this.colors[id];
	}

}

function SentenceAligner(){

	var globalAdjacent = false;

	var threshold = 0.1;
	var edgeGap = 5;
	var curveRadius = 10;

	this.graph = new Graph();

	this.startVertex = new Vertex(this.graph,SentenceAlignerProperties.getVertexIndex(),'');
	this.endVertex = new Vertex(this.graph,SentenceAlignerProperties.getVertexIndex(),'');
	this.graph.addVertex(this.startVertex);
	this.graph.addVertex(this.endVertex);

	this.startVertex.id = 'first';
	this.endVertex.id = 'last';
	this.vertices = [];
	this.sentencePaths = [];
	this.connections = [];

	this.generalConnections = [];
	this.sentenceConnections = [];

	this.alignSentences = function(sentences,sourceIds){
		this.sourceIds = sourceIds;
		var sal = this;
		var words = [];
		var wordVertices = [];
		var tokenized = [];
		var lastVertex = undefined;
		var wordlist = [];
		for( var i=0; i<sentences.length; i++ ){
			var sword = [];
			lastVertex = undefined;
			var sentence = this.clean(sentences[i]);
			//console.info(sentence);
			var tokens = sentence.split(" ");
			var t = [];
			for( var j=0; j<tokens.length; j++ ){
				var word = {
					id: i+"-"+j,
					word: tokens[j],
					sid: i,
					wid: j,
					gid: words.length
				};
				words.push(word);
				sword.push(word);
				t.push(word);

					var v = new Vertex(this.graph,SentenceAlignerProperties.getVertexIndex(),tokens[j]);
					v.sources.push({
						sourceId: i,
						token: tokens[j]
					});
					this.graph.addVertex(v);
					if( typeof lastVertex != 'undefined' ){
						lastVertex.addSuccessor(v.index);
						v.addPredecessor(lastVertex.index);
					}
					lastVertex = v;
					wordVertices[word.id] = v;

			}
			wordlist.push(sword);
			tokenized.push(t);
		}
		var sortBySize = function(s1,s2){
			if( s1.length > s2.length ){
				return -1;
			}
			return 1;
		}
		var pairs = [];
		var wordMatches = [];
		var nodes = [];
		var assignments = [];
		for( var i=0; i<words.length; i++ ){
			wordMatches.push([]);
			nodes.push(false);
			assignments.push(false);
		}
		for( var i=0; i<tokenized.length-1; i++ ){
			for( var j=i+1; j<tokenized.length; j++ ){
				this.matches = [];
				this.pairAlignment(tokenized[i],tokenized[j],[]);
				if( this.matches.length == 0 ){
					continue;
				}
				this.matches.sort(sortBySize);
				var ms = "";
				for( var k=0; k<this.matches[0].length; k++ ){
					pairs.push({
						pair: this.matches[0][k]
					});
					var w1 = this.matches[0][k].w1;
					var w2 = this.matches[0][k].w2;
					wordMatches[w1.gid].push(w2);
					wordMatches[w2.gid].push(w1);
				}
			}
		}
		for( var i=0; i<pairs.length; i++ ){
			var w1 = pairs[i].pair.w1;
			var w2 = pairs[i].pair.w2;
			pairs[i].value = 2;
			for( var j=0; j<wordMatches[w1.gid].length; j++ ){
				if( wordMatches[w1.gid][j] == w2 ){
					continue;
				}
				for( var k=0; k<wordMatches[w2.gid].length; k++ ){
					if( wordMatches[w2.gid][k] == w1 ){
						continue;
					}
					if( wordMatches[w1.gid][j] == wordMatches[w2.gid][k] ){
						pairs[i].value++;
					}
				}
			}
		}
		var sortBySize2 = function(p1,p2){
			if( p1.value > p2.value ){
				return -1;
			}
			return 1;
		}
		pairs.sort(sortBySize2);
		var checkMerge = function(w1,w2){
			var v1 = sal.graph.getVertex(wordVertices[w1.id].index), v2 = sal.graph.getVertex(wordVertices[w2.id].index);
			if( v1 == v2 ){
				return;
			}
			var v = sal.graph.isAcyclicFromVertex(v1,v2);
			if( v ){
				for( var i=0; i<words.length; i++ ){
					if( wordVertices[words[i].id] == v1 || wordVertices[words[i].id] == v2 ){
						wordVertices[words[i].id] = v;
					}
				}
			}
			else {
			}
		}
		for( var i=0; i<pairs.length; i++ ){
			checkMerge(pairs[i].pair.w1,pairs[i].pair.w2);
		}
		for( var i=0; i<wordlist.length; i++ ){
			var sp = [this.startVertex];
			for( var j=0; j<wordlist[i].length; j++ ){
				var v = wordVertices[wordlist[i][j].id];
				if( j == 0 ){
					this.startVertex.addSuccessor(v.index);
					v.addPredecessor(this.startVertex.index);
				}
				if( j == wordlist[i].length-1 ){
					v.addSuccessor(this.endVertex.index);
					this.endVertex.addPredecessor(v.index);
				}
				sp.push(v);
			}
			sp.push(this.endVertex);
			this.sentencePaths.push(sp);
		}
		this.vertices = this.graph.vertices;
	};

	this.pairAlignment = function(s1,s2){
		var matches = [];
		for( var i=0; i<s1.length; i++ ){
			matches.push([]);
			for( var j=0; j<s2.length; j++ ){
				if( s1[i].word == s2[j].word ){
					matches[i].push(s2[j]);
				}
			}
		}
		var paths = [];
		for( var i=0; i<matches.length; i++ ){
			var newPaths = [];
			var addPath = function(path1){
				var lNode1 = path1[path1.length-1];
				var found = false;
				var np = [];
				for( var j=newPaths.length; j>0; j-- ){
					var path2 = newPaths[j-1];
					var lNode2 = path2[path2.length-1];
					if( lNode1.w2 == lNode2.w2 && path1.length != path2.length ){
						if( path1.length <= path2.length ){
							np.push(path2);
							found = true;
						}
					}
					else if( lNode1.w2 == lNode2.w2 && path1.length == path2.length ){
						np.push(path2);
						found = true;
					}
					else {
						np.push(path2);
					}
				}
				if( !found ){
					np.push(path1);
				}
				newPaths = np;
			}
			for( var k=0; k<paths.length; k++ ){
				var path = paths[k];
				addPath(path);
				var lNode = path[path.length-1].w2;
				for( var j=0; j<matches[i].length; j++ ){
					var node = matches[i][j];
					if( node.wid > lNode.wid ){
						addPath(path.concat([{ w1: s1[i], w2: node}]));
					}
				}
			}
			for( var j=0; j<matches[i].length; j++ ){
				addPath([{ w1: s1[i], w2: matches[i][j]}]);
			}
			paths = newPaths;
		}
		this.matches = paths;
	};

	this.clean = function(sentence){
		sentence = sentence.toLowerCase();
		sentence = sentence.replace(/--/g, "");
		sentence = sentence.replace(/  /g, " ");
		sentence = sentence.replace(/,/g, "");
		sentence = sentence.replace(/\./g, "");
		sentence = sentence.replace(/;/g, "");
		sentence = sentence.replace(/:/g, "");
		sentence = sentence.replace(/\(/g, "");
		sentence = sentence.replace(/\)/g, "");
		sentence = sentence.replace(/\[/g, "");
		sentence = sentence.replace(/\]/g, "");
		sentence = sentence.replace(/\'/g, "");
		sentence = sentence.replace(/\"/g, "");
		sentence = sentence.replace(/Â´/g, "");
		sentence = sentence.replace(/`/g, "");
		if( sentence.lastIndexOf(" ") == sentence.length - 1 ){
			sentence = sentence.substring(0,sentence.length-1);
		}
		return sentence;
	}

	this.strongestShortestPath = function(s){
		var strength = 0, length = 1000000;
		var path;
		for( var i=0; i<s.successors.length; i++ ){
			var pi = [s];
			var si = s.count;
			var li = 1;
			var vertex = this.graph.getVertex(s.successors[i]);
			pi.push(vertex);
			if( !vertex.traced ){
				var vs = vertex.successors;
				si += vertex.count;
				while( vs.length > 0 ){
					var lc = this.graph.getVertex(vs[0]).count;
					var v = this.graph.getVertex(vs[0]);
					for( var j=1; j<vs.length; j++ ){
						if( this.graph.getVertex(vs[j]).count > lc ){
							lc = this.graph.getVertex(vs[j]).count;
							v = this.graph.getVertex(vs[j]);
						}
					}
					li++;
					pi.push(v);
					if( !v.traced ){
						si += lc;
						vs = v.successors;
					}
					else {
						vs = [];
					}
				}
			}
			if( li < length || li == length && si > strength ){
				length = li;
				strength = si;
				path = pi;
			}
		}
		return {
			strength: strength,
			length: length,
			path: path
		}
	}
/*
	this.strongestPath = function(s){
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].posId = -1;
		}
		this.startVertex.posId = 0;
		var edges = [];
		for( var i=0; i<this.startVertex.successors.length; i++ ){
			edges.push({
				head: this.startVertex,
				tail: this.graph.getVertex(this.startVertex.successors[i])
			});
		}
		while( edges.length > 0 ){
			var new_edges = [];
			for( var i=0; i<edges.length; i++ ){
				var e = edges[i];
				if( e.tail.posId <= e.head.posId ){
					e.tail.posId = e.head.posId + 1;
					for( var j=0; j<e.tail.successors.length; j++ ){
						new_edges.push({
							head: e.tail,
							tail: this.graph.getVertex(e.tail.successors[j])
						});
					}
				}
			}
			edges = new_edges;
		}
		var medges = [];
		for( var i=0; i<this.vertices.length; i++ ){
			for( var j=0; j<this.vertices[i].successors.length; j++ ){
				edges.push({
					head: this.vertices[i],
					tail: this.graph.getVertex(this.vertices[i].successors[j]),
					weight: 0,
					ids: []
				});
			}
		}
		var weightEdge = function(v1,v2,id){
			for( var i=0; i<edges.length; i++ ){
				var e = edges[i];
				if( e.head == v1 && e.tail == v2 ){
					e.weight++;
					e.ids.push(id);
				}
			}
		}
		for( var i=0; i<this.sentencePaths.length; i++ ){
			var p = this.sentencePaths[i];
			weightEdge(this.startVertex,p[0],i);
			weightEdge(p[p.length-1],this.endVertex,i);
			for( var j=0; j<p.length-1; j++ ){
				weightEdge(p[j],p[j+1],i);
			}
		}
		var getEdge = function(v1,v2){
			for( var i=0; i<edges.length; i++ ){
				var e = edges[i];
				if( e.head == v1 && e.tail == v2 ){
					return e;
				}
			}
		}
		var majorEdges = 0;
		for( var i=0; i<edges.length; i++ ){
			if( edges[i].weight > 3 ){
				majorEdges++;
			}
		}

		var paths = [[this.startVertex]];
		do {
			var change = false;
			var newPaths = [];
			for( var i=0; i<paths.length; i++ ){
				var vl = paths[i][paths[i].length-1];
				if( vl == this.endVertex ){
					newPaths.push(paths[i]);
					continue;
				}
				change = true;
				for( var j=0; j<vl.successors.length; j++ ){
					newPaths.push(paths[i].concat(this.graph.getVertex(vl.successors[j])));
				}
			}
			paths = newPaths;
		}
		while(change);
		var winner = false;
		for( var i=0; i<paths.length; i++ ){
			var s = 0, me = 0;
			var p = paths[i];
			for( var j=0; j<p.length-1; j++ ){
				var e = getEdge(p[j],p[j+1]);
				if( e.weight > 3 ){
					me++;
				}
				s += e.weight;
			}
			var w = {
				path: p,
				me: me,
				s: s
			};
			if( !winner || winner.me < me ){
				winner = w;
			}
			else if( p.length < winner.path.length || p.length == winner.path.length && s > winner.s ){
				winner = w;
			}
		}
		console.info(paths.length);
		return winner.path;
	}
*/
	this.getPaths = function(sid){
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].traced = false;
		}
		var p = this.sentencePaths[sid];
		for( var i=0; i<p.length; i++ ){
			p[i].traced = true;
		}
		var paths = [p];
		var traverse = true;
		var runs = 0;
		while( traverse ){
			runs++;
			traverse = false;
			var c = undefined;
			for( var i=0; i<this.vertices.length; i++ ){
				var v = this.vertices[i];
				if( v.traced ){
					for( var k=0; k<v.successors.length; k++ ){
						if( !this.graph.getVertex(v.successors[k]).traced ){
							var p = this.strongestShortestPath(this.graph.getVertex(v.successors[k]));
							p.path.splice(0,0,v);
							if( typeof c == "undefined" || c.length > p.length ||
								c.length == p.length && p.strength > c.strength ){
								c = p;
							}
						}
					}
				}
				else {
					traverse = true;
				}
			}
			if( typeof c != "undefined" ){
				for( var i=0; i<c.path.length; i++ ){
					c.path[i].traced = true;
				}
				paths.push(c.path);
			}
		}
		return paths;
	}

	this.prepareConnections = function(){
		this.connections = [];
		var horizontalSlots = [];
		for( var i=0; i<this.layers.length; i++ ){
			var hs = {
				height: 0,
				paths: [],
				index: this.layers[i].index
			};
			horizontalSlots.push(hs);
		}
		var putHorizontalSlot = function(layer,hc){
			for( var i=0; i<horizontalSlots.length; i++ ){
				if( horizontalSlots[i].index == layer ){
					horizontalSlots[i].paths.push(hc);
					break;
				}
			}
		}
		var sal = this;
		var setSlotHeights = function(){
			var x_min = 1000000, x_max = 0;
			for( var i=0; i<sal.layout.length; i++ ){
				var v = sal.layout[i];
				if( v.x1 < x_min ){
					x_min = v.x1;
				}
				if( v.x2 > x_max ){
					x_max = v.x2;
				}
			}
			var equalGroups = function(g1,g2){
				if( g1.length != g2.length ){
					return false;
				}
				for( var i=0; i<g1.length; i++ ){
					if( g1[i] != g2[i] ){
						return false;
					}
				}
				return true;
			}
			for( var i=0; i<horizontalSlots.length; i++ ){
				var s = horizontalSlots[i];
				var max = 0;
				var groups = [];
				for( var j=x_min; j<x_max; j++ ){
					var group = [];
					for( var k=0; k<s.paths.length; k++ ){
						if( s.paths[k].v1.x2 < j && s.paths[k].v2.x1 > j ){
							group.push(s.paths[k]);
						}
					}
					if( group.length > 0 && ( groups.length == 0 || !equalGroups(groups[groups.length-1],group) ) ){
						groups.push(group);
					}
				}
				var max = 0;
				for( var j=0; j<groups.length; j++ ){
					if( groups[j].length > max ){
						max = groups[j].length;
					}
				}
				s.height = max*3 + 2*curveRadius;
				s.groups = groups;
			}
		}
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			if( v == this.startVertex ){
//				continue;
			}
			var p = v.successors;
			for( var j=0; j<p.length; j++ ){
				if( this.graph.getVertex(p[j]) == this.endVertex ){
//					continue;
				}
				var v1 = v;
				var v2 = this.graph.getVertex(p[j]);
				if( v.token == '' && v2.token == '' && !v2.linebreak && v2 != this.endVertex ){
					continue;
				}
				var y1o = (v1.y1+v1.y2)/2;
				var y2o = (v2.y1+v2.y2)/2;
				if( v1.layer == v2.layer ){
					var overlaps = false;
					for( var k=0; k<this.vertices.length; k++ ){
						if( this.vertices[k] == v1 || this.vertices[k] == v2 ){
							continue;
						}
						if( this.vertices[k].layer == v1.layer && v1.x1 < this.vertices[k].x1 && this.vertices[k].x1 < v2.x1 ){
							overlaps = true;
							break;
						}
					}
					if( overlaps ){
						var con = new Connection(v1,v2,0);
						var vc1 = new VerticalConnection(v1,v2,'source');
						var hc = new HorizontalConnection(v1,v2,0);
						var vc2 = new VerticalConnection(v1,v2,'sink');
						this.connections.push(con);
						con.addLink(vc1);
						con.addLink(hc);
						con.addLink(vc2);
						putHorizontalSlot(v1.layer,hc);
					}
					else {
						this.connections.push(new Connection(v1,v2,-1));
					}
				}
				else if( Math.abs(v1.layer-v2.layer) == 1 && v2.x1 - v1.x2 >= 6*curveRadius ){
					var con = new Connection(v1,v2,2);
					this.connections.push(con);
					var vc1 = new VerticalConnection(v1,v2,'source');
					var hc = new HorizontalConnection(v1,v2,2);
					var vc2 = new VerticalConnection(v1,v2,'sink');
					con.addLink(vc1);
					con.addLink(hc);
					con.addLink(vc2);
					putHorizontalSlot(Math.max(v1.layer,v2.layer),hc);
				}
				else if( v2.x1 - v1.x2 >= 6*curveRadius && v1.layer != v2.layer ){
					var con = new Connection(v1,v2,3);
					this.connections.push(con);
					var vc1 = new VerticalConnection(v1,v2,'source');
					var hc = new HorizontalConnection(v1,v2,3);
					var vc2 = new VerticalConnection(v1,v2,'sink');
					if( Math.abs(v1.layer) > Math.abs(v2.layer) ){
						if( v1.layer < 0 ){
							putHorizontalSlot(v1.layer+1,hc);
						}
						else {
							putHorizontalSlot(v1.layer,hc);
						}
					}
					else {
						if( v2.layer < 0 ){
							putHorizontalSlot(v2.layer+1,hc);
						}
						else {
							putHorizontalSlot(v2.layer,hc);
						}
					}
					con.addLink(vc1);
					con.addLink(hc);
					con.addLink(vc2);
				}
				else if( v2.x1 - v1.x2 < 6*curveRadius && v1.layer != v2.layer ){
					var con = new Connection(v1,v2,1);
					var vc = new VerticalConnection(v1,v2,1);
					con.addLink(vc);
					this.connections.push(con);
				}
			}
		}
		setSlotHeights();
		this.horizontalSlots = horizontalSlots;
	}

	this.drawConnectionsNew = function(){
		this.generalConnections = [];
		var bezier = function(x1,y1,xb,yb,x2,y2){
			return "C "+x1+" "+y1+" "+xb+" "+yb+" "+x2+" "+y2+" ";
		}
		var line = function(x1,y1,x2,y2){
			return "L "+x1+" "+y1+" "+x2+" "+y2+" ";
		}
		for( var i=0; i<this.connections.length; i++ ){
			var c = this.connections[i];
			var x1 = c.v1.x2;
			var x2 = c.v2.x1;
			var y1 = (c.v1.y1+c.v1.y2)/2;
			var y2 = (c.v2.y1+c.v2.y2)/2;
			var path = "M "+x1+" "+y1+" ";
			if( c.type == -1 ){
				path += line(x1,y1,x2,y2);
				if( x2-x1 < 2*curveRadius ){
//					console.info('bug: type1',c);
				}
			}
			else if( c.type == 0 ){
				var v1 = c.links[0];
				var h = c.links[1];
				var v2 = c.links[2];
				path += line(x1,y1,v1.x1-curveRadius,y1);
				path += bezier(v1.x1-curveRadius,y1,v1.x1,y1,v1.x1,v1.y1);
				path += line(v1.x1,v1.y1,v1.x2,v1.y2);
				path += bezier(v1.x2,v1.y2,v1.x2,h.y1,h.x1,h.y1);
				path += line(h.x1,h.y1,h.x2,h.y2);
				path += bezier(h.x2,h.y2,v2.x1,h.y2,v2.x1,v2.y1);
				path += line(v2.x1,v2.y1,v2.x2,v2.y2);
				path += bezier(v2.x2,v2.y2,v2.x2,y2,v2.x2+curveRadius,y2);
				path += line(v2.x2+curveRadius,y2,x2,y2);
				if( v1.x1-x1 < curveRadius ){
//					console.info('bug: type2',c);
				}
				if( x2-v2.x1 < curveRadius ){
//					console.info('bug: type2',c);
				}
			}
			else if( c.type == 1 ){
				var link = c.links[0];
				path += line(x1,y1,link.x1-curveRadius,y1);
				path += bezier(link.x1-curveRadius,y1,link.x1,y1,link.x1,link.y1);
				path += line(link.x1,link.y1,link.x2,link.y2);
				path += bezier(link.x2,link.y2,link.x2,y2,link.x2+curveRadius,y2);
				path += line(link.x2+curveRadius,y2,x2,y2);
				if( link.x1-x1 < curveRadius || x2-link.x1 < curveRadius ){
//					console.info('bug: type3',c);
				}
			}
			else if( c.type == 2 || c.type == 3 ){
				var v1 = c.links[0];
				var h = c.links[1];
				var v2 = c.links[2];
				path += line(x1,y1,v1.x1-curveRadius,y1);
				path += bezier(v1.x1-curveRadius,y1,v1.x1,y1,v1.x1,v1.y1);
				path += line(v1.x1,v1.y1,v1.x2,v1.y2);
				path += bezier(v1.x2,v1.y2,v1.x2,h.y1,h.x1,h.y1);
				path += line(h.x1,h.y1,h.x2,h.y2);
				path += bezier(h.x2,h.y2,v2.x1,h.y2,v2.x1,v2.y1);
				path += line(v2.x1,v2.y1,v2.x2,v2.y2);
				path += bezier(v2.x2,v2.y2,v2.x2,y2,v2.x2+curveRadius,y2);
				path += line(v2.x2+curveRadius,y2,x2,y2);
				if( v1.x1-x1 < curveRadius ){
//					console.info('bug: type3',c);
				}
				if( x2-v2.x1 < curveRadius ){
//					console.info('bug: type3',c);
				}
			}
			var pvis = this.paper.path(path).attr({stroke: "#3E576F", "stroke-width": 3, "stroke-linecap": "round", "opacity": "0.8"});
			this.generalConnections.push(pvis);
		}
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			if( v == this.startVertex || v == this.endVertex || v.token == '' ){
				continue;
			}
			v.rect.toFront();
			v.textNode.toFront();
		}
	}

	this.adjustVerticalConnections = function(){
		var verticals = [];
		for( var i=0; i<this.connections.length; i++ ){
			var c = this.connections[i];
			var x1 = c.v1.x2;
			var x2 = c.v2.x1;
			var xc = (x1+x2)/2;
			var y1 = (c.v1.y1+c.v1.y2)/2;
			var y2 = (c.v2.y1+c.v2.y2)/2;
			if( c.type == 1 ){
				var vy1, vy2;
				if( y1 > y2 ){
					vy1 = y1 - curveRadius;
					vy2 = y2 + curveRadius;
				}
				else {
					vy1 = y1 + curveRadius;
					vy2 = y2 - curveRadius;
				}
				var vc = c.links[0];
				vc.position(xc,vy1,vy2);
				verticals.push(vc);
			}
			else if( c.type == 0 || c.type == 2 || c.type == 3 ){
				var h = c.links[1];
				var v1x = x1 + curveRadius;
				var v1y1, v1y2;
				if( c.v1.layer >= c.v2.layer ){
					v1y1 = y1 - curveRadius;
					v1y2 = h.y1 + curveRadius;
				}
				else {
					v1y1 = y1 + curveRadius;
					v1y2 = h.y1 - curveRadius;
				}
				var vc1 = c.links[0];
				vc1.position(v1x,v1y1,v1y2);
				verticals.push(vc1);
				var v2x = x2 - curveRadius;
				var v2y1, v2y2;
				if( c.v1.layer <= c.v2.layer ){
					v2y1 = h.y1 + curveRadius;
					v2y2 = y2 - curveRadius;
				}
				else {
					v2y1 = h.y1 - curveRadius;
					v2y2 = y2 + curveRadius;
				}
				var vc2 = c.links[c.links.length-1];
				vc2.position(v2x,v2y1,v2y2);
				verticals.push(vc2);
			}
		}
		var sortVerticals = function(v1,v2){
			if( v1.x1 < v2.x1 ){
				return -1;
			}
			if( v1.x1 == v2.x1 && v1.yMax() > v2.yMax() ){
				return -1;
			}
			return 1;
		}
		verticals.sort(sortVerticals);

			var groups = [];
			for( var j=0; j<verticals.length; j++ ){
				var sourceFound = false;
				var sinkFound = false;
				for( var k=0; k<groups.length; k++ ){
					if( ( verticals[j].type == 'source' || verticals[j].type == 1 ) && groups[k].source == verticals[j].v1 ){
						sourceFound = true;
						groups[k].paths.push(verticals[j]);
						if( verticals[j].yMin() < groups[k].y1 ){
							groups[k].y1 = verticals[j].yMin();
						}
						if( verticals[j].yMax() > groups[k].y2 ){
							groups[k].y2 = verticals[j].yMax();
						}
					}
					if( ( verticals[j].type == 'sink' || verticals[j].type == 1 ) && groups[k].sink == verticals[j].v2 ){
						sinkFound = true;
						groups[k].paths.push(verticals[j]);
						if( verticals[j].yMin() < groups[k].y1 ){
							groups[k].y1 = verticals[j].yMin();
						}
						if( verticals[j].yMax() > groups[k].y2 ){
							groups[k].y2 = verticals[j].yMax();
						}
					}
				}
				if( !sourceFound && verticals[j].type != 'sink' ){
					groups.push({
						vertex: verticals[j].v1,
						source: verticals[j].v1,
						paths: [verticals[j]],
						y1: verticals[j].yMin(),
						y2: verticals[j].yMax(),
						x: verticals[j].v1.x2 + curveRadius
					});
				}
				if( !sinkFound && verticals[j].type != 'source' ){
					groups.push({
						vertex: verticals[j].v2,
						sink: verticals[j].v2,
						paths: [verticals[j]],
						y1: verticals[j].yMin(),
						y2: verticals[j].yMax(),
						x: verticals[j].v2.x1 - curveRadius
					});
				}
			}
			var sortGroupsBySize = function(g1,g2){
				if( g1.paths.length > g2.paths.length ){
					return 1;
				}
				if( g1.paths.length == g2.paths.length && Math.abs(g1.vertex.layer) < Math.abs(g2.vertex.layer) ){
					return 1;
				}
				return -1;
			}
			groups.sort(sortGroupsBySize);
			var groupsToPlace = [];
			for( var j=groups.length; j>0; j-- ){
				var g1 = groups[j-1];
				var ng1 = [];
				for( var k=0; k<g1.paths.length; k++ ){
					if( !g1.paths[k].placed ){
						ng1.push(g1.paths[k]);
					}
				}
				if( ng1.length < g1.paths.length ){
					if( ng1.length == 0 ){
						groups.pop();
						continue;
					}
					g1.paths = ng1;
					groups.sort(sortGroupsBySize);
					j = groups.length+1;
					continue;
				}
				for( var k=0; k<g1.paths.length; k++ ){
					g1.paths[k].placed = true;
				}
				groupsToPlace.push(g1);
				groups.pop();
			}
			groups = groupsToPlace;
			var sortGroupsByX = function(g1,g2){
				if( g1.x < g2.x ){
					return 1;
				}
				if( g1.x == g2.x ){
					if( g1.paths.length > g2.paths.length && g1.source ){
						return 1;
					}
				}
				return -1;
			}
			groups.sort(sortGroupsByX);
			var placedGroups = [];
			for( var j=groups.length; j>0; j-- ){
				var g1 = groups[j-1];
				if( typeof g1.source != 'undefined' ){
					var ox = g1.x;
					var nx = g1.paths[0].v1.x2 + curveRadius;
					if( ox != nx ){
						g1.x = nx;
						groups.sort(sortGroupsByX);
						j = groups.length+1;
						continue;
					}
				}
				if( typeof g1.sink != 'undefined' ){
					var ox = g1.x;
					var nx = g1.paths[0].v2.x1 - curveRadius;
					if( ox != nx ){
						g1.x = nx;
						groups.sort(sortGroupsByX);
						j = groups.length+1;
						continue;
					}
				}
				do {
					var overlap = false;
					for( var k=0; k<placedGroups.length; k++ ){
						var g2 = placedGroups[k];
						if( Math.abs(g1.x-g2.x) < edgeGap && !( g1.y1 > g2.y2 || g2.y1 > g1.y2 ) ){
							overlap = true;
							g1.x += edgeGap - Math.abs(g1.x-g2.x);
						}
					}
				}
				while(overlap);
				for( var k=0; k<g1.paths.length; k++ ){
					var p = g1.paths[k];
					p.x1 = g1.x;
					p.x2 = g1.x;
					/*
					var v = p.v2;
					if( v.x1 - g1.x < curveRadius ){
						var s = curveRadius - ( v.x1 - g1.x );
						v.x1 += s;
						v.x2 += s;
						var pairs = [];
						for( var m=0; m<v.successors.length; m++ ){
							pairs.push({
								head: v,
								tail: this.graph.getVertex(v.successors[m])
							});
						}
						while( pairs.length > 0 ){
							var pairsNew = [];
							for( var m=0; m<pairs.length; m++ ){
								var v1 = pairs[m].head;
								var v2 = pairs[m].tail;
								if( v2.x1-v1.x2 < 2*curveRadius ){
									var sh = 2*curveRadius - ( v2.x1-v1.x2 );
									v2.x1 += sh;
									v2.x2 += sh;
									for( var n=0; n<v2.successors.length; n++ ){
										pairsNew.push({
											head: v2,
											tail: this.graph.getVertex(v2.successors[n])
										});
									}
								}
							}
							pairs = pairsNew;
						}
					}
					*/
				}
				placedGroups.push(g1);
				groups.pop();
			}
	}

	this.reinitType3 = function(){
		for( var i=0; i<this.connections.length; i++ ){
			var c = this.connections[i];
			if( c.type == 0 || c.type == 2 || c.type == 3 ){
				var v1 = c.links[0];
				var h = c.links[1];
				var v2 = c.links[2];
				h.x1 = v1.x1 + curveRadius;
				h.x2 = v2.x1 - curveRadius;
			}
			if( c.type == 3 || c.type == 2 ){
				var h = c.links[1];
				var y1 = (c.v1.y1+c.v1.y2)/2;
				var y2 = (c.v2.y1+c.v2.y2)/2;
				if( Math.abs(c.v1.layer) > Math.abs(c.v2.layer) ){
					var ol = false;
					for( var j=0; j<this.vertices.length; j++ ){
						var v = this.vertices[j];
						var xol = false;
						var yol = false;
						if( !( v.x1 > h.x2 || h.x1 > v.x2 ) ){
							xol = true;
						}
						if( !( v.y1 > y1 || y1 > v.y2 ) ){
							yol = true;
						}
						if( xol && yol ){
							ol = true;
							break;
						}
					}
					if( !ol ){
						c.type = 1;
						var vc = c.links[2];
						if( vc.v1.layer > 0 ){
							vc.y1 = y1 - curveRadius;
						}
						else {
							vc.y1 = y1 + curveRadius;
						}
						c.links = [vc];
					}
				}
				else if( Math.abs(c.v1.layer) <= Math.abs(c.v2.layer) || c.type == 2 ){
					var ol = false;
					for( var j=0; j<this.vertices.length; j++ ){
						var v = this.vertices[j];
						var xol = false;
						var yol = false;
						if( !( v.x1 > h.x2 || h.x1 > v.x2 ) ){
							xol = true;
						}
						if( !( v.y1 > y2 || y2 > v.y2 ) ){
							yol = true;
						}
						if( xol && yol ){
							ol = true;
							break;
						}
					}
					if( !ol ){
						c.type = 1;
						var vc = c.links[0];
						if( c.v2.layer <= 0 ){
							vc.y2 = y2 + curveRadius;
						}
						else {
							vc.y2 = y2 - curveRadius;
						}
						c.links = [vc];
					}
				}
			}
		}
	}

	this.adjustHorizontalConnections = function(){
		var orderPaths = function(p1,p2){
			if( p1.type == 0 && p2.type == 0 ){
				if( p1.x2-p1.x1 < p2.x2-p2.x1 ){
					return -1;
				}
				return 1;
			}
			else if( p1.type == 0 ){
				return -1;
			}
			else if( p2.type == 0 ){
				return 1;
			}
			else {
				if( p1.x2 == p2.x2 ){
					if( p1.x1 < p2.x1 ){
						return -1;
					}
					return 1;
				}
				else if( p1.x2 < p2.x2 ){
					return -1;
				}
				return 1;
			}
		}
		for( var i=0; i<this.horizontalSlots.length; i++ ){
			var horizontals = [];
			var hs = this.horizontalSlots[i];
			var paths = hs.paths;
			for( var j=0; j<paths.length; j++ ){
				var hc = paths[j];
				var x1 = hc.v1.x2;
				var x2 = hc.v2.x1;
				var y = hs.yMax - 2;
				hc.position(x1+2*curveRadius,x2-2*curveRadius,y);
			}
			paths.sort(orderPaths);
			var groups = [];
			for( var j=0; j<paths.length; j++ ){
				var sourceFound = false;
				var sinkFound = false;
				for( var k=0; k<groups.length; k++ ){
					if( groups[k].source == paths[j].v1 ){
						sourceFound = true;
						groups[k].paths.push(paths[j]);
						if( paths[j].x1 < groups[k].x1 ){
							groups[k].x1 = paths[j].x1;
						}
						if( paths[j].x2 > groups[k].x2 ){
							groups[k].x2 = paths[j].x2;
						}
					}
					if( groups[k].sink == paths[j].v2 ){
						sinkFound = true;
						groups[k].paths.push(paths[j]);
						if( paths[j].x1 < groups[k].x1 ){
							groups[k].x1 = paths[j].x1;
						}
						if( paths[j].x2 > groups[k].x2 ){
							groups[k].x2 = paths[j].x2;
						}
					}
				}
				if( !sourceFound ){
					groups.push({
						source: paths[j].v1,
						paths: [paths[j]],
						x1: paths[j].x1,
						x2: paths[j].x2,
						y: paths[j].y1
					});
				}
				if( !sinkFound ){
					groups.push({
						sink: paths[j].v2,
						paths: [paths[j]],
						x1: paths[j].x1,
						x2: paths[j].x2,
						y: paths[j].y1
					});
				}
			}
			var sortGroups = function(g1,g2){
				if( g1.paths.length > g2.paths.length ){
					return 1;
				}
				return -1;
			}
			groups.sort(sortGroups);
			var placedGroups = [];
			for( var j=groups.length; j>0; j-- ){
				var g1 = groups[j-1];
				var ng1 = [];
				for( var k=0; k<g1.paths.length; k++ ){
					if( !g1.paths[k].placed ){
						ng1.push(g1.paths[k]);
					}
				}
				if( ng1.length < g1.paths.length ){
					g1.paths = ng1;
					groups.sort(sortGroups);
					j = groups.length+1;
					continue;
				}
				do {
					var overlap = false;
					for( var k=0; k<placedGroups.length; k++ ){
						var g2 = placedGroups[k];
						if( g1.y == g2.y && !( g1.x1 > g2.x2 || g2.x1 > g1.x2 ) ){
							overlap = true;
							g1.y -= edgeGap;
						}
					}
				}
				while(overlap);
				for( var k=0; k<g1.paths.length; k++ ){
					g1.paths[k].placed = true;
					g1.paths[k].y1 = g1.y;
					g1.paths[k].y2 = g1.y;
				}
				placedGroups.push(g1);
				groups.pop();
			}
		}
	}

	this.drawSentencePath = function(i){
		var p = this.sentencePaths[i];
		var path = "";
		for( var j=1; j<p.length; j++ ){
			path += this.generatePath(this.getConnection(p[j-1],p[j]),0,0);
		}
		var pvis = this.paper.path(path).attr({stroke: SentenceAlignerProperties.getColor(this.sourceIds[i]), "stroke-width": 4, "stroke-linecap": "round", "opacity": "1.0"});
		return pvis;
	}

	this.generatePath = function(connection,s1,s2){
		var bezier = function(x1,y1,xb,yb,x2,y2){
			return "C "+x1+" "+y1+" "+xb+" "+yb+" "+x2+" "+y2+" ";
		}
		var line = function(x1,y1,x2,y2){
			return "L "+x1+" "+y1+" "+x2+" "+y2+" ";
		}
		var c = connection;
		var x1 = c.v1.x2;
		var x2 = c.v2.x1;
		var y1 = (c.v1.y1+c.v1.y2)/2 + s1;
		var y2 = (c.v2.y1+c.v2.y2)/2 + s2;
		var path = "M "+x1+" "+y1+" ";
		if( c.type == -1 ){
			path += line(x1,y1,x2,y2);
			if( x2-x1 < 2*curveRadius ){
//				console.info('bug: type1',c);
			}
		}
		else if( c.type == 0 ){
			var v1 = c.links[0];
			var h = c.links[1];
			var v2 = c.links[2];
			var v1x1 = v1.x1, v1x2 = v1.x2, v1y1 = v1.y1 + s1, v1y2 = v1.y2;
			var hx1 = h.x1, hx2 = h.x2, hy1 = h.y1, hy2 = h.y2;
			var v2x1 = v2.x1, v2x2 = v2.x2, v2y1 = v2.y1, v2y2 = v2.y2 + s2;
			var cr1 = curveRadius, cr2 = curveRadius;
			if( Math.abs(hy1-y1) < 2*curveRadius ){
				cr1 = Math.abs(hy1-y1)/2;
				var y = (hy1+y1)/2;
				v1y1 = y;
				v1y2 = y;
			}
			if( Math.abs(hy1-y2) < 2*curveRadius ){
				cr2 = Math.abs(hy1-y2)/2;
				var y = (hy1+y2)/2;
				v2y1 = y;
				v2y2 = y;
			}
			path += line(x1,y1,v1x1-cr1,y1);
			path += bezier(v1x1-cr1,y1,v1x1,y1,v1x1,v1y1);
			path += line(v1x1,v1y1,v1x2,v1y2);
			path += bezier(v1x2,v1y2,v1x2,hy1,hx1,hy1);
			path += line(hx1,hy1,hx2,hy2);
			path += bezier(hx2,hy2,v2x1,hy2,v2x1,v2y1);
			path += line(v2x1,v2y1,v2x2,v2y2);
			path += bezier(v2x2,v2y2,v2x2,y2,v2x2+cr2,y2);
			path += line(v2x2+cr2,y2,x2,y2);
			if( v1x1-x1 < curveRadius ){
//				console.info('bug: type2',c);
			}
			if( x2-v2x1 < curveRadius ){
//				console.info('bug: type2',c);
			}
		}
		else if( c.type == 1 ){
			var link = c.links[0];
			path += line(x1,y1,link.x1-curveRadius,y1);
			path += bezier(link.x1-curveRadius,y1,link.x1,y1,link.x1,link.y1 + s1);
			path += line(link.x1,link.y1 + s1,link.x2,link.y2 + s2);
			path += bezier(link.x2,link.y2 + s2,link.x2,y2,link.x2+curveRadius,y2);
			path += line(link.x2+curveRadius,y2,x2,y2);
			if( link.x1-x1 < curveRadius || x2-link.x1 < curveRadius ){
//				console.info('bug: type3',c);
			}
		}
		else if( c.type == 2 || c.type == 3 ){
			var v1 = c.links[0];
			var h = c.links[1];
			var v2 = c.links[2];
			var v1x1 = v1.x1, v1x2 = v1.x2, v1y1 = v1.y1 + s1, v1y2 = v1.y2;
			var hx1 = h.x1, hx2 = h.x2, hy1 = h.y1, hy2 = h.y2;
			var v2x1 = v2.x1, v2x2 = v2.x2, v2y1 = v2.y1, v2y2 = v2.y2 + s2;
			var cr1 = curveRadius, cr2 = curveRadius;
			if( Math.abs(hy1-y1) < 2*curveRadius ){
				cr1 = Math.abs(hy1-y1)/2;
				var y = (hy1+y1)/2;
				v1y1 = y;
				v1y2 = y;
			}
			if( Math.abs(hy1-y2) < 2*curveRadius ){
				cr2 = Math.abs(hy1-y2)/2;
				var y = (hy1+y2)/2;
				v2y1 = y;
				v2y2 = y;
			}
			path += line(x1,y1,v1x1-cr1,y1);
			path += bezier(v1x1-cr1,y1,v1x1,y1,v1x1,v1y1);
			path += line(v1x1,v1y1,v1x2,v1y2);
			path += bezier(v1x2,v1y2,v1x2,hy1,hx1,hy1);
			path += line(hx1,hy1,hx2,hy2);
			path += bezier(hx2,hy2,v2x1,hy2,v2x1,v2y1);
			path += line(v2x1,v2y1,v2x2,v2y2);
			path += bezier(v2x2,v2y2,v2x2,y2,v2x2+cr2,y2);
			path += line(v2x2+cr2,y2,x2,y2);
			if( v1x1-x1 < curveRadius ){
//				console.info('bug: type3',c);
			}
			if( x2-v2x1 < curveRadius ){
//				console.info('bug: type3',c);
			}
		}
		return path;
	}

	this.getConnection = function(v1,v2){
		for( var i=0; i<this.connections.length; i++ ){
			if( this.connections[i].v1 == v1 && this.connections[i].v2 == v2 ){
				return this.connections[i];
			}
		}
	}

	this.drawConnections = function(node,vertex){
		this.sentenceConnections = [];
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].ins = [];
			this.vertices[i].outs = [];
		}
		for( var i=0; i<this.sentencePaths.length; i++ ){
			var p = this.sentencePaths[i];
			for( var j=0; j<p.length; j++ ){
				if( p[j] == vertex ){
					for( var j=0; j<p.length; j++ ){
						if( j>0 ){
							p[j].ins.push({
								v: p[j-1],
								id: i
							});
						}
						if( j<p.length-1 ){
							p[j].outs.push({
								v: p[j+1],
								id: i
							});
						}
					}
				}
			}
		}
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			var yv = (v.y1+v.y2)/2;
			this.vertices[i].ins.sort(function(t1,t2){
				var y1 = (t1.v.y1+t1.v.y2)/2;
				var y2 = (t2.v.y1+t2.v.y2)/2;
				if( t1.v == t2.v && t1.id > t2.id ){
					return 1;
				}
				else if( t1.v != t2.v && y1 == y2 && t1.v.x2 > t2.v.x2 ){
					return 1;
				}
				else if( t1.v != t2.v && y1 > y2 ){
					return 1;
				}
				return -1;
			});
			this.vertices[i].outs.sort(function(t1,t2){
				var y1 = (t1.v.y1+t1.v.y2)/2;
				var y2 = (t2.v.y1+t2.v.y2)/2;
				if( t1.v == t2.v && t1.id > t2.id ){
					return 1;
				}
				else if( t1.v != t2.v && y1 == y2 && t1.v.x2 < t2.v.x2 ){
					return 1;
				}
				else if( t1.v != t2.v && y1 > y2 ){
					return 1;
				}
				return -1;
			});
			/*
			if( this.vertices[i].token == "the" && this.vertices[i].ins.length == 4 ){
				console.info(this.vertices[i].ins,this.vertices[i].outs);
			}
			*/
		}
		var getShift = function(id,array){
			if( array.length == 1 ){
				return 0;
			}
			for( var i=0; i<array.length; i++ ){
				if( array[i].id == id ){
					return i*3 - array.length*3/2;
				}
			}
		}
		for( var i=0; i<this.sentencePaths.length; i++ ){
			var p = this.sentencePaths[i];
			for( var j=0; j<p.length; j++ ){
				if( p[j] == vertex ){
					var path = "";
//					path += this.generatePath(this.getConnection(this.startVertex,p[0]),0,getShift(i,p[0].ins));
					for( var j=1; j<p.length; j++ ){
						var c = this.getConnection(p[j-1],p[j]);
						if( c ){
							path += this.generatePath(c,getShift(i,p[j-1].outs),getShift(i,p[j].ins));
						}
					}
//					path += this.generatePath(this.getConnection(p[p.length-1],this.endVertex),getShift(i,p[p.length-1].outs),0);
					var pvis = this.paper.path(path).attr({stroke: SentenceAlignerProperties.getColor(this.sourceIds[i]), "stroke-width": 3, "stroke-linecap": "round", "opacity": "0.8"});
					this.sentenceConnections.push(pvis);
					break;
				}
			}
		}
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			if( v == this.startVertex || v == this.endVertex || v.token == '' ){
				continue;
			}
			v.rect.toFront();
			v.textNode.toFront();
		}
	};

	this.drawAllConnections = function(){
		var edges = [];
		for( var i=0; i<this.vertices.length; i++ ){
			for( var j=0; j<this.vertices[i].successors.length; j++ ){
				edges.push({
					head: this.vertices[i],
					tail: this.graph.getVertex(this.vertices[i].successors[j]),
					weight: 0,
					ids: []
				});
			}
		}
		var weightEdge = function(v1,v2,id){
			for( var i=0; i<edges.length; i++ ){
				var e = edges[i];
				if( e.head == v1 && e.tail == v2 ){
					e.weight++;
					e.ids.push(id);
				}
			}
		}
		for( var i=0; i<this.sentencePaths.length; i++ ){
			var p = this.sentencePaths[i];
			weightEdge(this.startVertex,p[0],i);
			weightEdge(p[p.length-1],this.endVertex,i);
			for( var j=0; j<p.length-1; j++ ){
				weightEdge(p[j],p[j+1],i);
			}
		}
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].ins = [];
			this.vertices[i].outs = [];
		}
		for( var i=0; i<edges.length; i++ ){
			var e = edges[i];
			if( e.weight >= 4 ){
				e.head.outs.push({
					v: e.tail,
					id: -1
				});
				e.tail.ins.push({
					v: e.head,
					id: -1
				});
			}
			else {
				for( var j=0; j<e.ids.length; j++ ){
					e.head.outs.push({
						v: e.tail,
						id: e.ids[j]
					});
					e.tail.ins.push({
						v: e.head,
						id: e.ids[j]
					});
				}
			}
		}
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			var yv = (v.y1+v.y2)/2;
			if( this.vertices[i].token == "" && ( this.vertices[i].ins.length <= 1 || this.vertices[i].outs.length <= 1 ) ){
				this.vertices[i].ins = [{}];
				this.vertices[i].outs = [{}];
			}
			this.vertices[i].ins.sort(function(t1,t2){
				var y1 = (t1.v.y1+t1.v.y2)/2;
				var y2 = (t2.v.y1+t2.v.y2)/2;
				if( t1.v == t2.v && t1.id > t2.id ){
					return 1;
				}
				else if( t1.v != t2.v && y1 == y2 && t1.v.x2 > t2.v.x2 ){
					return 1;
				}
				else if( t1.v != t2.v && y1 > y2 ){
					return 1;
				}
				return -1;
			});
			this.vertices[i].outs.sort(function(t1,t2){
				var y1 = (t1.v.y1+t1.v.y2)/2;
				var y2 = (t2.v.y1+t2.v.y2)/2;
				if( t1.v == t2.v && t1.id > t2.id ){
					return 1;
				}
				else if( t1.v != t2.v && y1 == y2 && t1.v.x2 < t2.v.x2 ){
					return 1;
				}
				else if( t1.v != t2.v && y1 > y2 ){
					return 1;
				}
				return -1;
			});
		}
		var getShift = function(id,array){
			if( array.length == 1 ){
				return 0;
			}
			for( var i=0; i<array.length; i++ ){
				if( array[i].id == id ){
					return i*3 - array.length*3/2;
				}
			}
		}
		this.generalConnections = [];
		for( var i=0; i<edges.length; i++ ){
			var e = edges[i];
			var c = this.getConnection(e.head,e.tail);
			if( !c ){
				continue;
			}
			if( e.weight >= 4 ){
				var path = this.generatePath(c,getShift(-1,e.head.outs),getShift(-1,e.tail.ins));
				var pvis = this.paper.path(path).attr({stroke: SentenceAlignerProperties.getColor(-1), "stroke-width": 5, "stroke-linecap": "round", "opacity": "0.8"});
				this.generalConnections.push(pvis);
			}
			else {
				for( var j=0; j<e.ids.length; j++ ){
					var path = this.generatePath(c,getShift(e.ids[j],e.head.outs),getShift(e.ids[j],e.tail.ins));
					var pvis = this.paper.path(path).attr({stroke: SentenceAlignerProperties.getColor(this.sourceIds[e.ids[j]]), "stroke-width": 3, "stroke-linecap": "round", "opacity": "0.8"});
					this.generalConnections.push(pvis);
				}
			}
		}
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			if( v == this.startVertex || v == this.endVertex || v.token == '' ){
				continue;
			}
			v.rect.toFront();
			v.textNode.toFront();
		}
	};

	this.setXFlow = function(){
		var gap = 3*curveRadius;
		var edges = [];
		for( var i=0; i<this.startVertex.successors.length; i++ ){
			edges.push({
				head: this.startVertex,
				tail: this.graph.getVertex(this.startVertex.successors[i])
			});
		}
		var widthS = this.startVertex.boxWidth;//textNode.getBBox().width;
		this.startVertex.x1 = gap;
		this.startVertex.x2 = gap + widthS;
//		this.startVertex.textNode.attr({ x: gap });
		while( edges.length > 0 ){
			var new_edges = [];
			for( var i=0; i<edges.length; i++ ){
				var e = edges[i];
				if( e.tail.x1 < e.head.x2 + gap ){
					var widthT = e.tail.boxWidth;
					e.tail.x1 = e.head.x2 + gap;
					e.tail.x2 = e.head.x2 + gap + widthT;
					//e.tail.textNode.attr({ x: e.head.x2 + gap });
					for( var j=0; j<e.tail.successors.length; j++ ){
						new_edges.push({
							head: e.tail,
							tail: this.graph.getVertex(e.tail.successors[j])
						});
					}
				}
			}
			edges = new_edges;
		}
		var largestMove = 3;
		while( largestMove > 2 ){
			largestMove = 0;
			for( var i=0; i<this.vertices.length; i++ ){
				var v = this.vertices[i];
				if( v == this.startVertex || v == this.endVertex ){
					continue;
				}
				var x_old = Math.floor(( v.x2 + v.x1 ) / 2);
				var w = v.boxWidth;
				var x_left = undefined, x_right = undefined;
				var xl = undefined, xr = undefined;
				for( var j=0; j<v.predecessors.length; j++ ){
					var vp = this.graph.getVertex(v.predecessors[j]);
					var xp = vp.x2;
					if( vp == this.startVertex ){
						xp = v.x1 - gap;
					}
					if( typeof x_left == "undefined" || xp > x_left ){
						x_left = xp;
						xl = vp;
					}
				}
				for( var j=0; j<v.successors.length; j++ ){
					var vs = this.graph.getVertex(v.successors[j]);
					var xs = vs.x1;
					if( vs == this.endVertex ){
						xs = v.x2 + gap;
					}
					if( typeof x_right == "undefined" || xs < x_right ){
						x_right = xs;
						xr = vs;
					}
				}
				var x_new = Math.floor(( x_left + x_right ) / 2);
				if( isNaN(x_new) ){
					x_new = x_old;
				}
				if( x_new != x_old ){
					v.x1 = x_new - w/2;
					v.x2 = v.x1 + w;
					if( largestMove < Math.abs(x_new-x_old) ){
						largestMove = Math.abs(x_new-x_old);
					}
				}
			}
		}
/*
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].textNode.attr({ x: this.vertices[i].x1 });
		}
*/
	};

	this.overlap = function(x1_min,x1_max,x2_min,x2_max,y1_min,y1_max,y2_min,y2_max){
		if( x1_min >= x2_max || x1_max <= x2_min || y1_min >= y2_max || y1_max <= y2_min ){
			return false;
		}
		return true;
	}

	this.getLayer = function(index){
		for( var i=0; i<this.layers.length; i++ ){
			if( this.layers[i].index == index ){
				return this.layers[i];
			}
		}
		return false;
	}

	this.getHorizontalSlot = function(index){
		for( var i=0; i<this.horizontalSlots.length; i++ ){
			if( this.horizontalSlots[i].index == index ){
				return this.horizontalSlots[i];
			}
		}
	}

	this.insertDummys = function(width,l0gap){
		var gap = 3*curveRadius;
		var sortByX = function(v1,v2){
			if( v1.x1 < v2.x1 ){
				return -1;
			}
			return 1;
		}
		this.vertices.sort(sortByX);
		var shift = this.vertices[0].x1 - gap - l0gap;
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].x1 -= shift;
			this.vertices[i].x2 -= shift;
			this.vertices[i].x1Temp = this.vertices[i].x1;
			this.vertices[i].x2Temp = this.vertices[i].x2;
		}
		var verticesToCheck = this.vertices;
		var level = 0;
		while( verticesToCheck.length > 0 ){
			var vtc = [];
			var shift = 0;
			var tshift = 0;
			for( var i=0; i<verticesToCheck.length; i++ ){
				if( verticesToCheck[i].x2Temp + 2*gap > width ){
					if( shift == 0 ){
						shift = 3*gap - verticesToCheck[i].x1Temp;
						verticesToCheck[i].x2Temp = verticesToCheck[i].x2Temp - verticesToCheck[i].x1Temp + 3*gap;
						verticesToCheck[i].x1Temp = 3*gap;
						tshift = (level+1)*width - verticesToCheck[i].x1 + 3*gap;
					}
					else {
						verticesToCheck[i].x1Temp += shift;
						verticesToCheck[i].x2Temp += shift;
					}
					verticesToCheck[i].x1 += tshift;
					verticesToCheck[i].x2 += tshift;
					vtc.push(verticesToCheck[i]);
				}
				else {
					verticesToCheck[i].level = level;
				}
			}
			verticesToCheck = vtc;
			level++;
		}
		var dummys = [];
		var edges = [];
		for( var i=0; i<this.vertices.length; i++ ){
			for( var j=0; j<this.vertices[i].successors.length; j++ ){
				edges.push({
					head: this.vertices[i],
					tail: this.graph.getVertex(this.vertices[i].successors[j])
				});
			}
		}
		var paths = [];
		for( var i=0; i<edges.length; i++ ){
			var e = edges[i];
			if( e.tail.level != e.head.level ){
				var dvh, dvt, dvi;
				if( typeof dummys[e.tail.index+''] == 'undefined' ){

					dvh = new Vertex(this.graph,SentenceAlignerProperties.getVertexIndex(),'');
					dvh.predecessors = [e.head.index];
					e.head.removeSuccessor(e.tail.index);
					e.head.addSuccessor(dvh.index);

					dvt = new Vertex(this.graph,SentenceAlignerProperties.getVertexIndex(),'');
					dvt.successors = [e.tail.index];
					e.tail.removePredecessor(e.head.index);
					e.tail.addPredecessor(dvt.index);

					dvi = new Vertex(this.graph,SentenceAlignerProperties.getVertexIndex(),'');
					dvi.addPredecessor(dvh.index);
					dvh.addSuccessor(dvi.index);
					dvt.addPredecessor(dvi.index);
					dvi.addSuccessor(dvt.index);
					dvi.linebreak = true;

					dvh.boxWidth = 0;
					dvh.boxHeight = 0;
					dvi.boxWidth = 0;
					dvi.boxHeight = 0;
					dvt.boxWidth = 0;
					dvt.boxHeight = 0;

					dvh.x1Temp = width - 1.5*gap;
					dvh.x2Temp = width - 1.5*gap;
					dvi.x1Temp = width - gap;
					dvi.x2Temp = width - gap;
					dvt.x1Temp = gap;
					dvt.x2Temp = gap;

					dvh.x1 = (e.head.level+1)*width;
					dvh.x2 = (e.head.level+1)*width;
					dvi.x1 = (e.head.level+1)*width;
					dvi.x2 = (e.head.level+1)*width;
					dvt.x1 = (e.head.level+1)*width;
					dvt.x2 = (e.head.level+1)*width;

					var path = [e.head,dvh,dvi,dvt,e.tail];
					dummys[e.tail.index+''] = { h: dvh, t: dvt, i: dvi, path: path };
					paths.push(path);
					this.graph.addVertex(dvh);
					this.graph.addVertex(dvi);
					this.graph.addVertex(dvt);
					dvh.level = e.head.level;
					dvi.level = e.head.level;
					dvt.level = e.tail.level;
					this.layout.push(dvh);
					this.layout.push(dvi);
					this.layout.push(dvt);
				}
				else {
					dvh = dummys[e.tail.index+''].h;
					dvt = dummys[e.tail.index+''].t;
					e.head.removeSuccessor(e.tail.index);
					e.head.addSuccessor(dvh.index);
					e.tail.removePredecessor(e.head.index);
					e.tail.addPredecessor(dvt.index);
					dvh.addPredecessor(e.head.index);
					var path = dummys[e.tail.index+''].path;
					if( Math.abs(e.head.layer) < Math.abs(path[0].layer) ){
						path[0] = e.head;
					}
				}
				for( var j=0; j<this.sentencePaths.length; j++ ){
					for( var k=0; k<this.sentencePaths[j].length-1; k++ ){
						if( this.sentencePaths[j][k] == e.head && this.sentencePaths[j][k+1] == e.tail ){
							this.sentencePaths[j].splice(k+1,0,dvh,dvi,dvt);
							break;
						}
					}
				}
			}
		}
		var sortPaths = function(p1,p2){
			if( p1[1].x1 < p2[1].x1 ){
				return -1;
			}
			if( p1[1].x1 == p2[1].x1 && p1[3].x1-p1[0].x2 < p2[3].x1-p2[0].x2 ){
				return -1;
			}
			return 1;
		}
		paths.sort(sortPaths);
		for( var i=0; i<paths.length; i++ ){
			var path = paths[i];
			var layer = this.getYLayer(path[0].layer,path[4].layer,path[1],path,true);
			path[1].layer = layer;
			path[2].layer = layer;
			path[3].layer = layer;
		}
		for( var i=0; i<this.vertices.length; i++ ){
			this.vertices[i].x1 = this.vertices[i].x1Temp;
			this.vertices[i].x2 = this.vertices[i].x2Temp;
		}
		this.vertices = this.graph.vertices;
	}

	this.visualize = function(div,sid,cwidth){
		var qtips = $('.qtip');
		for( var i=0; i<qtips.length; i++ ){
			$(qtips[i]).remove();
		}
		var gap = 2*curveRadius;
		var sal = this;
		var overlapDir = function(node,south){
			var overlapD = true;
			var k = 0;
			var x1 = node.x1;
			var x2 = node.x2;
			var y1 = node.y1;
			var y2 = node.y2;
			while( overlapD && k < 10 ){
				k++;
				overlapD = false;
				for( var i=0; i<layout.length; i++ ){
					var v = layout[i];
					if( sal.overlap(x1,x2,v.x1,v.x2,y1,y2,v.y1,v.y2) ){
						overlapD = true;
						if( south ){
							y1 += ( v.y2 - v.y1 ) + gap;
							y2 += ( v.y2 - v.y1 ) + gap;
						}
						else {
							y1 -= ( v.y2 - v.y1 ) + gap;
							y2 -= ( v.y2 - v.y1 ) + gap;
						}
					}
				}
			}
			return {
				y1: y1,
				y2: y2
			};
		}
		var layerHeights = [];
		var getY = function(node,s,e){
			var ys = overlapDir(node,true);
			var yn = overlapDir(node,false);
			var c_ys = ( ys.y1 + ys.y2 ) / 2;
			var c_yn = ( yn.y1 + yn.y2 ) / 2;
			var dist = function(x1,x2,y1,y2){
				return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
			}
			var ds = dist(s.x2,node.x1,(s.y1+s.y2)/2,c_ys) + dist(e.x1,node.x2,(e.y1+e.y2)/2,c_ys);
			var dn = dist(s.x2,node.x1,(s.y1+s.y2)/2,c_yn) + dist(e.x1,node.x2,(e.y1+e.y2)/2,c_yn);
			if( ds > dn ){
				return c_yn;
			}
			return c_ys;
		}
		var paths = this.getPaths(sid);
		var widths = [], heights = [];
		$("#"+div).empty();
		var x, y = 1000;
		var on;
		var getMousePosition = function(event) {
			if (!event) {
				event = window.event;
			}
			var body = (window.document.compatMode && window.document.compatMode == "CSS1Compat") ? window.document.documentElement : window.document.body;
			return {
				top : event.pageY ? event.pageY : event.clientY,
				left : event.pageX ? event.pageX : event.clientX
			};
		};
		var dragLock = false, click = true;
		var dragNode = function(evt,node,vertex){
			var startPos = getMousePosition(evt);
			var nodeX1 = vertex.x1;
			var nodeX2 = vertex.x2;
			var nodeY1 = vertex.y1;
			var nodeY2 = vertex.y2;
			var mergeNode = false, rec1, rec2;
			document.onmouseup = function(){
				if(document.selection && document.selection.empty) {
					document.selection.empty();
				}
				else if(window.getSelection){
					var sel = window.getSelection();
					sel.removeAllRanges();
				}
				document.onmousemove = null;
				document.onmouseup = null;
				dragLock = false;
				if( mergeNode ){
					var g_test = sal.graph.clone();
					g_test.mergeVertices(mergeNode,vertex,globalAdjacent);
					if( !g_test.isAcyclic() ){
						alert('Invalid Merge!');
						sal.visualize(div,sid);
						return;
					}
					var newVertex = sal.graph.mergeVertices(mergeNode,vertex,globalAdjacent);
					for( var i=0; i<sal.sentencePaths.length; i++ ){
						var p = sal.sentencePaths[i];
						for( var j=0; j<p.length; j++ ){
							if( p[j] == vertex || p[j] == mergeNode ){
								p[j] = newVertex;
							}
						}
					}
					for( var i=0; i<sal.sentencePaths.length; i++ ){
						var p = sal.sentencePaths[i];
						for( var j=0; j<p.length-1; j++ ){
							if( p[j] == p[j+1] ){
								p.splice(j,1);
								break;
							}
						}
					}
					sal.visualize(div,sid);
				}
			}
			document.onmousemove = function(e){
				var qtips = $('.qtip');
				for( var i=0; i<qtips.length; i++ ){
					$(qtips[i]).hide();
				}
				click = false;
				dragLock = node;
				if(document.selection && document.selection.empty) {
					document.selection.empty();
				}
				else if(window.getSelection){
					var sel = window.getSelection();
					sel.removeAllRanges();
				}
				var pos = getMousePosition(e);
				vertex.x1 = nodeX1+pos.left-startPos.left;
				vertex.x2 = nodeX2+pos.left-startPos.left;
				vertex.y1 = nodeY1+pos.top-startPos.top;
				vertex.y2 = nodeY2+pos.top-startPos.top;
				vertex.textNode.attr({ x: vertex.x1, y: ( vertex.y1 + vertex.y2 )/2 });
				for( var i=0; i<sal.connections.length; i++ ){
					$(sal.connections[i].node).remove();
				}
				sal.drawConnections(node,vertex,r);
				if( mergeNode ){
					$(rec1.node).remove();
					$(rec2.node).remove();
				}
				mergeNode = false;
				var d = 0;
				for( var i=0; i<sal.vertices.length; i++ ){
					var v1 = vertex;
					var v2 = sal.vertices[i];
					if( v1 != v2 && sal.overlap(v1.x1,v1.x2,v2.x1,v2.x2,v1.y1,v1.y2,v2.y1,v2.y2) ){
						var x1 = (v1.x1+v1.x2)/2;
						var x2 = (v2.x1+v2.x2)/2;
						var y1 = (v1.y1+v1.y2)/2;
						var y2 = (v2.y1+v2.y2)/2;
						var dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
						if( !mergeNode || mergeNode && dist < d ){
							mergeNode = v2;
							d = dist;
						}
					}
				}
				if( mergeNode ){
					var color;
					var g_test = sal.graph.clone();
					g_test.mergeVertices(mergeNode,vertex,globalAdjacent);
					g_test.isAcyclic() ? color = "#99E6FF" : color = "#FF8AA7";
					rec1 = r.rect(mergeNode.x1,mergeNode.y1,mergeNode.x2-mergeNode.x1, mergeNode.y2-mergeNode.y1, 5).attr({fill: color, stroke: "none", "fill-opacity": 0.5 });
					rec2 = r.rect(vertex.x1,vertex.y1,vertex.x2-vertex.x1, vertex.y2-vertex.y1, 5).attr({fill: "#99E6FF", stroke: "none", "fill-opacity": 0.5 });
					mergeNode.textNode.toFront();
					vertex.textNode.toFront();
				}
			}
		}
		var createBranch = function(vertex,sourceId){
			var sp = sal.sentencePaths[sourceId];
			var token;
			for( var i=0; i<vertex.sources.length; i++ ){
				if( vertex.sources[i].sourceId == sourceId ){
					token = vertex.sources[i].token;
					vertex.sources.splice(i,1);
					break;
				}
			}
			var v = new Vertex(token,vertex.position);
			v.sources.push({
				sourceId: sourceId,
				token: token
			});
			var id;
			for( var i=0; i<sp.length; i++ ){
				if( vertex == sp[i] ){
					id = i;
				}
			}
			var prev = false, next = false;
			for( var i=0; i<sal.sentencePaths.length; i++ ){
				if( i != sourceId ){
					for( var j=0; j<sal.sentencePaths[i].length; j++ ){
						if( sal.sentencePaths[i][j] == vertex ){
							if( sal.sentencePaths[i][j-1] == sp[id-1] ){
								prev = true;
							}
							if( sal.sentencePaths[i][j+1] == sp[id+1] ){
								next = true;
							}
						}
					}
				}
			}
			if( !prev ){
				sp[id-1].removeSuccessor(vertex);
				vertex.removePredecessor(sp[id-1]);
			}
			if( !next ){
				sp[id+1].removePredecessor(vertex);
				vertex.removeSuccessor(sp[id+1]);
			}
			v.addPredecessor(sp[id-1]);
			sp[id-1].addSuccessor(v);
			v.addSuccessor(sp[id+1]);
			sp[id+1].addPredecessor(v);
			sp[id] = v;
			vertex.count--;
			sal.vertices.push(v);
			sal.visualize(div,sid);
		}
		var setTooltip = function(node,vertex,paper){
			var attachedLinks = false;
			node.connections = [];
			$(node).mouseenter(function(){
				var links = $('.unlink'+vertex.index);
				if( links.length > 0 && !attachedLinks ){
					for( var i=0; i<links.length; i++ ){
						$(links[i]).click(function(){
							createBranch(vertex,$(this).attr('name'));
						});
					}
					attachedLinks = true;
				}
				if( dragLock ){
					return;
				}
				for( var i=0; i<sal.generalConnections.length; i++ ){
					$(sal.generalConnections[i].node).css('display','none');
				}
				for( var i=0; i<sal.sentenceConnections.length; i++ ){
					$(sal.connections[i].node).remove();
				}
				sal.drawConnections(node,vertex,paper);
			});
			$(node).mouseleave(function(){
				if( dragLock ){
					return;
				}
				for( var i=0; i<sal.sentenceConnections.length; i++ ){
					$(sal.sentenceConnections[i].node).remove();
				}
				for( var i=0; i<sal.generalConnections.length; i++ ){
					$(sal.generalConnections[i].node).css('display','block');
				}
			});
			$(node).mousedown(function(evt){
//				dragNode(evt,node,vertex);
			});
			var tiptext = "<table>";
			for( var i=0; i<vertex.sources.length; i++ ){
				tiptext += "<tr>";
				tiptext += "<td style='padding-top:5px;padding-bottom:5px;font-size: 12px;text-align:right;color:"+SentenceAlignerProperties.getColor(sal.sourceIds[vertex.sources[i].sourceId])+";'>"+SentenceAlignerProperties.sources[sal.sourceIds[vertex.sources[i].sourceId]]+"</td>";
				tiptext += "<td style='font-size: 12px;padding-left:10px;color:"+SentenceAlignerProperties.getColor(sal.sourceIds[vertex.sources[i].sourceId])+";'>"+vertex.sources[i].token+"</td>";
				if( vertex.sources.length > 1 ){
					tiptext += "<td style='padding-left:10px;'><div title='Remove token and create new branch!' name="+vertex.sources[i].sourceId+" class='unlink unlink"+vertex.index+"'/></td>";
				}
				tiptext += "</tr>";
			}
			tiptext += "</table>";
		}
		var helperDiv = $('<label/>').appendTo('body');
		var t1 = new Date();
		this.layout = [];
		for( var i=0; i<paths.length; i++ ){
			x = 0;
			var j=0, k=paths[i].length;
			if( i > 0 ){
				j++;
				k--;
				//x = paths[i][0].x2 + gap;
				//y = 100 + i*20;
			}
			var width = 0, height = 0;
			var sizes = [ 12, 17, 23, 30, 38, 47, 57 ];
			for( j; j<k; j++ ){
				var v = paths[i][j];
				var fs = 10 + 2*v.count;
//				var tn = r.text(0, y, v.token).attr({font: fs+"px Droid Sans, Helvetica, sans-serif",fill:"#3E576F","text-anchor":"start","cursor":"move"});
				$(helperDiv).html(v.token);
				$(helperDiv).css("font",fs+"px ApparatusSIL");
				v.x1 = x;
//				var widthN = tn.getBBox().width;
//				var heightN = tn.getBBox().height;
				var widthN = $(helperDiv).width() + 6;
				var heightN = $(helperDiv).height();
				v.boxWidth = widthN;
				v.boxHeight = heightN;
				v.x2 = widthN + x;
				v.y1 = y - heightN/2;
				v.y2 = y + heightN/2;
//				v.textNode = tn;
				width += widthN;
				if( j > 0 ){
					width += gap;
				}
				if( heightN > height ){
					height = heightN;
				}
				this.layout.push(v);
			}
			widths.push(width + 2 * gap);
			heights.push(height);
		}
		$(helperDiv).remove();
		var t3 = new Date();
//console.info((t3.getTime()-t1.getTime())/1000+"s");
		this.setXFlow();
		var r = Raphael(div,cwidth,2000);
		var ch = false, l0gap = 0;
		// verseID
		var vi = r.text(0, 0, 1).attr({font: "24px ApparatusSIL","text-anchor":"end"});
		l0gap += vi.getBBox().width;
		this.layout = [];
		this.layers = [];
		var lh = 0;
		for( var i=0; i<paths[0].length; i++ ){
			this.layout.push(paths[0][i]);
			paths[0][i].layer = 0;
			if( paths[0][i].boxHeight > lh ){
				lh = paths[0][i].boxHeight;
			}
		}
		this.layers.push({
			index: 0,
			height: lh,
			vertices: paths[0]
		});
		this.getYLayer = function(layer0,layerN,v,path,force){
			var destinationS = layerN;
			if( Math.abs(layer0) > Math.abs(layerN) ){
				destinationS = layer0;
			}
			var add = 0;
			var switcher = false;
			if( !force && destinationS == 0 ){
				destinationS = 1;
				switcher = true;
			}
			var destinationE = destinationS;
			do {
				var nospace = false;
				for( var i=0; i<this.layout.length; i++ ){
					if( this.layout[i].layer == destinationE ){
						if( !( this.layout[i].x1 > v.x2 || v.x1 > this.layout[i].x2 ) ){
							if( switcher ){
								add = -1;
								destinationS = 0;
								switcher = false;
							}
							else if( add > 0 ){
								add = add*-1;
							}
							else {
								add = add*-1+1;
							}
							nospace = true;
							break;
						}
					}
				}
				destinationE = destinationS + add;
			}
			while( nospace );
			var layer = undefined;
			for( var i=0; i<this.layers.length; i++ ){
				if( destinationE == this.layers[i].index ){
					layer = this.layers[i];
					break;
				}
			}
			if( typeof layer == "undefined" ){
				layer = {
					index: destinationE,
					height: 0,
					vertices: []
				};
				this.layers.push(layer);
			}
			if( Math.abs(v.y2-v.y1) > layer.height ){
				layer.height = Math.abs(v.y2-v.y1);
			}
			layer.vertices = layer.vertices.concat(path.slice(1,path.length-1));
			return destinationE;
		}
		for( var i=1; i<paths.length; i++ ){
			var path = paths[i];
			var s = path[0];
			var e = path[path.length-1];
			var s1 = path[1];
			var e1 = path[path.length-2];
			var vertex = new Vertex();
			vertex.x1 = s1.x1 - gap;
			vertex.x2 = e1.x2 + gap;
			vertex.y1 = (s.y1 + s.y2)/2 - heights[i]/2;
			vertex.y2 = (s.y1 + s.y2)/2 + heights[i]/2;
			//var y = getY(vertex,path[0],path[path.length-1]);
			var y = this.getYLayer(s.layer,e.layer,vertex,path);
			for( var j=1; j<path.length-1; j++ ){
				/*
				var heightN = path[j].textNode.getBBox().height;
				path[j].textNode.attr({ y: y });
				path[j].y1 = y - heightN / 2;
				path[j].y2 = y + heightN / 2;
				*/
				path[j].layer = y;
				this.layout.push(path[j]);
			}
		}

		this.insertDummys(cwidth,l0gap);

		var ln = this.layers.length;
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			if( v.level > 0 ){
				var oldLayer = this.getLayer(v.layer);
				v.originLayer = oldLayer.index;
//console.info(v,oldLayer);
				for( var j=0; j<oldLayer.vertices.length; j++ ){
					if( oldLayer.vertices[j] == v ){
						oldLayer.vertices.splice(j,1);
						break;
					}
				}
				v.layer += v.level * ln;
				var layer = this.getLayer(v.layer);
				if( !layer ){
					layer = {
						index: v.layer,
						height: 0,
						vertices: []
					};
					this.layers.push(layer);
				}
				if( Math.abs(v.y2-v.y1) > layer.height ){
					layer.height = Math.abs(v.y2-v.y1);
				}
				layer.vertices.push(v);
			}
		}
		var sortLayers = function(l1,l2){
			if( l1.index < l2.index ){
				return -1;
			}
			return 1;
		}
		this.layers.sort(sortLayers);
		this.prepareConnections();
		var y = 1000;
		for( var i=0; i<this.layers.length; i++ ){
			if( this.layers[i].vertices.length == 0 ){
				continue;
			}
			this.horizontalSlots[i].yMin = y+curveRadius;
			this.horizontalSlots[i].yMax = y-curveRadius+this.horizontalSlots[i].height;
			y += this.layers[i].height/2 + this.horizontalSlots[i].height;
			this.layers[i].yLevel = 0+y;
			for( var j=0; j<this.layers[i].vertices.length; j++ ){
				var heightN = this.layers[i].vertices[j].boxHeight;
//				layers[i].vertices[j].textNode.attr({ y: y });
				this.layers[i].vertices[j].y1 = y - heightN / 2;
				this.layers[i].vertices[j].y2 = y + heightN / 2;
//				layers[i].vertices[j].layer = i;
			}
			y += this.layers[i].height/2;
		}
		this.adjustHorizontalConnections();
		this.adjustVerticalConnections();
		this.reinitType3();
		var y_min = 1000000, y_max = 0;
		for( var i=0; i<this.layout.length; i++ ){
			var v = this.layout[i];
			if( v == this.startVertex || v == this.endVertex ){
				continue;
			}
			if( v.y1 < y_min ){
				y_min = v.y1;
			}
			if( v.y2 > y_max ){
				y_max = v.y2;
			}
		}
		y_min -= 3*curveRadius;
		y_max += 3*curveRadius;
		var y_diff = y_min;
		var w = cwidth;
		var h = y_max - y_min;
		this.paper = r;
		for( var i=0; i<this.layout.length; i++ ){
			var v = this.layout[i];
			v.y1 -= y_diff;
			v.y2 -= y_diff;
		}
		for( var i=0; i<this.connections.length; i++ ){
			for( var j=0; j<this.connections[i].links.length; j++ ){
				this.connections[i].links[j].y1 -= y_diff;
				this.connections[i].links[j].y2 -= y_diff;
			}
		}
		r.setSize(w+"px",h+"px");
		r.setSize(w+"px",(y_max-y_min)+"px");
		for( var i=0; i<this.layout.length; i++ ){
			var v = this.layout[i];
			if( v != this.startVertex && v != this.endVertex && v.token != '' ){
				v.rect = r.rect(v.x1+3,v.y1,v.x2-v.x1-6,v.y2-v.y1,5).attr({fill: "#F2F2F2", stroke: "none" });
			}
			v.textNode = r.text(( v.x1 + v.x2 )/2, ( v.y1 + v.y2 )/2, v.token).attr({font: (10 + 2*v.count)+"px ApparatusSIL",fill:"#3E576F","text-anchor":"middle","cursor":"default"});
			setTooltip(v.textNode.node,v,r);
		}
		//var on = r.text(w/2, h-20,'').attr({font: "16px Droid Sans, Helvetica, sans-serif"}).attr({color:"#3E576F",fill:"#3E576F","text-anchor":"middle"});
//		this.generalConnections();
//		this.drawConnectionsNew();
		this.drawAllConnections();
		r.circle(this.startVertex.x1,this.startVertex.y1,4).attr({ fill: '#3E576F' });
		r.rect(this.endVertex.x1,this.endVertex.y1-4,8,8).attr({ fill: '#3E576F' });
		var t2 = new Date();
//		console.info((t2.getTime()-t1.getTime())/1000+"s for visualization");
		if( ch ){
			ch.attr({ y: (this.startVertex.y2+this.startVertex.y1)/2 });
		}
		vi.attr({ x: this.vertices[0].x1 - 20, y: (this.startVertex.y2+this.startVertex.y1)/2 });
	}

	this.printVertices = function(){
		for( var i=0; i<this.vertices.length; i++ ){
			var v = this.vertices[i];
			for( var j=0; j<v.successors.length; j++ ){
				console.info(v.id+" ---> "+v.successors[j].id,v.token+" ---> "+v.successors[j].token);
//				console.info(v.token+" ---> "+v.successors[j].token);
			}
			/*
			for( var j=0; j<v.predecessors.length; j++ ){
				console.info(v.predecessors[j].token+" ---> "+v.token);
			}
			*/
			console.info("--------------------------------------------------");
		}
	}

};

