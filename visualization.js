// Fetch and process the data
fetch('card_cooccurrence_matrix.csv')
    .then(response => response.text())
    .then(data => {
        const parsedData = d3.csvParse(data);
        const cards = parsedData.columns.slice(1); // Remove the first column (index)
        
        // Create matrix data
        const matrix = cards.map((row, i) => {
            return cards.map((col, j) => {
                return {
                    row: i,
                    col: j,
                    value: +parsedData[i][col]
                };
            });
        });

        createHeatmap(matrix, cards);
        updateStatistics(matrix, cards);
        updateRelationships(matrix, cards);
    });

function createHeatmap(matrix, cards) {
    // Increase left margin to accommodate longer labels
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

    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add cells
    const cellSize = Math.min(width, height) / cards.length;
    
    svg.selectAll()
        .data(matrix)
        .enter()
        .append("g")
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => d.col * cellSize)
        .attr("y", d => d.row * cellSize)
        .attr("rx", 2) // Rounded corners
        .attr("ry", 2) // Rounded corners
        .attr("width", cellSize * 0.95) // Slight gap between cells
        .attr("height", cellSize * 0.95)
        .style("fill", d => colorScale(d.value))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("stroke", "var(--secondary-color)")
                .style("stroke-width", "2px");
            
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`
                <strong>${cards[d.row]}</strong> ↔ <strong>${cards[d.col]}</strong><br/>
                Co-occurrences: ${d.value}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("stroke", "var(--background-color)")
                .style("stroke-width", "1px");
            
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Update row labels with text wrapping
    svg.selectAll()
        .data(cards)
        .enter()
        .append("text")
        .attr("class", "axis-label")
        .attr("x", -10)
        .attr("y", (d, i) => i * cellSize + cellSize / 2)
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle")
        .text(d => {
            if (d.length > 25) {
                return d.substring(0, 22) + '...';
            }
            return d;
        })
        .append("title") // Add tooltip for full text
        .text(d => d);

    // Update column labels with text wrapping
    svg.selectAll()
        .data(cards)
        .enter()
        .append("text")
        .attr("class", "axis-label")
        .attr("x", (d, i) => i * cellSize + cellSize / 2)
        .attr("y", -10)
        .style("text-anchor", "start")
        .attr("transform", (d, i) => `rotate(-45, ${i * cellSize + cellSize / 2}, -10)`)
        .text(d => {
            if (d.length > 25) {
                return d.substring(0, 22) + '...';
            }
            return d;
        })
        .append("title") // Add tooltip for full text
        .text(d => d);

    // Add legend
    const legendWidth = 300;
    const legendHeight = 15;

    const legendScale = d3.scaleSequential()
        .domain([0, d3.max(matrix, d => d3.max(d, v => v.value))])
        .interpolator(d3.interpolateHsl("#ffffff", "#0066CC"));

    const legendAxis = d3.axisBottom(d3.scaleLinear()
        .domain([0, d3.max(matrix, d => d3.max(d, v => v.value))])
        .range([0, legendWidth]))
        .ticks(5)
        .tickFormat(d => Math.round(d));

    const legend = svg.append("g")
        .attr("transform", `translate(${width - legendWidth - 10}, ${height + 50})`);

    const legendGradient = legend.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    legendGradient.selectAll("stop")
        .data(d3.range(0, 1.1, 0.1))
        .enter()
        .append("stop")
        .attr("offset", d => d * 100 + "%")
        .attr("stop-color", d => colorScale(d * d3.max(matrix, r => d3.max(r, v => v.value))));

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("rx", 2)
        .attr("ry", 2)
        .style("fill", "url(#legend-gradient)");

    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
}

function updateStatistics(matrix, cards) {
    const stats = d3.select("#statistics");
    
    // Calculate total co-occurrences
    const totalCooccurrences = d3.sum(matrix, d => d3.sum(d, v => v.value));
    
    // Calculate average co-occurrences
    const avgCooccurrences = totalCooccurrences / (cards.length * cards.length);
    
    // Calculate additional metrics
    const nonZeroCooccurrences = matrix.flat().filter(v => v.value > 0).length;
    const maxCooccurrence = d3.max(matrix, d => d3.max(d, v => v.value));
    
    stats.html(`
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
                <h3>Average Co-occurrences</h3>
                <p>${avgCooccurrences.toFixed(2)}</p>
            </div>
            <div class="stat-item">
                <h3>Maximum Co-occurrence</h3>
                <p>${maxCooccurrence}</p>
            </div>
        </div>
    `);
}

function updateRelationships(matrix, cards) {
    const relationships = [];
    
    // Collect all relationships with participant data
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            if (matrix[i][j].value > 0) {
                // Get participant data for this relationship
                const participants = getParticipantData(cards[i], cards[j]);
                relationships.push({
                    card1: cards[i],
                    card2: cards[j],
                    value: matrix[i][j].value,
                    participants: participants
                });
            }
        }
    }
    
    // Sort by strength
    relationships.sort((a, b) => b.value - a.value);
    
    // Display top relationships
    const relationshipsDiv = d3.select("#top-relationships");
    relationshipsDiv.html(
        relationships.slice(0, 10).map((r, index) => 
            `<div class="relationship-item">
                <div class="relationship-header" onclick="toggleAccordion(${index})">
                    <div class="relationship-content">
                        <strong>${r.card1}</strong>
                        <span class="relationship-arrow">↔</span>
                        <strong>${r.card2}</strong>
                    </div>
                    <div class="relationship-value">
                        ${r.value} co-occurrences
                        <span class="accordion-arrow">▼</span>
                    </div>
                </div>
                <div class="relationship-details" id="accordion-${index}">
                    <div class="participant-list">
                        <h4>Participants who grouped these together:</h4>
                        <ul>
                            ${r.participants.map(p => `
                                <li>
                                    <strong>Participant ${p.id}</strong>
                                    <span class="group-name">${p.groupName}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>`
        ).join("")
    );
}

