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

	switch(endSwitch(filename, ['.osu', '.ksm', '.bms', '.sm'])){ // check file type, use that parser.

		case '.sm':
			console.log("IS SM")
			songFile = importSM(file, options);
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

function output(){
	var file = document.getElementById("input").files[0]
	var reader = new FileReader()
	reader.onload = _generate
	reader.readAsText(file)
}