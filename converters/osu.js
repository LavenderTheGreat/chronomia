// Osu converter for Chronomia.

// Library for extracting brief, simple data from Stepmania files. For Chronomia.

function startSwitch(string, options){
    for (i = 0; i < options.length; i++) {
        if (string.startsWith(options[i])) {
            return options[i]
        }
    }
};

// Modes based on the header encountered on each line.

// Numbers indicate the parsing method, if 0, it parses by Key:Value, if 1, it parses by CSV standards

const modeType = {
    general: 0,
    editor: 0,
    metadata: 0,
    difficulty: 0,
    events: 1,
    timingpoints: 1,
    colours: 0,
    hitobjects: 1
};

function importOsu(osufile, options) {
    /*
        Converts a read Osu file (string) into the standard format for Chronomia.
    */

    var file = osufile.split(/\r|\n|\r\n/);

    var song = {
        name:"CHRN-" + Date.now(),
        subtitle:"",
        artist:"",
        bpm:60,
        offset:0,
        bpmChanges:[],
        notes:[],
        cues:[]
    };

    var songOsu = {
        general: {},
        editor: {},
        metadata: {},
        difficulty: {},
        events: [],
        timingpoints: [],
        colours: {},
        hitobjects: []
    }


    // time to parse the data

    var mode = 'none'

    for (var i = 0; i < file.length; i++) {

        // trim
        file[i] = file[i].trim()
        
        // check if empty line so we can skip them
        if (file[i] !== "") {

            // check if header
            if (file[i].startsWith("[") && file[i].endsWith("]")) {
                mode = file[i].substring(1, file[i].length-1).toLowerCase()

            } else if (mode !== "none") {

                // Gotta check if we're actually in a mode too.

                // it's not a header so we should parse like a normal value

                switch (modeType[mode]){

                    // if 0 it's key value
                    case 0:
                        var keyValue = file[i].split(/:(.+)/)
                        songOsu[mode][keyValue[0]] = keyValue[1]
                        break;

                    // if 1 it's CSV
                    case 1:
                        songOsu[mode].push(file[i].split(","))
                        break;

                }
            }
        }
    }

    // assign everything now

    if (options.meta.title && songOsu.metadata.Title){
        song.name = songOsu.metadata.Title
    }

    song.subtitle = songOsu.metadata.Source ? songOsu.metadata.Source : ""
    song.artist = songOsu.metadata.Artist ? songOsu.metadata.Artist : ""

    // Parse BPMs

    // convert bpm into array of objects

    var BPMs = []

    for (var x = 0; x < songOsu.timingpoints.length; x++) {
        


        // check bpm inheritance
        if (!songOsu.timingpoints[x][6] || songOsu.timingpoints[x][6] == "1") {
            BPMs.push( {
                absolute: parseFloat(songOsu.timingpoints[x][0].trim()) / 1000,
                bpm: 60 / (parseFloat(songOsu.timingpoints[x][1].trim()) / 1000)
            } )
        }
    };

    // time to iterate over them and add beat timestamps to them

    var runningBPM = 60; // This is our current BPM.
    var runningTime = 0; // This is our current time.
    var runningBeat = 0; // this is our current beat.

    for (var x = 0; x < BPMs.length; x++) {

        // Add the amount of beats since last BPM change to our clock, in actual time.
        // current time + currentbpm * beats that have passed since the last check.

        var diffTime = BPMs[x].bpm - runningTime

        runningTime = BPMs[x].absolute

        runningBPM = BPMs[x].bpm

        if (x !== 0) {
            // marker 0 is ALWAYS beat 0
            runningBeat = runningBeat + (diffTime / (60/BPMs[x].bpm)); // add the amount of beats passed since last stop 
        }

        BPMs[x].beat = runningBeat;

        console.log("BPM Change at: " + runningTime + "s / Beat number: " + runningBeat + " - New BPM: " + runningBPM)
    };

    // Add editor bookmark cues
    if (options.cue.osu.bookmark && songOsu.editor.Bookmarks) {
        var bookmarks = songOsu.editor.Bookmarks.split(",")
        for (var x = 0; x < bookmarks.length; x++) {
            song.cues.push({name:"Editor Bookmark", absolute:parseFloat(bookmarks[x].trim()) / 1000})
        }
    }

    // Add break cues
    if (options.cue.osu.break && songOsu.events) {
        for (var x = 0; x < songOsu.events.length; x++) {
            if (songOsu.events[x][0] == "2" || songOsu.events[x][0] == "Break") {
                song.cues.push({name:"Break: Start", absolute:parseFloat(songOsu.events[x][1].trim()) / 1000})
                song.cues.push({name:"Break: End", absolute:parseFloat(songOsu.events[x][2].trim()) / 1000})
            }
        }
    }

    song.bpmChanges = BPMs;

    song.bpm = BPMs[0];

    console.log(songOsu)

    return song
}