// converter for converting to SRTB, the lil json abomination it is.

const template = {
    data: JSON.parse(`{
        "revisionVersion": 0,
        "compatibilityVersion": 0,
        "previewLoopBars": {
            "min": 4,
            "max": 12
        },
        "goBeatOffsetFromFirstNote": -4,
        "scoreMedalThresholds": [],
        "difficultyType": 4,
        "meshTrails": [],
        "initialWheelAngle": 0,
        "isTutorial": false,
        "isCalibration": false,
        "tutorialTitleTranslation": {
            "key": ""
        },
        "clipInfoAssetReferences": [
            {
                "bundle": "CUSTOM",
                "assetName": "ClipInfo_0"
            }
        ],
        "background": {
            "bundle": "background_custom01",
            "assetName": "CustomsBG"
        },
        "tutorialObjects": [],
        "tutorialTexts": [],
        "clipData": [
            {
                "clipIndex": 0,
                "startBar": 0,
                "endBar": 23,
                "transitionIn": 0,
                "transitionInValue": 0,
                "transitionInOffset": 0,
                "transitionOut": 0,
                "transitionOutValue": 0,
                "transitionOutOffset": 0
            }
        ],
        "notes": [],
        "events": [],
        "rewindSections": [],
        "lastEditedOnDate": "",
        "noteStats": {
            "matchNotes": 0,
            "tapNotes": 0,
            "beatNotes": 0,
            "beatHoldWeights": 0,
            "spinNotes": 0,
            "holdNotes": 0,
            "matchPerMin": 0,
            "tapPerMin": 0,
            "beatsPerMin": 0,
            "beatHoldsPerMin": 0,
            "spinPerMin": 0,
            "holdPerMin": 0,
            "maxPossibleScore": 0
        }
    }`),

    clip: JSON.parse(`{
        "timeSignatureMarkers": [
            {
                "startingBeat": 0,
                "ticksPerBar": 4,
                "tickDivisor": 4,
                "beatLengthType": 0,
                "beatLengthDotted": 0
            },
            {
                "startingBeat": 4,
                "ticksPerBar": 4,
                "tickDivisor": 4,
                "beatLengthType": 0,
                "beatLengthDotted": 0
            }
        ],
        "bpmMarkers": [
            {
                "beatLength": 1,
                "clipTime": 0,
                "type": 0
            }
        ],
        "cuePoints": [
        ],
        "clipAssetReference": {
            "bundle": "music_getgood",
            "assetName": "Custom Tutorial (Get Good)"
        }
    }`),

    info: JSON.parse(`{
        "trackOrder": 0,
        "trackId": 0,
        "albumArtReference": {
            "bundle": "",
            "assetName": ""
        },
        "artistName": "",
        "featArtists": "",
        "title": "Custom",
        "subtitle": "",
        "trackLabel": "",
        "charter": "Lavenfurr",
        "spotifyLink": "",
        "appleMusicLink": "",
        "countdownOffset": 1,
        "difficultyRating": 0,
        "difficultyRatings": [],
        "tourTrackDataTestGroupOverrides": [],
        "difficulties": [
            {
                "bundle": "CUSTOM",
                "assetName": "TrackData_0",
                "_difficulty": 4,
                "_compatibilityVersion": 0
            }
        ],
        "difficultyTutorialMechanics": [],
        "platformFilter": -1,
        "trackType": 1,
        "isReleasable": true,
        "unlockAtLevel": 0
    }`),

    container: JSON.parse(`{
        "unityObjectValuesContainer": {
            "values": [
                {
                    "key": "TrackInfo",
                    "jsonKey": "SO_TrackInfo_TrackInfo",
                    "fullType": "TrackInfo"
                },
                {
                    "key": "TrackData_0",
                    "jsonKey": "SO_TrackData_TrackData_0",
                    "fullType": "TrackData"
                },
                {
                    "key": "ClipInfo_0",
                    "jsonKey": "SO_ClipInfo_ClipInfo_0",
                    "fullType": "ClipInfo"
                }
            ]
        },
        "largeStringValuesContainer": {
            "values": [
                {
                    "key": "SO_TrackInfo_TrackInfo",
                    "val": "",
                    "loadedGenerationId": 1
                },
                {
                    "key": "SO_TrackData_TrackData_0",
                    "val": "",
                    "loadedGenerationId": 1
                },
                {
                    "key": "SO_ClipInfo_ClipInfo_0",
                    "val": "",
                    "loadedGenerationId": 1
                }
            ]
        },
        "clipInfoCount": 1
    }`)
};

function toSRTB(song, options) {
    var objects = {
        clip: template.clip,
        info: template.info,
        data: template.data
    };

    // Handle metadata first. This is simple so might as well.

    objects.info.title = song.name || "CHRN-NoID"

    //console.log(song.name)
    //console.log("FINAL NAME: " + objects.info.title)

    if (options.meta.subtitle) {
        // attempt with fallback
        objects.info.subtitle = song.subtitle || ""
    }

    if (options.meta.artist) {
        // attempt with fallback
        objects.info.artistName = song.artist || "Chronomia Converter"
    } else {
        // fallback immediately
        objects.info.artistName = "Chronomia Converter"
    }

    objects.info.featArtists = "https://lavenderthegreat.github.io/chronomia/"

    // BPMs are pretty easy too, we got all the hard stuff out of the way on the base conversion stage.

    //console.log("Attempting to write bpms...")

    for (var i = 0; i < song.bpmChanges.length; i++) {
        objects.clip.bpmMarkers[i] = {
            beatLength: 60/song.bpmChanges[i].bpm,
            clipTime: song.bpmChanges[i].absolute,
            type: 0
        }

        if (options.bpm.offset){
            objects.clip.bpmMarkers[i].clip -= song.offset 
        }

        // end it early if they only want base bpm
        if (!options.bpm.changes) {
            i = song.bpmChanges.length
        }
    }

    // And now cues.

    for (var i = 0; i < song.cues.length; i++) {
        objects.clip.cuePoints[i] = {
            name: song.cues[i].name,
            time: song.cues[i].absolute
        }
    }

    // And now compile.

    var result = template.container

    result.largeStringValuesContainer.values[0].val = JSON.stringify(objects.info)
    result.largeStringValuesContainer.values[1].val = JSON.stringify(objects.data)
    result.largeStringValuesContainer.values[2].val = JSON.stringify(objects.clip)

    return JSON.stringify(result)
}