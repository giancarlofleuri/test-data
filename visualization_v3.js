// Load and process the data
// Updated visualization with improved label positioning
d3.csv('card_cooccurrence_matrix_v3.csv').then(function(data) {
    const cards = data.columns.slice(1); // Get card names from columns
    const matrix = [];
    
    // Convert CSV data to matrix format
    data.forEach(row => {
        const values = cards.map(card => ({
            value: +row[card],
            participants: [] // We'll populate this with participant data
        }));
        matrix.push(values);
    });

    // Create visualizations
    createHeatmap(matrix, cards);
    updateStatistics(matrix, cards);
    updateRelationships(matrix, cards);
});

function createHeatmap(matrix, cards) {
    // Adjust margins for better spacing
    const margin = { 
        top: 120,      // Reduced top margin
        right: 50,     // Minimal right margin
        bottom: 50,    // Minimal bottom margin
        left: 200      // Space for left labels
    };
    const width = 1200 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    const cellSize = Math.min(width, height) / cards.length;

    // Calculate label positioning
    const labelAngle = -35; // Less steep angle
    const labelOffset = 8;  // Gap between label and cell

    // Remove existing SVG
    d3.select("#heatmap svg").remove();

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Add title at the top
    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#333")
        .text("Co-occurrence Strength");

    const mainGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create color scale using lighter blues
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(matrix, d => d3.max(d, v => v.value))])
        .interpolator(d3.interpolateHsl("#f7f9fc", "#0066CC"));

    // Create a group for the heatmap
    const heatmapGroup = mainGroup.append("g")
        .attr("class", "heatmap-group");

    // Add x-axis labels with improved positioning
    const topLabels = heatmapGroup.append("g")
        .attr("class", "top-labels")
        .selectAll("text")
        .data(cards)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * cellSize + cellSize / 2)
        .attr("y", -labelOffset)
        .attr("transform", (d, i) => {
            const x = i * cellSize + cellSize / 2;
            const y = -labelOffset;
            return `rotate(${labelAngle}, ${x}, ${y})`;
        })
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .style("fill", "#333")
        .text(d => d);

    // Add y-axis labels with improved spacing
    const sideLabels = heatmapGroup.append("g")
        .attr("class", "side-labels")
        .selectAll("text")
        .data(cards)
        .enter()
        .append("text")
        .attr("x", -10)
        .attr("y", (d, i) => i * cellSize + cellSize / 2)
        .style("text-anchor", "end")
        .style("dominant-baseline", "middle")
        .style("font-size", "11px")
        .style("fill", "#333")
        .text(d => d);

    // Create cells
    const rows = heatmapGroup.selectAll(".row")
        .data(matrix)
        .enter()
        .append("g")
        .attr("class", "row")
        .attr("transform", (d, i) => `translate(0,${i * cellSize})`);

    const cells = rows.selectAll(".cell")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d, i) => i * cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", d => colorScale(d.value))
        .style("stroke", "white")
        .style("stroke-width", "0.5px");

    // Add hover effects and tooltips
    cells.on("mouseover", function(event, d) {
            const cell = d3.select(this);
            cell.style("stroke", "#0066CC")
                .style("stroke-width", "1.5px");
            
            // Get the row and column indices
            const row = d3.select(this.parentNode).datum();
            const col = d3.select(this).datum();
            const rowIndex = matrix.indexOf(row);
            const colIndex = row.indexOf(col);
            
            // Highlight corresponding labels
            topLabels.filter((d, i) => i === colIndex)
                .style("fill", "#0066CC")
                .style("font-weight", "500");
            
            sideLabels.filter((d, i) => i === rowIndex)
                .style("fill", "#0066CC")
                .style("font-weight", "500");
            
            // Create tooltip with improved styling
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "white")
                .style("padding", "8px 12px")
                .style("border", "1px solid #ddd")
                .style("border-radius", "4px")
                .style("box-shadow", "0 1px 2px rgba(0,0,0,0.05)")
                .style("pointer-events", "none")
                .style("font-size", "12px")
                .style("opacity", 0);
            
            tooltip.transition()
                .duration(150)
                .style("opacity", .9);
            
            const tooltipContent = d.value > 0 ? `
                <div style="margin-bottom: 4px;">
                    <strong style="color: #333">${cards[rowIndex]}</strong>
                    <span style="color: #666">↔</span>
                    <strong style="color: #333">${cards[colIndex]}</strong>
                </div>
                <div style="color: #666">
                    Co-occurrences: <strong style="color: #333">${d.value}</strong>
                </div>
            ` : `
                <div style="color: #666">No relationship</div>
            `;
            
            tooltip.html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", "0.5px");
            
            // Reset label styles
            topLabels.style("fill", "#333")
                .style("font-weight", "normal");
            sideLabels.style("fill", "#333")
                .style("font-weight", "normal");
            
            d3.selectAll(".tooltip").remove();
        });

    // Add value labels
    rows.selectAll(".value-label")
        .data(d => d)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", (d, i) => i * cellSize + cellSize / 2)
        .attr("y", cellSize / 2)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("fill", d => d.value > 4 ? "#ffffff" : "#333")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .text(d => d.value > 0 ? d.value : "");
}

