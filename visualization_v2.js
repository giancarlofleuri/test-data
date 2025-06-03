// Load and process the data
d3.csv('card_cooccurrence_matrix_v2.csv').then(function(data) {
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
    const margin = { top: 120, right: 50, bottom: 100, left: 200 };
    const width = 1000 - margin.left - margin.right;
    const height = 1000 - margin.top - margin.bottom;

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

    // Add x-axis labels
    svg.append("g")
        .selectAll("text")
        .data(cards)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * (width / cards.length) + (width / cards.length) / 2)
        .attr("y", -10)
        .attr("transform", (d, i) => {
            const x = i * (width / cards.length) + (width / cards.length) / 2;
            return `rotate(-45, ${x}, -10)`;
        })
        .style("text-anchor", "end")
        .attr("class", "axis-label")
        .text(d => d);

    // Add y-axis labels
    svg.append("g")
        .selectAll("text")
        .data(cards)
        .enter()
        .append("text")
        .attr("x", -10)
        .attr("y", (d, i) => i * (height / cards.length) + (height / cards.length) / 2)
        .style("text-anchor", "end")
        .attr("class", "axis-label")
        .attr("dy", "0.35em")
        .text(d => d);

    // Create cells
    const rows = svg.selectAll(".row")
        .data(matrix)
        .enter()
        .append("g")
        .attr("class", "row")
        .attr("transform", (d, i) => `translate(0,${i * (height / cards.length)})`);

    rows.selectAll(".cell")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d, i) => i * (width / cards.length))
        .attr("width", width / cards.length)
        .attr("height", height / cards.length)
        .style("fill", d => colorScale(d.value))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("stroke", "#0066CC")
                .style("stroke-width", "2px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .style("stroke", "#ffffff")
                .style("stroke-width", "1px");
        });

    // Add value labels
    rows.selectAll(".value-label")
        .data(d => d)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", (d, i) => i * (width / cards.length) + (width / cards.length) / 2)
        .attr("y", height / cards.length / 2)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("fill", d => d.value > 4 ? "#ffffff" : "#000000")
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
                <h3>Total Cards</h3>
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
            <strong>Participant 1:</strong> Grouped in "Financial Services"
        </div>
        <div class="participant-item">
            <strong>Participant 2:</strong> Grouped in "Banking Features"
        </div>
    `;
} 