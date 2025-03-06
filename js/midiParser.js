export class MIDIParser {
    static parse(arrayBuffer) {
        const midiArray = new Uint8Array(arrayBuffer);
        let pointer = 0;

        if (!this.validateHeader(midiArray)) {
            throw new Error('Invalid MIDI file header');
        }

        pointer += 8;
        pointer += 6; // Skip format type, track count, and time division

        return this.parseTracks(midiArray, pointer);
    }

    static validateHeader(midiArray) {
        return String.fromCharCode(...midiArray.slice(0, 4)) === 'MThd';
    }

    static parseTracks(midiArray, startPointer) {
        const tracks = [];
        let pointer = startPointer;

        while (pointer < midiArray.length) {
            if (!this.validateTrackHeader(midiArray, pointer)) {
                throw new Error('Invalid MIDI track header');
            }

            pointer += 4;
            const trackLength = this.read32BitValue(midiArray, pointer);
            pointer += 4;

            const trackEnd = pointer + trackLength;
            const events = this.parseTrackEvents(midiArray, pointer, trackEnd);
            tracks.push(events);
            pointer = trackEnd;
        }

        return tracks;
    }

    static validateTrackHeader(midiArray, pointer) {
        return String.fromCharCode(...midiArray.slice(pointer, pointer + 4)) === 'MTrk';
    }

    static read32BitValue(midiArray, pointer) {
        return (
            (midiArray[pointer++] << 24) |
            (midiArray[pointer++] << 16) |
            (midiArray[pointer++] << 8) |
            midiArray[pointer++]
        ) >>> 0;
    }

    static parseTrackEvents(midiArray, startPointer, endPointer) {
        const events = [];
        let pointer = startPointer;
        let time = 0;
        let lastEventType = null;

        while (pointer < endPointer) {
            const { deltaTime, newPointer } = this.readVariableLengthValue(midiArray, pointer);
            pointer = newPointer;
            time += deltaTime;

            const eventType = midiArray[pointer++];
            if (eventType === 0xFF) {
                pointer = this.skipMetaEvent(midiArray, pointer);
            } else if (eventType === 0xF0 || eventType === 0xF7) {
                pointer = this.skipSysexEvent(midiArray, pointer);
            } else {
                const event = this.parseMidiEvent(midiArray, pointer, eventType, lastEventType);
                if (event) {
                    events.push({ ...event, time });
                }
                pointer = event.newPointer;
                lastEventType = event.eventType;
            }
        }

        return events;
    }

    static readVariableLengthValue(midiArray, pointer) {
        let value = 0;
        let byte;
        do {
            byte = midiArray[pointer++];
            value = (value << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        return { deltaTime: value, newPointer: pointer };
    }

    static skipMetaEvent(midiArray, pointer) {
        const metaType = midiArray[pointer++];
        const { newPointer } = this.readVariableLengthValue(midiArray, pointer);
        return newPointer + (midiArray[newPointer - 1] & 0x7F);
    }

    static skipSysexEvent(midiArray, pointer) {
        const { newPointer } = this.readVariableLengthValue(midiArray, pointer);
        return newPointer + (midiArray[newPointer - 1] & 0x7F);
    }

    static parseMidiEvent(midiArray, pointer, eventType, lastEventType) {
        if (eventType < 0x80) {
            pointer--;
            eventType = lastEventType;
        }

        const eventTypeHigh = eventType & 0xF0;
        if (eventTypeHigh === 0x90 || eventTypeHigh === 0x80) {
            const note = midiArray[pointer++];
            const velocity = midiArray[pointer++];
            if (eventTypeHigh === 0x90 && velocity > 0) {
                return { eventType, note, velocity, newPointer: pointer };
            }
        } else {
            pointer += (eventTypeHigh === 0xC0 || eventTypeHigh === 0xD0) ? 1 : 2;
        }

        return { eventType, newPointer: pointer };
    }
} 