const width = 600;
const height = 400;
const radius = 20;

const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", zoomed)
    .filter(function(event) { return !event.button && !event.shiftKey; });

const svg = d3.select("#graphContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

const g = svg.append("g");

let currentZoomNode = null;

document.getElementById("generateGraphBtn").onclick = function() {
    const nodeCount = +document.getElementById("nodeCount").value;
    const probability = parseFloat(document.getElementById("probability").value);

    if (nodeCount > 0 && !isNaN(probability) && probability >= 0 && probability <= 1) {
        generateGraph(nodeCount, probability);
    } else {
        alert("Please enter a valid number of nodes and probability (0 to 1)");
    }
};

function generateGraph(nodeCount, probability) {
    g.selectAll("*").remove();

    let nodes = [];
    let links = [];

    for (let i = 0; i < nodeCount; i++) {
        let node = generateNonOverlappingNode(nodes);
        nodes.push(node);
    }

    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            if (Math.random() >= probability) {
                links.push({ source: nodes[i], target: nodes[j] });
            }
        }
    }

    g.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

    g.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", radius)
        .attr("fill", "#fff")
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .on("click", zoomToNode);

    g.selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .text((d, i) => i + 1)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "15px");
}

function generateNonOverlappingNode(existingNodes) {
    let node;
    let overlapping;
    do {
        overlapping = false;
        node = {
            x: Math.random() * (width - 2 * radius) + radius,
            y: Math.random() * (height - 2 * radius) + radius
        };

        for (let existingNode of existingNodes) {
            const distance = Math.sqrt(
                Math.pow(node.x - existingNode.x, 2) +
                Math.pow(node.y - existingNode.y, 2)
            );
            if (distance < 2 * radius) {
                overlapping = true;
                break;
            }
        }
    } while (overlapping);

    return node;
}

function zoomed(event) {
    g.attr("transform", event.transform);
    updateEdges();
}

function updateEdges() {
    const zoomScale = d3.zoomTransform(svg.node()).k;

    g.selectAll("line").each(function(d) {
        const offset = 10 * (zoomScale - 1);
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const spacingX = (dx / distance) * offset;
        const spacingY = (dy / distance) * offset;

        d3.select(this)
            .attr("x1", d.source.x + spacingX / 2)
            .attr("y1", d.source.y + spacingY / 2)
            .attr("x2", d.target.x - spacingX / 2)
            .attr("y2", d.target.y - spacingY / 2);
    });
}

function resetZoom() {
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
    );

    currentZoomNode = null;
}

const resetZoomButton = d3.select("body").append("button")
    .text("Reset Zoom")
    .style("position", "absolute")
    .style("bottom", "10px")
    .style("right", "10px")
    .on("click", resetZoom);

function zoomToNode(event, d) {
    if (currentZoomNode === d) {
        currentZoomNode = null;
        resetZoom();
        return;
    }

    currentZoomNode = d;

    const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(3)  // Zoom in
        .translate(-d.x, -d.y);

    svg.transition().duration(750).call(zoom.transform, transform);
}
