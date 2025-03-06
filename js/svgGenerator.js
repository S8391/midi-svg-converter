export class SVGGenerator {
    static generate(midiData, width = 1200, height = 800) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        // Add style definitions for hover effects
        const style = document.createElementNS(svgNS, "style");
        style.textContent = `
            .note-rect {
                transition: all 0.2s ease;
                cursor: pointer;
            }
            .note-rect:hover {
                width: 10px !important;
                height: 10px !important;
                transform: translate(-2.5px, -2.5px);
                filter: brightness(1.2);
            }
        `;
        svg.appendChild(style);

        // Add background
        const background = document.createElementNS(svgNS, "rect");
        background.setAttribute("width", "100%");
        background.setAttribute("height", "100%");
        background.setAttribute("fill", "#1e1e2e");
        svg.appendChild(background);

        // Process notes
        const notes = this.processNotes(midiData);
        if (notes.length === 0) {
            return svg;
        }

        // Calculate scales with more spacing
        const { timeScale, noteScale } = this.calculateScales(notes, width, height);

        // Add grid with more spacing
        this.addGrid(svg, width, height);

        // Add notes with improved spacing
        this.addNotes(svg, notes, timeScale, noteScale);

        return svg;
    }

    static processNotes(midiData) {
        const notes = [];
        midiData.forEach(track => {
            track.forEach(event => {
                if (event.note !== undefined) {
                    notes.push(event);
                }
            });
        });
        return notes.sort((a, b) => a.time - b.time);
    }

    static calculateScales(notes, width, height) {
        const maxTime = notes[notes.length - 1].time;
        // Increase horizontal spacing by reducing the usable width less
        const timeScale = maxTime ? (width - 150) / maxTime : 1;
        // Increase vertical spacing by using more of the height
        const noteScale = (height - 150) / 127 * 1.2; // 20% more vertical spacing
        return { timeScale, noteScale };
    }

    static addGrid(svg, width, height) {
        const svgNS = "http://www.w3.org/2000/svg";
        const gridGroup = document.createElementNS(svgNS, "g");
        gridGroup.setAttribute("stroke", "#2b2b3b");
        gridGroup.setAttribute("stroke-width", "0.5");

        // Vertical lines with increased spacing
        for (let x = 75; x < width - 75; x += 75) {  // Increased from 50 to 75
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", 75);
            line.setAttribute("x2", x);
            line.setAttribute("y2", height - 75);
            gridGroup.appendChild(line);
        }

        // Horizontal lines with increased spacing
        for (let y = 75; y < height - 75; y += 30) {  // Increased from 20 to 30
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", 75);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width - 75);
            line.setAttribute("y2", y);
            gridGroup.appendChild(line);
        }

        svg.appendChild(gridGroup);
    }

    static addNotes(svg, notes, timeScale, noteScale) {
        const svgNS = "http://www.w3.org/2000/svg";
        const notesGroup = document.createElementNS(svgNS, "g");
        notesGroup.setAttribute("class", "notes-group");

        notes.forEach((event, index) => {
            const x = event.time * timeScale + 75;  // Increased padding from 50 to 75
            const y = (127 - event.note) * noteScale + 75;  // Increased padding from 50 to 75

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("class", "note-rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", "7");  // Increased from 5 to 7
            rect.setAttribute("height", "7");  // Increased from 5 to 7
            rect.setAttribute("fill", "#00ffff");
            rect.setAttribute("opacity", event.velocity / 127);
            
            // Add data attributes for note information
            rect.setAttribute("data-note", event.note);
            rect.setAttribute("data-time", event.time);
            rect.setAttribute("data-velocity", event.velocity);

            notesGroup.appendChild(rect);
        });

        svg.appendChild(notesGroup);
    }
} 