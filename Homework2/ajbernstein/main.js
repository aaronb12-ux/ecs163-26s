const tooltip = d3.select('.tooltip');

const typeColors = {
  Grass: '#78C850',
  Fire: '#F08030',
  Water: '#6890F0',
  Bug: '#A8B820',
  Normal: '#A8A878',
  Poison: '#A040A0',
  Electric: '#F8D030',
  Ground: '#E0C068',
  Fairy: '#EE99AC',
  Fighting: '#C03028',
  Psychic: '#F85888',
  Rock: '#B8A038',
  Ghost: '#705898',
  Ice: '#98D8D8',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Flying: '#A890F0'
};

// =========================
// LOAD DATA
// =========================


d3.csv('data/pokemon.csv').then(data => {

  data.forEach(d => {
    d.Attack = +d.Attack;
    d.Defense = +d.Defense;
    d.HP = +d.HP;
    d.Speed = +d.Speed;
    d.Sp_Atk = +d['Sp. Atk'];
    d.Sp_Def = +d['Sp. Def'];
    d.Total = +d.Total;
  });

  createBarChart(data);
  createScatterPlot(data);
  createParallelCoordinates(data.slice(0, 150));
});

// =========================
// BAR CHART
// OVERVIEW VISUALIZATION
// =========================

function createBarChart(data) {

  const svg = d3.select('#bar-chart');

  const width = 600;
  const height = 320;

  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const margin = {
    top: 20,
    right: 20,
    bottom: 70,
    left: 60
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const counts = d3.rollup(
    data,
    v => v.length,
    d => d.Type_1
  );

  const chartData = Array.from(counts, ([type, count]) => ({
    type,
    count
  }))
  .sort((a, b) => b.count - a.count);

  const x = d3.scaleBand()
    .domain(chartData.map(d => d.type))
    .range([0, chartWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => d.count)])
    .nice()
    .range([chartHeight, 0]);

  chart.append('g')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'white')
    .attr('transform', 'rotate(-35)')
    .style('text-anchor', 'end');

  chart.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'white');

  chart.selectAll('.bar')
    .data(chartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.type))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => chartHeight - y(d.count))
    .attr('fill', d => typeColors[d.type] || '#999')
    .on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 1)
        .html(`
          <strong>${d.type}</strong><br>
          Count: ${d.count}
        `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 20}px`);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 5)
    .attr('text-anchor', 'middle')
    .attr('class', 'axis-label')
    .text('Primary Pokémon Type');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', 18)
    .attr('text-anchor', 'middle')
    .attr('class', 'axis-label')
    .text('Count');
}

// =========================
// SCATTER PLOT
// =========================

function createScatterPlot(data) {

  const svg = d3.select('#scatter-plot');

  const width = 600;
  const height = 320;

  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const margin = {
    top: 20,
    right: 30,
    bottom: 60,
    left: 60
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Attack) + 20])
    .range([0, chartWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Defense) + 20])
    .range([chartHeight, 0]);

  chart.append('g')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'white');

  chart.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'white');

  chart.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.Attack))
    .attr('cy', d => y(d.Defense))
    .attr('r', 5)
    .attr('fill', d => typeColors[d.Type_1] || '#999')
    .attr('opacity', 0.75)
    .on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 1)
        .html(`
          <strong>${d.Name}</strong><br>
          Type: ${d.Type_1}<br>
          Attack: ${d.Attack}<br>
          Defense: ${d.Defense}<br>
          Total: ${d.Total}
        `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 20}px`);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 5)
    .attr('text-anchor', 'middle')
    .attr('class', 'axis-label')
    .text('Attack');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', 18)
    .attr('text-anchor', 'middle')
    .attr('class', 'axis-label')
    .text('Defense');

  // LEGEND

  const legend = svg.append('g')
    .attr('transform', 'translate(470, 20)');

  const legendTypes = ['Fire', 'Water', 'Grass', 'Electric'];

  legendTypes.forEach((type, i) => {

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', i * 20)
      .attr('r', 6)
      .attr('fill', typeColors[type]);

    legend.append('text')
      .attr('x', 12)
      .attr('y', i * 20 + 4)
      .attr('class', 'legend')
      .text(type);
  });
}

// =========================
// PARALLEL COORDINATES
// ADVANCED VISUALIZATION
// =========================

function createParallelCoordinates(data) {

  const svg = d3.select('#parallel-chart');

  const width = 1200;
  const height = 380;

  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const margin = {
    top: 40,
    right: 40,
    bottom: 20,
    left: 40
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const dimensions = [
    'HP',
    'Attack',
    'Defense',
    'Sp_Atk',
    'Sp_Def',
    'Speed'
  ];

  const y = {};

  dimensions.forEach(dim => {
    y[dim] = d3.scaleLinear()
      .domain(d3.extent(data, d => d[dim]))
      .range([chartHeight, 0]);
  });

  const x = d3.scalePoint()
    .domain(dimensions)
    .range([0, chartWidth]);

  function path(d) {
    return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));
  }

  chart.selectAll('myPath')
    .data(data)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', d => typeColors[d.Type_1] || '#999')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.4)
    .on('mouseover', (event, d) => {

      tooltip
        .style('opacity', 1)
        .html(`
          <strong>${d.Name}</strong><br>
          HP: ${d.HP}<br>
          Attack: ${d.Attack}<br>
          Defense: ${d.Defense}<br>
          Speed: ${d.Speed}
        `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 20}px`);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  dimensions.forEach(dim => {

    chart.append('g')
      .attr('transform', `translate(${x(dim)})`)
      .call(d3.axisLeft(y[dim]))
      .selectAll('text')
      .style('fill', 'white');

    chart.append('text')
      .attr('x', x(dim))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', '14px')
      .text(dim);
  });
}