let graphData = {
    nodes: [],
    links: []
};

const width = 600;
const height = 400;
const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let linkForce = d3.forceLink(graphData.links).id(d => d.id).distance(100);
let simulation = d3.forceSimulation(graphData.nodes)
    .force("link", linkForce)
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

const arrowheadMarker = svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 30)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#333");


let link = svg.append("g").selectAll("line");
let node = svg.append("g").selectAll("circle");
let label = svg.append("g").selectAll("text");

let isDirected = false;

function updateGraph() {
    svg.selectAll("line").remove();
    svg.selectAll("circle").remove();
    svg.selectAll("text").remove();

    simulation.nodes(graphData.nodes);
    linkForce.links(graphData.links);

    link = svg.selectAll("line")
        .data(graphData.links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

    if (isDirected) {
        link.attr("marker-end", "url(#arrowhead)");
    } else {
        link.attr("marker-end", null);
    }

    node = svg.selectAll("circle")
        .data(graphData.nodes)
        .enter()
        .append("circle")
        .attr("r", 20)
        .attr("fill", "#fff")
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    label = svg.selectAll("text")
        .data(graphData.nodes)
        .enter()
        .append("text")
        .text(d => d.id)
        .attr("font-size", 15)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle");

    simulation.alpha(1).restart();
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label.attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}

document.getElementById("undirectedBtn").onclick = () => {
    isDirected = false;
    document.getElementById("undirectedBtn").classList.add("active");
    document.getElementById("directedBtn").classList.remove("active");
    graphData.nodes = [];
    graphData.links = [];
    updateGraph();
};

document.getElementById("directedBtn").onclick = () => {
    isDirected = true;
    document.getElementById("undirectedBtn").classList.remove("active");
    document.getElementById("directedBtn").classList.add("active");
    graphData.nodes = [];
    graphData.links = [];
    updateGraph();  // Reset the graph and update as directed
};

document.getElementById("addNodeBtn").onclick = () => {
    const nodeId = +document.getElementById("addNodeInput").value;
    if (!isNaN(nodeId) && !graphData.nodes.find(n => n.id === nodeId)) {
        graphData.nodes.push({ id: nodeId });
        updateGraph();
    }
};

document.getElementById("addEdgeBtn").onclick = () => {
    const source = +document.getElementById("addEdgeSourceInput").value;
    const target = +document.getElementById("addEdgeTargetInput").value;

    const sourceNode = graphData.nodes.find(n => n.id === source);
    const targetNode = graphData.nodes.find(n => n.id === target);

    if (!sourceNode) {
        alert(`Source node ${source} does not exist.`);
        return;
    }

    if (!targetNode) {
        alert(`Target node ${target} does not exist.`);
        return;
    }

    const existingEdge = graphData.links.find(l => l.source.id === source && l.target.id === target);
    const reverseEdge = graphData.links.find(l => l.source.id === target && l.target.id === source);

    if (existingEdge) {
        alert(`Edge from ${source} to ${target} already exists.`);
    } else if (reverseEdge && isDirected) {
        graphData.links.push({ source, target });
    } else {
        graphData.links.push({ source, target });
    }

    updateGraph();
};



document.getElementById("removeNodeBtn").onclick = () => {
    const nodeId = +document.getElementById("removeNodeInput").value;
    if (!isNaN(nodeId)) {
        graphData.nodes = graphData.nodes.filter(n => n.id !== nodeId);
        graphData.links = graphData.links.filter(l => l.source.id !== nodeId && l.target.id !== nodeId);
        updateGraph();
    }
};

function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
