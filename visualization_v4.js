// Load and process both matrices
Promise.all([
    d3.csv('card_cooccurrence_matrix_v4_business.csv'),
    d3.csv('card_cooccurrence_matrix_v4_personal.csv')
]).then(function([businessData, personalData]) {
    const businessCards = businessData.columns.slice(1);
    const personalCards = personalData.columns.slice(1);
    
    const businessMatrix = [];
    const personalMatrix = [];
    
    // Convert CSV data to matrix format
    businessData.forEach(row => {
        const values = businessCards.map(card => ({
            value: +row[card],
            participants: []
        }));
        businessMatrix.push(values);
    });
    
    personalData.forEach(row => {
        const values = personalCards.map(card => ({
            value: +row[card],
            participants: []
        }));
        personalMatrix.push(values);
    });

    // Create visualizations
    createHeatmaps(businessMatrix, businessCards, personalMatrix, personalCards);
    updateStatistics(businessMatrix, businessCards, personalMatrix, personalCards);
    updateRelationships(businessMatrix, businessCards, personalMatrix, personalCards);
});

function createHeatmaps(businessMatrix, businessCards, personalMatrix, personalCards) {
    // Set up dimensions
    const margin = { 
        top: 120,
        right: 50,
        bottom: 50,
        left: 200
    };
    const width = 600 - margin.left - margin.right;  // Smaller width for each heatmap
    const height = 800 - margin.top - margin.bottom;
    
    // Calculate cell sizes
    const businessCellSize = Math.min(width, height) / businessCards.length;
    const personalCellSize = Math.min(width, height) / personalCards.length;

    // Remove existing SVGs
    d3.select("#business-heatmap svg").remove();
    d3.select("#personal-heatmap svg").remove();

    // Create business heatmap
    createSingleHeatmap(
        "#business-heatmap",
        businessMatrix,
        businessCards,
        businessCellSize,
        margin,
        width,
        height,
        "Business Users"
    );

    // Create personal heatmap
    createSingleHeatmap(
        "#personal-heatmap",
        personalMatrix,
        personalCards,
        personalCellSize,
        margin,
        width,
        height,
        "Personal Users"
    );
}

function createSingleHeatmap(containerId, matrix, cards, cellSize, margin, width, height, title) {
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Add title
    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "500")
        .style("fill", "#333")
        .text(title);

    const mainGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create color scale
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(matrix, d => d3.max(d, v => v.value))])
        .interpolator(d3.interpolateHsl("#f7f9fc", "#0066CC"));

    // Create heatmap group
    const heatmapGroup = mainGroup.append("g")
        .attr("class", "heatmap-group");

    // Add labels and cells
    addLabelsAndCells(heatmapGroup, matrix, cards, cellSize, colorScale);
}

function addLabelsAndCells(heatmapGroup, matrix, cards, cellSize, colorScale) {
    const labelAngle = -35;
    const labelOffset = 12;
    const labelPadding = 8;

    // Add x-axis labels
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
        .style("font-weight", "400")
        .style("fill", "#333")
        .text(d => d);

    // Add y-axis labels
    const sideLabels = heatmapGroup.append("g")
        .attr("class", "side-labels")
        .selectAll("text")
        .data(cards)
        .enter()
        .append("text")
        .attr("x", -labelPadding - 10)
        .attr("y", (d, i) => i * cellSize + cellSize / 2)
        .style("text-anchor", "end")
        .style("dominant-baseline", "middle")
        .style("font-size", "11px")
        .style("font-weight", "400")
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
    addHoverEffects(cells, topLabels, sideLabels, cards, matrix);

    // Add value labels
    addValueLabels(rows, cellSize);
}

