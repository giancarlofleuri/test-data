// Load and process the data
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
    // Increase top margin for better label visibility
    const margin = { top: 180, right: 100, bottom: 100, left: 250 };
    const width = 1000 - margin.left - margin.right;
    const height = 1000 - margin.top - margin.bottom;
    const cellSize = Math.min(width, height) / cards.length;

    // Remove existing SVG
    d3.select("#heatmap svg").remove();

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create color scale using MoniePoint blues
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(matrix, d => d3.max(d, v => v.value))])
        .interpolator(d3.interpolateHsl("#ffffff", "#0066CC"));

    // Add x-axis labels with improved positioning
    svg.append("g")
        .selectAll("text")
        .data(cards)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * cellSize + cellSize / 2)
        .attr("y", -10)
        .attr("transform", (d, i) => {
            const x = i * cellSize + cellSize / 2;
            const y = -10;
            return `rotate(-45, ${x}, ${y})`;
        })
        .style("text-anchor", "end")
        .style("dominant-baseline", "middle")
        .attr("class", "axis-label")
        .style("font-size", "12px")
        .text(d => d);

    // Add y-axis labels
    svg.append("g")
        .selectAll("text")
        .data(cards)
        .enter()
        .append("text")
        .attr("x", -10)
        .attr("y", (d, i) => i * cellSize + cellSize / 2)
        .style("text-anchor", "end")
        .style("dominant-baseline", "middle")
        .attr("class", "axis-label")
        .style("font-size", "12px")
        .text(d => d);

    // Create cells
    const rows = svg.selectAll(".row")
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
        .style("stroke", "#ffffff")
        .style("stroke-width", "1px");

    // Add hover effects and tooltips
    cells.on("mouseover", function(event, d) {
            const cell = d3.select(this);
            cell.style("stroke", "#0066CC")
                .style("stroke-width", "2px");
            
            // Get the row and column indices
            const row = d3.select(this.parentNode).datum();
            const col = d3.select(this).datum();
            const rowIndex = matrix.indexOf(row);
            const colIndex = row.indexOf(col);
            
            // Create tooltip with improved styling
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "white")
                .style("padding", "12px")
                .style("border", "1px solid #0066CC")
                .style("border-radius", "8px")
                .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
                .style("pointer-events", "none")
                .style("font-size", "14px")
                .style("opacity", 0);
            
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            
            const tooltipContent = d.value > 0 ? `
                <div style="margin-bottom: 8px;">
                    <strong style="color: #0066CC">${cards[rowIndex]}</strong>
                    <span style="color: #666">↔</span>
                    <strong style="color: #0066CC">${cards[colIndex]}</strong>
                </div>
                <div style="color: #666">
                    Co-occurrences: <strong style="color: #000">${d.value}</strong>
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    ${d.value > 4 ? 'Strong relationship' : d.value > 2 ? 'Moderate relationship' : 'Weak relationship'}
                </div>
            ` : `
                <div style="color: #666">No relationship found</div>
            `;
            
            tooltip.html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .style("stroke", "#ffffff")
                .style("stroke-width", "1px");
            
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
        .style("fill", d => d.value > 4 ? "#ffffff" : "#000000")
        .style("font-size", "12px")
        .text(d => d.value > 0 ? d.value : "");

    // Add legend with better positioning
    const legendWidth = 300;
    const legendHeight = 20;
    
    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(matrix, d => d3.max(d, v => v.value))])
        .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => d.toFixed(0));
    
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${(width - legendWidth) / 2}, ${-100})`);
    
    const gradient = legend.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");
    
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffffff");
    
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#0066CC");
    
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .style("stroke", "#ccc")
        .style("stroke-width", "1px");
    
    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .selectAll("text")
        .style("font-size", "10px");
    
    legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -8)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Co-occurrence Strength");
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