function updateStatistics(matrix, cards) {
    // Calculate statistics
    let totalCooccurrences = 0;
    let maxCooccurrence = 0;
    let strongestPairs = [];

    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            const value = matrix[i][j].value;
            if (value > 0) {
                totalCooccurrences += value;
                if (value > maxCooccurrence) {
                    maxCooccurrence = value;
                    strongestPairs = [[cards[i], cards[j], value]];
                } else if (value === maxCooccurrence) {
                    strongestPairs.push([cards[i], cards[j], value]);
                }
            }
        }
    }

    // Update statistics in the DOM
    const statsDiv = document.getElementById('statistics');
    statsDiv.innerHTML = `
        <div class="stat-grid">
            <div class="stat-item">
                <h3>Total Items</h3>
                <p>${cards.length}</p>
            </div>
            <div class="stat-item">
                <h3>Total Co-occurrences</h3>
                <p>${totalCooccurrences}</p>
            </div>
            <div class="stat-item">
                <h3>Strongest Relationship</h3>
                <p>${maxCooccurrence} co-occurrences</p>
            </div>
        </div>
    `;
}

function updateRelationships(matrix, cards) {
    const relationships = [];
    
    // Collect all relationships
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            if (matrix[i][j].value > 0) {
                relationships.push({
                    card1: cards[i],
                    card2: cards[j],
                    value: matrix[i][j].value
                });
            }
        }
    }
    
    // Sort by strength
    relationships.sort((a, b) => b.value - a.value);
    
    // Display top relationships
    const relationshipsDiv = document.getElementById('relationships');
    relationshipsDiv.innerHTML = `
        <h3>Strongest Relationships</h3>
        ${relationships.slice(0, 5).map(rel => `
            <div class="relationship-item">
                <div class="relationship-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <div class="relationship-content">
                        <span>${rel.card1}</span>
                        <span class="relationship-arrow">↔</span>
                        <span>${rel.card2}</span>
                    </div>
                    <div class="relationship-value">
                        <span>${rel.value} co-occurrences</span>
                        <span class="accordion-arrow">▼</span>
                    </div>
                </div>
                <div class="relationship-details">
                    <div class="participant-list">
                        ${getParticipantDetails(rel.card1, rel.card2)}
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

function getParticipantDetails(card1, card2) {
    // This is a placeholder function - in a real implementation,
    // you would get this data from your participant data source
    return `
        <div class="participant-item">
            <strong>Participant 1:</strong> Grouped in "Help & Support"
        </div>
        <div class="participant-item">
            <strong>Participant 2:</strong> Grouped in "Company Information"
        </div>
    `;
} 