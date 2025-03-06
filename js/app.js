import { MIDIParser } from './midiParser.js';
import { SVGGenerator } from './svgGenerator.js';

class App {
    constructor() {
        this.generatedSVG = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.midiFileInput = document.getElementById('midiFileInput');
        this.svgContainer = document.getElementById('svgContainer');
        this.downloadButton = document.getElementById('downloadButton');
        this.errorMessage = document.getElementById('errorMessage');
    }

    attachEventListeners() {
        this.midiFileInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.downloadButton.addEventListener('click', this.handleDownload.bind(this));
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