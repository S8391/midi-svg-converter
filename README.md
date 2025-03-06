# MIDI to SVG Converter

A modern web application that converts MIDI files into SVG visualizations. This tool provides an intuitive interface for musicians and developers to visualize MIDI data.

[Live Demo](https://s8391.github.io/midi-svg-converter)

## 🌟 Features

- **Simple Interface**: Clean, modern UI for easy file upload
- **Real-time Visualization**: Instant MIDI file processing and visualization
- **Interactive Elements**: Hover over notes to see detailed information
- **Grid Background**: Helps with note positioning and timing reference
- **Download Support**: Export visualizations as SVG files
- **Responsive Design**: Works on all devices

## 🚀 Usage

1. Click "Choose MIDI File" or drag and drop a MIDI file
2. Wait for the visualization to generate
3. Hover over notes to see note name, timing, and velocity
4. Click "Download SVG" to save the visualization

## 🛠️ Technical Details

### File Structure
```
midi-svg-converter/
├── index.html          # Main HTML file
├── styles.css          # Styling
└── js/
    ├── app.js         # Main application logic
    ├── midiParser.js  # MIDI file parsing
    └── svgGenerator.js # SVG generation
```

### Key Components

#### MIDI Parser
- Handles MIDI file format parsing
- Extracts note events and timing information
- Supports multiple MIDI tracks
- Validates MIDI file structure

#### SVG Generator
- Creates responsive SVG visualizations
- Implements grid system for reference
- Adds interactive hover effects
- Scales visualization based on MIDI data

## 📝 Notes

- The visualization scales automatically based on the MIDI file content
- Note opacity reflects velocity values
- Grid lines help with timing and pitch reference
- SVG output is optimized for web use

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