// Helper function to get participant data for a pair of cards
function getParticipantData(card1, card2) {
    const participants = [];
    const participantGroups = {
        "Participant 1": {
            "Business Services": [
                "Send & receive payments", "Business account", "Business registration",
                "Business expense cards", "Working capital loans", "POS systems"
            ],
            "Personal Banking": [
                "Send & receive money", "Personal account", "Personal debit card",
                "Individual loans", "Savings"
            ],
            "Support": [
                "FAQs", "Customer support", "Security & Fraud protection"
            ]
        },
        "Participant 2": {
            "Business Tools": [
                "Manage business", "Bookkeeping & inventory management",
                "Web payment gateway", "Business expense cards"
            ],
            "Financial Products": [
                "Finance business", "Working capital loans", "Overdraft",
                "FX", "Salary advance"
            ],
            "Resources": [
                "Learning centre", "Blog", "Reports", "Customer case studies"
            ]
        },
        "Participant 3": {
            "Money Management": [
                "Send & receive money", "Manage money", "Grow money",
                "Savings", "Personal account"
            ],
            "Business Solutions": [
                "Send & receive payments", "Business account",
                "Web payment gateway", "POS systems"
            ],
            "Information": [
                "About us", "Blog", "FAQs", "Customer support"
            ]
        },
        "Participant 4": {
            "Business Banking": [
                "Send & receive payments", "Business account", "Business expense cards",
                "Working capital loans", "Web payment gateway"
            ],
            "Personal Finance": [
                "Send & receive money", "Personal account", "Savings",
                "Individual loans", "Personal debit card"
            ],
            "Learning & Support": [
                "Learning centre", "FAQs", "Customer support", "Blog"
            ]
        },
        "Participant 5": {
            "Core Business": [
                "Business account", "Send & receive payments", "POS systems",
                "Business expense cards", "Working capital loans"
            ],
            "Personal Services": [
                "Personal account", "Send & receive money", "Savings",
                "Individual loans"
            ],
            "Resources & Help": [
                "FAQs", "Customer support", "Learning centre",
                "Security & Fraud protection"
            ]
        },
        "Participant 6": {
            "Business Operations": [
                "Business account", "Send & receive payments",
                "Business expense cards", "Web payment gateway"
            ],
            "Personal Banking": [
                "Personal account", "Send & receive money",
                "Personal debit card", "Savings"
            ],
            "Support & Information": [
                "Customer support", "FAQs", "Security & Fraud protection",
                "About us"
            ]
        },
        "Participant 7": {
            "Business Features": [
                "Business account", "Send & receive payments",
                "Working capital loans", "Business expense cards"
            ],
            "Personal Features": [
                "Personal account", "Send & receive money",
                "Individual loans", "Savings"
            ],
            "Help & Resources": [
                "Customer support", "FAQs", "Learning centre",
                "Blog"
            ]
        },
        "Participant 8": {
            "Business Solutions": [
                "Business account", "Send & receive payments",
                "POS systems", "Web payment gateway"
            ],
            "Personal Solutions": [
                "Personal account", "Send & receive money",
                "Savings", "Personal debit card"
            ],
            "Information & Support": [
                "FAQs", "Customer support", "About us",
                "Security & Fraud protection"
            ]
        },
        "Participant 9": {
            "Business Tools": [
                "Business account", "Send & receive payments",
                "Business expense cards", "Working capital loans"
            ],
            "Personal Tools": [
                "Personal account", "Send & receive money",
                "Savings", "Individual loans"
            ],
            "Support": [
                "Customer support", "FAQs", "Learning centre",
                "Reports"
            ]
        },
        "Participant 10": {
            "Business Services": [
                "Business account", "Send & receive payments",
                "POS systems", "Web payment gateway"
            ],
            "Personal Services": [
                "Personal account", "Send & receive money",
                "Savings", "Personal debit card"
            ],
            "Help Center": [
                "FAQs", "Customer support", "Security & Fraud protection",
                "Learning centre"
            ]
        }
    };

    // Check each participant's groups
    Object.entries(participantGroups).forEach(([participantId, groups]) => {
        Object.entries(groups).forEach(([groupName, cards]) => {
            if (cards.includes(card1) && cards.includes(card2)) {
                participants.push({
                    id: participantId.split(' ')[1],
                    groupName: groupName
                });
            }
        });
    });

    return participants;
}

// Add this at the end of the file
function toggleAccordion(index) {
    const details = document.getElementById(`accordion-${index}`);
    const arrow = details.parentElement.querySelector('.accordion-arrow');
    const isExpanded = details.style.maxHeight;

    // Close all other accordions
    document.querySelectorAll('.relationship-details').forEach(el => {
        el.style.maxHeight = null;
    });
    document.querySelectorAll('.accordion-arrow').forEach(el => {
        el.style.transform = 'rotate(0deg)';
    });

    if (!isExpanded) {
        details.style.maxHeight = details.scrollHeight + "px";
        arrow.style.transform = 'rotate(180deg)';
    }
} 