function addHoverEffects(cells, topLabels, sideLabels, cards, matrix) {
    cells.on("mouseover", function(event, d) {
        const cell = d3.select(this);
        cell.style("stroke", "#0066CC")
            .style("stroke-width", "1.5px");
        
        const row = d3.select(this.parentNode).datum();
        const col = d3.select(this).datum();
        const rowIndex = matrix.indexOf(row);
        const colIndex = row.indexOf(col);
        
        topLabels.filter((d, i) => i === colIndex)
            .style("fill", "#0066CC")
            .style("font-weight", "500");
        
        sideLabels.filter((d, i) => i === rowIndex)
            .style("fill", "#0066CC")
            .style("font-weight", "500");
        
        showTooltip(event, cards[rowIndex], cards[colIndex], d.value);
    })
    .on("mouseout", function() {
        d3.select(this)
            .style("stroke", "white")
            .style("stroke-width", "0.5px");
        
        topLabels.style("fill", "#333")
            .style("font-weight", "normal");
        sideLabels.style("fill", "#333")
            .style("font-weight", "normal");
        
        hideTooltip();
    });
}

function showTooltip(event, card1, card2, value) {
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

    const tooltipContent = value > 0 ? `
        <div style="margin-bottom: 4px;">
            <strong style="color: #333">${card1}</strong>
            <span style="color: #666">↔</span>
            <strong style="color: #333">${card2}</strong>
        </div>
        <div style="color: #666">
            Co-occurrences: <strong style="color: #333">${value}</strong>
        </div>
    ` : `
        <div style="color: #666">No relationship</div>
    `;

    tooltip.html(tooltipContent)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
    d3.selectAll(".tooltip").remove();
}

function addValueLabels(rows, cellSize) {
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

function updateStatistics(businessMatrix, businessCards, personalMatrix, personalCards) {
    const businessStats = calculateStats(businessMatrix, businessCards, "Business");
    const personalStats = calculateStats(personalMatrix, personalCards, "Personal");
    
    const statsDiv = document.getElementById('statistics');
    statsDiv.innerHTML = `
        <div class="stat-grid">
            <div class="stat-section">
                <h3>Business Users</h3>
                ${renderStats(businessStats)}
            </div>
            <div class="stat-section">
                <h3>Personal Users</h3>
                ${renderStats(personalStats)}
            </div>
        </div>
    `;
}

function calculateStats(matrix, cards, type) {
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

    return {
        type,
        cardCount: cards.length,
        totalCooccurrences,
        maxCooccurrence,
        strongestPairs
    };
}

function renderStats(stats) {
    return `
        <div class="stat-item">
            <h4>Total Items</h4>
            <p>${stats.cardCount}</p>
        </div>
        <div class="stat-item">
            <h4>Total Co-occurrences</h4>
            <p>${stats.totalCooccurrences}</p>
        </div>
        <div class="stat-item">
            <h4>Strongest Relationship</h4>
            <p>${stats.maxCooccurrence} co-occurrences</p>
        </div>
    `;
}

function updateRelationships(businessMatrix, businessCards, personalMatrix, personalCards) {
    const businessRelationships = getTopRelationships(businessMatrix, businessCards, "Business");
    const personalRelationships = getTopRelationships(personalMatrix, personalCards, "Personal");
    
    const relationshipsDiv = document.getElementById('relationships');
    relationshipsDiv.innerHTML = `
        <div class="relationships-grid">
            <div class="relationship-section">
                <h3>Business User Relationships</h3>
                ${renderRelationships(businessRelationships)}
            </div>
            <div class="relationship-section">
                <h3>Personal User Relationships</h3>
                ${renderRelationships(personalRelationships)}
            </div>
        </div>
    `;
}

function getTopRelationships(matrix, cards, type) {
    const relationships = [];
    
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            if (matrix[i][j].value > 0) {
                relationships.push({
                    card1: cards[i],
                    card2: cards[j],
                    value: matrix[i][j].value,
                    type
                });
            }
        }
    }
    
    relationships.sort((a, b) => b.value - a.value);
    return relationships.slice(0, 5);
}

function renderRelationships(relationships) {
    return relationships.map(rel => `
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
                    ${getParticipantDetails(rel.card1, rel.card2, rel.type)}
                </div>
            </div>
        </div>
    `).join('');
}

function getParticipantDetails(card1, card2, type) {
    return `
        <div class="participant-item">
            <strong>${type} User Group:</strong> Grouped in same category
        </div>
    `;
} 