// Library for extracting brief, simple data from Stepmania files. For Chronomia.

function startSwitch(string, options){
    for (i = 0; i < options.length; i++) {
        if (string.startsWith(options[i])) {
            return options[i]
        }
    }
};

const types = [
    "#SUBTITLE:",
    "#ARTIST:",
    "#OFFSET:",
    "#TITLE:",
    "#BPMS:"
];

function importSM(smfile, options) {
    /*
        Converts a read SM file (string) into the standard format for Chronomia.

        Options includes a variety of booleans being:
               convertBaseBPM - True
            convertBPMChanges - True
                 convertNotes - False
                 convertTitle - True
                convertArtist - False
    */

    var file = smfile.split(";")//'(\r\n|\r|\n)');
    
    //console.log(file[1])

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

    //console.log("LENGTH")

    //console.log(file.length)

    for (var i = 0; i < file.length; i++) {
        //console.log(i + "/" + file.length + ": " + file[i].trim())

        file[i] = file[i].trim()

        switch(startSwitch(file[i].trim(), types)){

            // Subtitle
            case types[0]:
                song.subtitle = file[i].substring(types[0].length, file[i].length).trim();
                break;

            // Artist
            case types[1]:
                song.artist = file[i].substring(types[1].length, file[i].length).trim();
                break;

            // Offset
            case types[2]:
                song.offset = parseFloat(file[i].substring(types[2].length, file[i].length).trim());
                break;

            // Title
            case types[3]:
                if (options.meta.title){
                    song.name = file[i].substring(types[3].length, file[i].length).trim();
                }
                break;

            // BPMs
            case types[4]:

                // hoo boy fuck this code it's going to be shit

                //console.log("BPMS:")
                //console.log(file[i].substring(types[4].length + 1, file[i].length - 1))

                var BPMarray = file[i].substring(types[4].length + 1, file[i].length - 1).split(",");

                // convert bpm into array of objects

                for (x=0; x < BPMarray.length; x++) {
                    //console.log(BPMarray[x])
                    var currentBPM = BPMarray[x].split("=")
                    //console.log(currentBPM)
                    BPMarray[x] = {
                        beat:parseFloat(currentBPM[0].trim()),
                        bpm:parseFloat(currentBPM[1].trim())
                    }
                };

                // time to iterate over them and add absolute timestamps to them

                var runningBPM = 60; // This is our current BPM.
                var runningTime = 0; // This is our current time.
                var runningBeat = 0; // this is our current beat.

                for (x=0; x < BPMarray.length; x++) {

                    // Add the amount of beats since last BPM change to our clock, in actual time.
                    // current time + currentbpm * beats that have passed since the last check.

                    runningTime = runningTime + ((60/runningBPM) * (BPMarray[x].beat - runningBeat));

                    runningBPM = BPMarray[x].bpm;

                    runningBeat = BPMarray[x].beat;

                    BPMarray[x].absolute = runningTime;

                    console.log("BPM Change at: " + BPMarray[x].absolute + "s / Beat number: " + runningBeat + " - New BPM: " + BPMarray[x].bpm)
                };

                song.bpmChanges = BPMarray;

                song.bpm = BPMarray[0];

                break;
        }
    }

    console.log(song)

    //console.log("AS OF EXIT: " + song.name)

    return song
}

//console.log("imported")

//console.log(importSM)