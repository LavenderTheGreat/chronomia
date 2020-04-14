
function importChart(chartFile, options) {
    /*
        Converts a read CHART file (string) into the standard format for Chronomia.
    */

    var lines = chartFile.split(/\r|\n|\r\n/);
    var song = {
        name: "CHRN-" + Date.now(),
        subtitle: "",
        artist: "",
        bpm: 60,
        offset: 0,
        bpmChanges: [],
        notes: [],
        cues: []
    };

    var context = null;
    var ticksPerBeat = 480;
    var events = [];

    lines.forEach(function (line) {
        line = line.trim();
        var match;

        if (context == null) {
            // e.g. [Song]
            match = line.match(/^\[(.*)\]$/);
            if (match != null) {
                context = match[1];
            }

        } else if (line === "}") {
            context = null;

        } else if (context === "Song") {
            // e.g. Name = "Through the Fire and Flames"
            match = line.match(/^(\w+)\s*=\s*"?([^"]*)"?$/);

            if (match != null) {
                var key = match[1];
                var value = match[2];

                switch (key) {
                    case "Name":
                        song.name = value;
                        break;
                    case "Artist":
                        song.artist = value;
                        break;
                    case "Resolution":
                        ticksPerBeat = parseFloat(value.trim());
                        break;
                    case "Offset":
                        // Is this in seconds or milliseconds? I couldn't find a chart that actually
                        // had this set to something other than 0.
                        song.offset = parseFloat(value.trim());
                        break;
                }
            }

        } else if (context === "SyncTrack") {
            // e.g. 768 = B 156000
            // (at tick 768, set BPM to 156.000)
            match = line.match(/^(\d+)\s*=\s*B\s*(\d+)\s*$/);

            if (match != null) {
                var tick = parseFloat(match[1]);
                var bpm = parseFloat(match[2]) / 1000;

                if (tick === 0) {
                    song.bpm = bpm;
                }
                var bpmChange = {
                    beat: tick / ticksPerBeat,
                    bpm: bpm
                };
                song.bpmChanges.push(bpmChange);
                events.push({type: "bpmChange", object: bpmChange});
            }

            // We also have time signature lines:
            // e.g. 768 = TS 4 (at tick 768, set time signature to 4/4)

        } else if (context === "Events") {
            // e.g. 34380 = E "section Chorus 1"
            // (at tick 768, new section called Chorus 1)
            match = line.match(/^(\d+)\s*=\s*E\s*"section\s*(.*)\s*"$/);

            if (match != null) {
                var tick = parseFloat(match[1]);
                var name = match[2];

                if (match != null) {
                    var cue = {
                        beat: tick / ticksPerBeat,
                        name: name
                    };
                    song.cues.push(cue);
                    events.push({type: "cue", object: cue});
                }
            }
        }
    });

    // Add absolute times to BPM changes and cues.
    events.sort(function (a, b) {
        return a.object.beat - b.object.beat;
    });

    console.log(events);

    var runningBPM = song.bpm; // This is our current BPM, as of the last BPM change.
    var runningTime = song.offset; // This is our current time, as of the last BPM change.
    var runningBeat = 0; // this is our current beat, as of the last BPM change.

    events.forEach(function (event) {
        if (event.type === "bpmChange") {
            // Add the amount of beats since last BPM change to our clock, in actual time.
            // current time + current seconds per beat * beats that have passed since the last check.
            runningTime = runningTime + ((60/runningBPM) * (event.object.beat - runningBeat));
            runningBPM = event.object.bpm;
            runningBeat = event.object.beat;
            event.object.absolute = runningTime;
        } else if (event.type === "cue") {
            event.object.absolute = runningTime + ((60/runningBPM) * (event.object.beat - runningBeat));
        }
    });

    console.log(song);
    return song;
}
