import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EnhancedApp = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterData, setCharacterData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [viewMode, setViewMode] = useState('full'); // 'full' or 'individual'
  const svgRef = useRef();

  // Load character data
  useEffect(() => {
    fetch('/enhanced_character_network.json')
      .then(response => response.json())
      .then(data => {
        setNetworkData(data);
      })
      .catch(error => console.error('Error loading network data:', error));

    fetch('/final_comprehensive_character_database.json')
      .then(response => response.json())
      .then(data => {
        setCharacterData(data);
      })
      .catch(error => console.error('Error loading character data:', error));
  }, []);

  // Get characters for selected category
  const getCharactersForCategory = (category) => {
    if (!characterData) return [];
    
    const characters = Object.values(characterData);
    
    if (category === 'all') {
      return characters;
    }
    
    return characters.filter(char => {
      const charCategory = char.category || 'Other';
      if (category === 'mob') return charCategory === 'Organized Crime';
      if (category === 'intelligence') return charCategory === 'Intelligence & Law Enforcement';
      if (category === 'politics') return charCategory === 'Politics';
      return charCategory === 'Other';
    });
  };

  // Create network visualization
  const createVisualization = (data, containerId, isIndividual = false) => {
    const container = d3.select(containerId);
    container.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("max-width", "100%")
      .style("height", "auto");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Process data for D3
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Color scale for different character types
    const colorScale = d3.scaleOrdinal()
      .domain(['organized_crime', 'intelligence', 'political', 'other'])
      .range(['#ef4444', '#3b82f6', '#22c55e', '#6b7280']);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter((width - margin.left - margin.right) / 2, (height - margin.top - margin.bottom) / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => isIndividual && d.id === selectedCharacter?.id ? 15 : 10)
      .attr("fill", d => colorScale(d.type))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add labels
    const labels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.id)
      .attr("font-size", "12px")
      .attr("dx", 15)
      .attr("dy", 4)
      .style("pointer-events", "none");

    // Add hover effects
    node.on("mouseover", function(event, d) {
      d3.select(this).attr("r", 15);
      
      // Show tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.id}</strong><br/>Type: ${d.type}<br/>Click for details`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("r", isIndividual && d.id === selectedCharacter?.id ? 15 : 10);
      d3.selectAll(".tooltip").remove();
    })
    .on("click", function(event, d) {
      // Find character in database
      const character = Object.values(characterData.categories)
        .flatMap(cat => cat.characters)
        .find(char => char.id === d.id);
      
      if (character) {
        setSelectedCharacter(character);
        setViewMode('individual');
      }
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
  };

  // Create individual character network
  const createIndividualNetwork = (character) => {
    if (!networkData || !character) return;

    // Find all connections for this character
    const characterConnections = {
      nodes: [],
      links: []
    };

    // Add the main character
    const mainNode = networkData.nodes.find(n => n.id === character.id);
    if (mainNode) {
      characterConnections.nodes.push({ ...mainNode });
    }

    // Add connected characters
    const connectedIds = new Set();
    
    // Add outgoing connections
    if (character.connections?.outgoing) {
      character.connections.outgoing.forEach(conn => {
        const targetNode = networkData.nodes.find(n => n.id === conn.target);
        if (targetNode && !connectedIds.has(conn.target)) {
          characterConnections.nodes.push({ ...targetNode });
          connectedIds.add(conn.target);
        }
        
        characterConnections.links.push({
          source: character.id,
          target: conn.target,
          relationship: conn.relationship,
          description: conn.description
        });
      });
    }

    // Add incoming connections
    if (character.connections?.incoming) {
      character.connections.incoming.forEach(conn => {
        const sourceNode = networkData.nodes.find(n => n.id === conn.source);
        if (sourceNode && !connectedIds.has(conn.source)) {
          characterConnections.nodes.push({ ...sourceNode });
          connectedIds.add(conn.source);
        }
        
        characterConnections.links.push({
          source: conn.source,
          target: character.id,
          relationship: conn.relationship,
          description: conn.description
        });
      });
    }

    createVisualization(characterConnections, svgRef.current, true);
  };

  // Handle character selection
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setViewMode('individual');
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'full') {
      setSelectedCharacter(null);
    }
  };

  // Update visualization when data changes
  useEffect(() => {
    if (networkData && characterData) {
      if (viewMode === 'full') {
        createVisualization(networkData, svgRef.current);
      } else if (viewMode === 'individual' && selectedCharacter) {
        createIndividualNetwork(selectedCharacter);
      }
    }
  }, [networkData, characterData, viewMode, selectedCharacter]);

  if (!characterData || !networkData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading character network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-center">
            Connected world of crime, politics, and intelligence
          </h1>
          <p className="text-gray-300 text-center mt-2">
            Explore the intricate networks revealed in "The World Beneath" podcast
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              {/* View Mode Toggle */}
              <div>
                <h3 className="text-lg font-semibold mb-3">View Mode</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleViewModeChange('full')}
                    className={`w-full px-4 py-2 rounded-md text-left transition-colors ${
                      viewMode === 'full' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Full Network
                  </button>
                  <button
                    onClick={() => handleViewModeChange('individual')}
                    className={`w-full px-4 py-2 rounded-md text-left transition-colors ${
                      viewMode === 'individual' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    disabled={!selectedCharacter}
                  >
                    Individual Network
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Categories</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Characters</option>
                  <option value="mob">Organized Crime</option>
                  <option value="intelligence">Intelligence & Law Enforcement</option>
                  <option value="politics">Political Figures</option>
                  <option value="other">Other Figures</option>
                </select>
              </div>

              {/* Character List */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Characters</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getCharactersForCategory(selectedCategory).map((character) => (
                    <button
                      key={character.id}
                      onClick={() => handleCharacterSelect(character)}
                      className={`w-full px-3 py-2 rounded-md text-left text-sm transition-colors ${
                        selectedCharacter?.id === character.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium">{character.name}</div>
                      <div className="text-xs text-gray-400">{character.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Legend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span>Organized Crime</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span>Intelligence</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span>Political</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                    <span>Other</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-6">
              {/* Network Visualization */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {viewMode === 'full' ? 'Complete Network' : `${selectedCharacter?.name} Network`}
                </h2>
                <div 
                  ref={svgRef}
                  className="w-full bg-gray-900 rounded-lg border border-gray-700"
                  style={{ minHeight: '600px' }}
                ></div>
              </div>

              {/* Character Details */}
              {selectedCharacter && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-start space-x-6">
                    {selectedCharacter.photo_path && (
                      <img
                        src={selectedCharacter.photo_path}
                        alt={selectedCharacter.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{selectedCharacter.name}</h3>
                      {selectedCharacter.birth_name !== selectedCharacter.name && (
                        <p className="text-gray-400 mb-2">Born: {selectedCharacter.birth_name}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-400">Role:</span> {selectedCharacter.role}
                        </div>
                        <div>
                          <span className="text-gray-400">Organization:</span> {selectedCharacter.organization}
                        </div>
                        <div>
                          <span className="text-gray-400">Era:</span> {selectedCharacter.era}
                        </div>
                        {selectedCharacter.nickname && (
                          <div>
                            <span className="text-gray-400">Nickname:</span> {selectedCharacter.nickname}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {selectedCharacter.wikipedia_summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              <p>Data source: <strong>"The World Beneath"</strong> podcast series</p>
              <a 
                href="https://podcasts.apple.com/podcast/the-world-beneath/id1234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Listen on Apple Podcasts →
              </a>
            </div>
            <div className="text-gray-500 text-sm">
              Made with <span className="text-red-500">♥</span> by Manus
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedApp;

