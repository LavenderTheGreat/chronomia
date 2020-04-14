// https://stackoverflow.com/questions/47164675/convert-float-to-32bit-hex-string-in-javascript

function endSwitch(string, options){
    for (i = 0; i < options.length; i++) {
        if (string.endsWith(options[i])) {
            return options[i]
        }
    }
};

function checkboxValue(id){
	return (document.getElementById(id).checked == true)
}

function getOptions(){
	return {
		bpm: {
			base: checkboxValue("bpm_base"), // used in export
			changes: checkboxValue("bpm_changes"), // used in export
			offset: checkboxValue("bpm_offset") // used in export
		},
		cue: {
			osu:{
				bookmark: checkboxValue("cue_osu_bookmark"), // used in import
				break: checkboxValue("cue_osu_break") // used in import
			} 
		},
		note: {
			base: checkboxValue("notes_base"), // used in export
			ksm: {
				fxL: checkboxValue("notes_ksm_fx_l"), // used in import
				fxR: checkboxValue("notes_ksm_fx_r"), // used in import
				volL: checkboxValue("notes_ksm_vol_l"), // used in import
				volR: checkboxValue("notes_ksm_vol_r"), // used in import
			},
			osu: {
				slider: checkboxValue("notes_osu_slider") // used in import
			},
			bms: {
				scratch: checkboxValue("notes_bms_scratch") // used in import
			}
		},
		meta: {
			title: checkboxValue("meta_title"), // used in import
			artist: checkboxValue("meta_artist"), // used in export
			subtitle: checkboxValue("meta_subtitle") // used in export
		}
	}
}

function convertFile(filename, file, options){
	
	var songFile = {}

	switch(endSwitch(filename, ['.osu', '.ksm', '.bms', '.sm', '.chart'])){ // check file type, use that parser.

		case '.sm':
			console.log("IS SM")
			songFile = importSM(file, options);
			break;

		case '.chart':
			console.log("IS CHART");
			songFile = importChart(file, options);
			break;
	}

	return songFile
}

// Generate file

function _generate(file){

	// set up file options
	
	var options = getOptions()

	// funnel through parsers

	var songFile = convertFile(document.getElementById('input').files[0].name.trim(), file.target.result, options)

	console.log(songFile)

	var blob = new Blob([toSRTB(songFile, options)], {type: "text/plain;charset=utf-8"})
	saveAs(blob, songFile.name + ".srtb");
}

// Run file generation on button hit.

function output(){
	var file = document.getElementById("input").files[0]
	var reader = new FileReader()
	reader.onload = _generate
	reader.readAsText(file)
}

// Generate preview

function _updatePreview(file){

	// set up file options
	
	var options = getOptions()

	// funnel through parsers

	var songFile = convertFile(document.getElementById('input').files[0].name.trim(), file.target.result, options)

	console.log(songFile)

	// now to update the fields

	document.getElementById('currentTitle').innerHTML = songFile.name
	document.getElementById('currentSubtitle').innerHTML = songFile.subtitle
	document.getElementById('currentArtist').innerHTML = songFile.artist
	document.getElementById('currentOffset').innerHTML = songFile.offset + "s"

	var BPMOutput = ""

	for (var i = 0; i < songFile.bpmChanges.length; i++) {
		if (songFile.bpmChanges[i].bpm < 0) {
			document.getElementById('currentWarnings').innerHTML = document.getElementById('currentWarnings').innerHTML + '<b>Negative BPMS will cause errors!</b> Negative BPM: Beat #' + songFile.bpmChanges[i].beat + " (" + songFile.bpmChanges[i].absolute + "s) - " + songFile.bpmChanges[i].bpm + "bpm" + '<br><br>'
		}
		BPMOutput = BPMOutput + 'Beat #' + songFile.bpmChanges[i].beat + " (" + songFile.bpmChanges[i].absolute + "s) - " + songFile.bpmChanges[i].bpm + "bpm" + '<br>'
	}

	document.getElementById('currentBPMs').innerHTML = BPMOutput

	var cueOutput = ""

	for (var i = 0; i < songFile.cues.length; i++) {
		cueOutput = cueOutput + songFile.cues[i].name + " - " + songFile.cues[i].absolute + "s" + '<br>'
	}

	document.getElementById('currentCues').innerHTML = cueOutput

}

// Run preview generation on file change

function fileChange(){
	var file = document.getElementById("input").files[0]
	var reader = new FileReader()
	reader.onload = _updatePreview
	reader.readAsText(file)
}
