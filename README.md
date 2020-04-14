# Chronomia
### A timing conversion tool for Spin Rhythm XD.
Chronomia is a tool to convert BPM layouts and other tools from Osu!, Clone Hero, Be-Music Source, K-Shoot Mania and Stepmania into SRTB files for use with Spin Rhythm.

## Features

### Osu!

#### Core

- [ ] BPM conversion

#### Cue points

- [ ] Editor bookmarks to cue points
- [ ] Break points to cue points

#### Notes

- [ ] Hit objects to tap notes

##### Standard exclusive

- [ ] Sliders to match streams
- [ ] Sliders to Spin Rhythm sliders

#### Metadata

- [ ] Title to Song Name
- [ ] Artist to Artist
- [ ] Source to Subtitle

### Be-Music Source / BME / PMS

#### Core

- [ ] BPM conversion

#### Notes

- [ ] Hit objects to tap notes

#### Metadata

- [ ] TITLE to Song Name
- [ ] ARTIST to Artist
- [ ] GENRE to Subtitle

### K-Shoot Mania

#### Core

- [ ] BPM conversion

#### Notes

- [ ] FX-L to beats (On expert)
- [ ] FX-R to beats (On XD)
- [ ] VOL-L to slides (On expert)
- [ ] VOL-R to slides (On XD)

#### Metadata

- [ ] TITLE to Song Name
- [ ] ARTIST to Artist
- [ ] ILLUS to Subtitle

### Stepmania

#### Core

- [x] BPM conversion

#### Notes

- [ ] Notes to matches

#### Metadata

- [x] TITLE to Song Name
- [x] ARTIST to Artist
- [x] SUBTITLE to Subtitle


### Clone Hero (Chart)

#### Core

- [x] BPM conversion

#### Notes

- [ ] Notes to matches

#### Metadata

- [x] Song Name
- [x] Artist

# Contributing

If you have knowledge of a common rhythm game format, contribute! We recommend looking at the current importers for what the format expected from an importer is. You can see these in the SM and Chart implementations.

## The basic structure

All files should have a clearly named import function ie ``importSM`` or ``importChart``, these functions are expected to take in an options table and the actual file data.

File data is a string containing the raw file passed in.

Options is an object formatted like the following: (Import/Export specifies when the variable is used, you probably don't need to worry about export options.)

```js

{
  bpm: {
    base: boolean, // Whether to output a base BPM, export
    changes: boolean, // Whether to output BPM changes, export
    offset: boolean // Whether to output chart offset, export
  }
  cue: {
    osu: {
      bookmark: boolean, // Whether to use osu editor bookmarks as cues, import
      break: boolean // Whether to use map break times as cues, import
    }
  }
  note: {
    base: boolean, // Whether to attempt to place notes in the converts. Import.
    ksm: {
      fxL: boolean, // Whether to place FX-L notes. Import.
      fxR: boolean, // Whether to place FX-R notes. Import.
      volL: boolean, // Whether to place Vol-L lasers. Import.
      volR: boolean // Whether to place Vol-R lasers. Import.
    },
    osu: {
      slider: boolean, // Whether to place Osu sliders. Import.
    },
    bms: {
      scratch: boolean, // Whether to place IIDX scratch notes. Import.
    }
  }
  meta: {
    title: boolean, // Whether to use the song title in the meta. Import.
    subtitle: boolean, // Whether to use the song subtitle in the meta. Export.
    artist: boolean // Whether to use the artist in the meta. Export.
  }
}
```

You should then process the file according to the options and return an object with the format:

```js
{
    name: string, // Meta name
    subtitle: string, // Meta subtitle
    artist: string, // Meta artist
    bpm: number, // Base bpm to use for when changes are off
    offset: number, // Number to globally offset bpm changes by
    bpmChanges: [ // Array of BPM changes
      {
        beat: number, // Time in beats the BPM change occurs at.
        bpm: number, // The BPM it changes to.
        absolute: number // The time in seconds the BPM change occurs at.
      }
    ],
    notes:[ // Array of notes, yet to be defined in format.
      
    ],
    cues:[ // Array of cues/bookmarks/labels
      {
        name: string, // Name associated with it
        time: number // Absolute time it occurs
      }
    ]
}```

You can then add your converter to the case list at https://github.com/LavenderTheGreat/chronomia/blob/master/index.js#L55 and the appropriate function to load below.

Then add your script to the head of https://github.com/LavenderTheGreat/chronomia/blob/master/index.html around the rest of the converters and submit your PR.

An example of a good PR can be found at the .chart PR: https://github.com/LavenderTheGreat/chronomia/pull/1
