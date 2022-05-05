import React from "react";
import Container from '@mui/material/Container';
import Paper from "@mui/material/Paper";
import {Divider, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {DataGrid} from "@mui/x-data-grid";
import './SentenceAligner'
import './VarianceGraph.css'
import './lib/jquery/jquery.min'
import './lib/qtip/jquery.qtip-1.0.0-rc3.min'

//based on this : https://www.semanticscholar.org/paper/Improving-the-Layout-for-Text-Variant-Graphs-Jänicke-Büchler/5feab104eea47abb20821e1d029476c4e3ed6d52
// and the code of this website: http://www.informatik.uni-leipzig.de:8080/HolyBible/

var VarianceGraph = new function() {
	var prefix = "";///tpp/req?url=http://localhost:8983";

	var numberOfVerses = 5;
	var startId = 1;

	this.versionIndex = 0;
    this.sourceIds = [ "0", "1", "2", "3", "4", "5", "6" ];
	this.sources = [ "0", "1", "2", "3", "4", "5", "6"  ];
	this.colors = [ "red", "blue", "green", "rgb(230,230,0)", "orange", "brown", "purple" ];
	this.versions = [ true, true, true, true, true, true, true ];

	this.initialize = function() {

		this.container = $('<div class="container"/>').appendTo($('#container')[0]);
		var biblePos = $("<table class='biblePos'></table>").appendTo(this.container);

		this.verseData = $("<div class='header'></div>").appendTo(this.container);
		$(this.verseData).css('height', '20px');

		this.from = $("<div></div>").appendTo(this.verseData);
		$(this.from).css('position', 'absolute');
		$(this.from).css('left', '100px');

		this.to = $("<div></div>").appendTo(this.verseData);
		$(this.to).css('position', 'absolute');
		$(this.to).css('right', '150px');

		this.book = $("<span></span>").appendTo(this.from);
		this.chapter = $("<span></span>").appendTo(this.from);
		this.verse = $("<span></span>").appendTo(this.from);

		this.book2 = $("<span></span>").appendTo(this.to);
		this.chapter2 = $("<span></span>").appendTo(this.to);
		this.verse2 = $("<span></span>").appendTo(this.to);

		this.alignment = $("<div style='text-align:center;overflow-y:auto;'></div>").appendTo(this.container);
	}


	this.loadCounterfactuals = function(){
		var verses = [];
		$(this.alignment).empty();
		var width = $(this.alignment).width();
		var visHeight = 0;

		for( var i=id; i<id+1; i++ ){
			// var data = getJson(prefix+"/solr/select/?wt=json&indent=on&q=verseid:"+i).response.docs;
			if( data.length == 0 ){
				break;
			}
			var list = ["I have made a mistake", "I maybe have made a mistake", "I have not made a mistake", "I have made a cake"];
			var sids = [0,1,2,3];
			var vi = 0;
			/*for( var j=0; j<data.length; j++ ){
				if( this.versions[j] ){
					list.push(data[j].line);
					sids.push(j);
					if( this.versionIndex > j ){
						vi++;
					}
				}
			}*/
			var alignmentViz = $("<div id='alignment"+i+"' style='display:block;'></div>").appendTo(this.alignment);
			$(alignmentViz).css('width',(width-184)+'px');
			$(alignmentViz).css('padding-right','100px');
			$(alignmentViz).css('padding-left','84px');
			var aligner = new SentenceAligner();
			aligner.alignSentences(list,sids);
			aligner.visualize("alignment"+i,vi,width-184);
			visHeight += $(alignmentViz).height();
			verses.push(data);
			startId++;
		}

		$('#bibleBg').css('height',(visHeight+230)+'px');

	}

}

const VarianceGraphBox = () => {
	return(
		<html>

		</html>
	)
	/*return (
		<Container fixed>
            	<Paper elevation={3} sx={{p: 2}}>
					<Typography variant="h4"> <strong>Step 3: </strong> take a look at the existing counterfactuals </Typography>
					<Divider />
					<Box sx={{ my: 3, mx: 2 }}>
						<div style={{ height: 400, width: '100%' }}>
						<script type="text/javascript">
							VarianceGraph.initialize();
						</script>
						</div>
					</Box>
            	</Paper>
        	</Container>)*/
}

export default VarianceGraphBox