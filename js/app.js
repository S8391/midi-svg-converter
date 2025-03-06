import { MIDIParser } from './midiParser.js';
import { SVGGenerator } from './svgGenerator.js';

class App {
    constructor() {
        this.generatedSVG = null;
        this.initializeElements();
        this.attachEventListeners();
        this.createNoteInfoDisplay();
    }

    initializeElements() {
        this.midiFileInput = document.getElementById('midiFileInput');
        this.svgContainer = document.getElementById('svgContainer');
        this.downloadButton = document.getElementById('downloadButton');
        this.errorMessage = document.getElementById('errorMessage');
    }

    createNoteInfoDisplay() {
        this.noteInfo = document.createElement('div');
        this.noteInfo.className = 'note-info';
        this.noteInfo.style.display = 'none';
        document.body.appendChild(this.noteInfo);
    }

    attachEventListeners() {
        this.midiFileInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.downloadButton.addEventListener('click', this.handleDownload.bind(this));
        
        // Add hover event listeners for the SVG container
        this.svgContainer.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('note-rect')) {
                this.showNoteInfo(e);
            }
        });

        this.svgContainer.addEventListener('mousemove', (e) => {
            if (e.target.classList.contains('note-rect')) {
                this.updateNoteInfoPosition(e);
            }
        });

        this.svgContainer.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('note-rect')) {
                this.hideNoteInfo();
            }
        });
    }

    showNoteInfo(event) {
        const note = event.target.getAttribute('data-note');
        const time = event.target.getAttribute('data-time');
        const velocity = event.target.getAttribute('data-velocity');
        
        const noteName = this.getNoteNameFromMIDI(parseInt(note));
        
        this.noteInfo.innerHTML = `
            <div class="note-info-content">
                <strong>Note:</strong> ${noteName} (${note})<br>
                <strong>Time:</strong> ${time}<br>
                <strong>Velocity:</strong> ${velocity}
            </div>
        `;
        this.noteInfo.style.display = 'block';
        this.updateNoteInfoPosition(event);
    }

    updateNoteInfoPosition(event) {
        const rect = this.svgContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.noteInfo.style.left = `${event.clientX + 10}px`;
        this.noteInfo.style.top = `${event.clientY + 10}px`;
    }

    hideNoteInfo() {
        this.noteInfo.style.display = 'none';
    }

    getNoteNameFromMIDI(midiNote) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = notes[midiNote % 12];
        return `${noteName}${octave}`;
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const midiData = MIDIParser.parse(arrayBuffer);
            this.displaySVG(midiData);
        } catch (error) {
            this.showError(error.message);
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    }

    displaySVG(midiData) {
        const svg = SVGGenerator.generate(midiData);
        this.svgContainer.innerHTML = '';
        this.svgContainer.appendChild(svg);
        this.generatedSVG = svg;
        this.showUI();
    }

    showUI() {
        this.svgContainer.style.display = 'inline-block';
        this.downloadButton.style.display = 'inline-block';
        this.errorMessage.textContent = '';
    }

    handleDownload() {
        if (!this.generatedSVG) return;

        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(this.generatedSVG);
        svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'midi_visualization.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.svgContainer.style.display = 'none';
        this.downloadButton.style.display = 'none';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 