import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CompletelyFixedApp = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterData, setCharacterData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [viewMode, setViewMode] = useState('full');
  const svgRef = useRef();

  // Load character data
  useEffect(() => {
    fetch('/enhanced_character_network.json')
      .then(response => response.json())
      .then(data => {
        console.log('Network data loaded:', data);
        setNetworkData(data);
      })
      .catch(error => console.error('Error loading network data:', error));

    fetch('/final_comprehensive_character_database.json')
      .then(response => response.json())
      .then(data => {
        console.log('Character data loaded:', data);
        setCharacterData(data);
      })
      .catch(error => console.error('Error loading character data:', error));
  }, []);

  // Get characters for selected category
  const getCharactersForCategory = (category) => {
    if (!characterData || !category) return [];
    
    console.log('Getting characters for category:', category);
    
    if (category === 'all') {
      const allCharacters = [];
      if (characterData.categories) {
        Object.values(characterData.categories).forEach(categoryData => {
          if (categoryData.characters) {
            allCharacters.push(...categoryData.characters);
          }
        });
      }
      return allCharacters;
    }
    
    // Filter by category
    let filteredCharacters = [];
    if (category === 'mob' && characterData.categories.mob) {
      filteredCharacters = characterData.categories.mob.characters || [];
    } else if (category === 'intelligence' && characterData.categories.intelligence) {
      filteredCharacters = characterData.categories.intelligence.characters || [];
    } else if (category === 'politics' && characterData.categories.politics) {
      filteredCharacters = characterData.categories.politics.characters || [];
    } else if (category === 'other' && characterData.categories.other) {
      filteredCharacters = characterData.categories.other.characters || [];
    }
    
    console.log('Filtered characters for', category, ':', filteredCharacters.length);
    return filteredCharacters;
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

    console.log('Visualization data:', { nodes: nodes.length, links: links.length });

    // Color scale for different types
    const colorScale = d3.scaleOrdinal()
      .domain(['mob', 'intelligence', 'politics', 'other'])
      .range(['#ef4444', '#3b82f6', '#10b981', '#f59e0b']);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter((width - margin.left - margin.right) / 2, (height - margin.top - margin.bottom) / 2))
      .force("collision", d3.forceCollide().radius(20));

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create link labels
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links)
      .enter().append("text")
      .text(d => d.relationship || d.type || '')
      .attr("font-size", "10px")
      .attr("fill", "#ccc")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none");

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

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => isIndividual && selectedCharacter && d.id === selectedCharacter.id ? 20 : 12)
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
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("dx", 15)
      .attr("dy", 4)
      .attr("fill", "#fff")
      .style("pointer-events", "none");

    // Add hover effects
    node.on("mouseover", function(event, d) {
      d3.select(this).attr("r", isIndividual && selectedCharacter && d.id === selectedCharacter.id ? 25 : 17);
      
      // Show tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "12px")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-size", "14px")
        .style("max-width", "300px");

      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`<strong>${d.id}</strong><br/>Type: ${d.type}<br/>Role: ${d.role}<br/>Organization: ${d.organization}<br/>Era: ${d.era}<br/><em>Click for full details</em>`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("r", isIndividual && selectedCharacter && d.id === selectedCharacter.id ? 20 : 12);
      d3.selectAll(".tooltip").remove();
    })
    .on("click", function(event, d) {
      // Find character in database using flexible matching
      const character = findCharacterInDatabase(d.id);
      if (character) {
        handleCharacterSelect(character);
      }
    });

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

      linkLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);
    });
  };

  // Find character in database with flexible matching
  const findCharacterInDatabase = (searchId) => {
    if (!characterData) return null;
    
    // Try exact match first
    for (const categoryData of Object.values(characterData.categories)) {
      if (categoryData.characters) {
        const exactMatch = categoryData.characters.find(char => 
          char.id === searchId || char.name === searchId
        );
        if (exactMatch) return exactMatch;
      }
    }
    
    // Try partial matches
    for (const categoryData of Object.values(characterData.categories)) {
      if (categoryData.characters) {
        const partialMatch = categoryData.characters.find(char => 
          char.name.includes(searchId) || searchId.includes(char.name) ||
          char.id.includes(searchId) || searchId.includes(char.id)
        );
        if (partialMatch) return partialMatch;
      }
    }
    
    return null;
  };

  // Create individual character network with ALL connections
  const createIndividualNetwork = (character) => {
    if (!networkData || !character) {
      console.log('Missing data for individual network:', { networkData: !!networkData, character: !!character });
      return;
    }

    console.log('Creating individual network for:', character.name);

    // Find all possible character identifiers
    const characterIds = [character.id, character.name];
    if (character.birth_name && character.birth_name !== character.name) {
      characterIds.push(character.birth_name);
    }
    if (character.nickname && character.nickname !== character.name) {
      characterIds.push(character.nickname);
    }

    console.log('Searching for character with IDs:', characterIds);

    // Find all connections for this character from the network data
    const characterConnections = {
      nodes: [],
      links: []
    };

    // Find the main character node using flexible matching
    let mainNode = null;
    for (const id of characterIds) {
      mainNode = networkData.nodes.find(n => 
        n.id === id || n.id.includes(id) || id.includes(n.id)
      );
      if (mainNode) break;
    }

    if (mainNode) {
      characterConnections.nodes.push({ ...mainNode });
      console.log('Added main node:', mainNode.id);
    } else {
      console.log('Main node not found for any of:', characterIds);
      // Create a node for the character if not found in network
      mainNode = {
        id: character.name,
        type: character.organization === 'Jewish Mob' || character.organization === 'Russian Mafia' || character.organization === 'Genovese Crime Family' ? 'mob' : 
              character.organization === 'FBI' || character.organization === 'OSS' ? 'intelligence' :
              character.organization === 'US Senate' ? 'politics' : 'other',
        role: character.role,
        organization: character.organization,
        era: character.era
      };
      characterConnections.nodes.push(mainNode);
    }

    // Track connected character IDs to avoid duplicates
    const connectedIds = new Set([mainNode.id]);
    
    // Find all direct connections (both incoming and outgoing) using flexible matching
    const directConnections = [];
    for (const id of characterIds) {
      const connections = networkData.links.filter(link => 
        link.source === id || link.target === id ||
        link.source.includes(id) || id.includes(link.source) ||
        link.target.includes(id) || id.includes(link.target)
      );
      directConnections.push(...connections);
    }

    console.log('Direct connections found:', directConnections.length);

    // Add all directly connected characters
    directConnections.forEach(link => {
      const connectedId = link.source === mainNode.id ? link.target : link.source;
      
      if (!connectedIds.has(connectedId)) {
        const connectedNode = networkData.nodes.find(n => n.id === connectedId);
        if (connectedNode) {
          characterConnections.nodes.push({ ...connectedNode });
          connectedIds.add(connectedId);
          console.log('Added connected node:', connectedNode.id);
        }
      }
      
      // Add the link
      characterConnections.links.push({ ...link });
    });

    // Find second-degree connections (connections of the connected characters)
    const secondDegreeConnections = [];
    connectedIds.forEach(connectedId => {
      if (connectedId !== mainNode.id) {
        const secondDegreeLinks = networkData.links.filter(link => 
          (link.source === connectedId || link.target === connectedId) &&
          !characterIds.includes(link.source) && !characterIds.includes(link.target)
        );
        
        secondDegreeLinks.forEach(link => {
          const secondDegreeId = link.source === connectedId ? link.target : link.source;
          
          if (!connectedIds.has(secondDegreeId)) {
            const secondDegreeNode = networkData.nodes.find(n => n.id === secondDegreeId);
            if (secondDegreeNode) {
              characterConnections.nodes.push({ ...secondDegreeNode });
              connectedIds.add(secondDegreeId);
              console.log('Added second-degree node:', secondDegreeNode.id);
            }
          }
          
          // Add the second-degree link
          const existingLink = secondDegreeConnections.find(existing => 
            (existing.source === link.source && existing.target === link.target) ||
            (existing.source === link.target && existing.target === link.source)
          );
          
          if (!existingLink) {
            secondDegreeConnections.push({ ...link });
          }
        });
      }
    });

    // Add second-degree links
    characterConnections.links.push(...secondDegreeConnections);

    console.log(`Individual network for ${character.name}:`, {
      nodes: characterConnections.nodes.length,
      links: characterConnections.links.length,
      nodeIds: characterConnections.nodes.map(n => n.id)
    });

    createVisualization(characterConnections, svgRef.current, true);
  };

  // Handle character selection
  const handleCharacterSelect = (character) => {
    console.log('Character selected:', character);
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
      console.log('Visualization data:', { nodes: networkData.nodes?.length, links: networkData.links?.length });
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

  const charactersForCategory = getCharactersForCategory(selectedCategory);

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
                  <option value="">Select a category...</option>
                  <option value="all">All Characters</option>
                  <option value="mob">Organized Crime</option>
                  <option value="intelligence">Intelligence & Law Enforcement</option>
                  <option value="politics">Political Figures</option>
                  <option value="other">Other Figures</option>
                </select>
              </div>

              {/* Character List */}
              {selectedCategory && charactersForCategory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Characters ({charactersForCategory.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {charactersForCategory.map((character, index) => (
                      <button
                        key={index}
                        onClick={() => handleCharacterSelect(character)}
                        className={`w-full px-3 py-2 rounded-md text-left transition-colors ${
                          selectedCharacter && selectedCharacter.id === character.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium">{character.name}</div>
                        <div className="text-sm text-gray-400">{character.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Organized Crime</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Intelligence</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Political</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">Other</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">
                {viewMode === 'individual' && selectedCharacter 
                  ? `${selectedCharacter.name} Network` 
                  : 'Complete Network'
                }
              </h2>
              
              {/* Network Visualization */}
              <div ref={svgRef} className="w-full"></div>
              
              {/* Character Details */}
              {selectedCharacter && (
                <div className="mt-8 bg-gray-700 rounded-lg p-6">
                  <div className="flex items-start space-x-6">
                    {selectedCharacter.photo_path && (
                      <img
                        src={selectedCharacter.photo_path}
                        alt={selectedCharacter.name}
                        className="w-24 h-24 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{selectedCharacter.name}</h3>
                      {selectedCharacter.birth_name && selectedCharacter.birth_name !== selectedCharacter.name && (
                        <p className="text-gray-300 mb-1"><strong>Born:</strong> {selectedCharacter.birth_name}</p>
                      )}
                      <p className="text-gray-300 mb-1"><strong>Role:</strong> {selectedCharacter.role}</p>
                      <p className="text-gray-300 mb-1"><strong>Organization:</strong> {selectedCharacter.organization}</p>
                      <p className="text-gray-300 mb-1"><strong>Era:</strong> {selectedCharacter.era}</p>
                      {selectedCharacter.nickname && (
                        <p className="text-gray-300 mb-1"><strong>Nickname:</strong> {selectedCharacter.nickname}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedCharacter.wikipedia_summary && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold mb-2">Biography:</h4>
                      <p className="text-gray-300 leading-relaxed">{selectedCharacter.wikipedia_summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-300 mb-2">Data source: "The World Beneath" podcast series</p>
            <a
              href="https://podcasts.apple.com/us/podcast/the-world-beneath/id1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Listen on Apple Podcasts →
            </a>
            <p className="text-gray-500 text-sm mt-4">Made with ♥ by Manus</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompletelyFixedApp;

