export class SVGGenerator {
    static generate(midiData, width = 800, height = 600) {
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
                width: 8px !important;
                height: 8px !important;
                transform: translate(-1.5px, -1.5px);
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

        // Calculate scales
        const { timeScale, noteScale } = this.calculateScales(notes, width, height);

        // Add grid
        this.addGrid(svg, width, height);

        // Add notes
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
        const timeScale = maxTime ? (width - 100) / maxTime : 1;
        const noteScale = (height - 100) / 127;
        return { timeScale, noteScale };
    }

    static addGrid(svg, width, height) {
        const svgNS = "http://www.w3.org/2000/svg";
        const gridGroup = document.createElementNS(svgNS, "g");
        gridGroup.setAttribute("stroke", "#2b2b3b");
        gridGroup.setAttribute("stroke-width", "0.5");

        // Vertical lines
        for (let x = 50; x < width - 50; x += 50) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", 50);
            line.setAttribute("x2", x);
            line.setAttribute("y2", height - 50);
            gridGroup.appendChild(line);
        }

        // Horizontal lines
        for (let y = 50; y < height - 50; y += 20) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", 50);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width - 50);
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
            const x = event.time * timeScale + 50;
            const y = (127 - event.note) * noteScale + 50;

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("class", "note-rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", "5");
            rect.setAttribute("height", "5");
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