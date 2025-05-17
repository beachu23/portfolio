import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let data = await d3.csv('../lib/loc.csv', d3.autoType);

data.forEach(d => {
  d.timestamp = new Date(d.datetime);
});

displayStats(data);
vis1(data);
vis2(data);


function displayStats(data) {
  let commits = data.length;
  let authors = new Set(data.map(d => d.author)).size;
  let earliest = d3.min(data, d => d.timestamp);
  let latest = d3.max(data, d => d.timestamp);

  document.querySelector('#summary').innerHTML = `
    <dl>
      <dt>Commits</dt><dd>${commits}</dd>
      <dt>Authors</dt><dd>${authors}</dd>
      <dt>Earliest</dt><dd>${earliest.toLocaleDateString()}</dd>
      <dt>Latest</dt><dd>${latest.toLocaleDateString()}</dd>
    </dl>
  `;
}

function vis1(data) {
  let svg = d3.select('#vis1 svg');
  svg.selectAll('*').remove();

  svg.attr('width', 500).attr('height', 300);
  let margin = { top: 20, right: 20, bottom: 30, left: 30 };
  let width = +svg.attr('width') - margin.left - margin.right;
  let height = +svg.attr('height') - margin.top - margin.bottom;
  let g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  let hourCounts = d3.rollups(
    data,
    v => v.length,
    d => d.timestamp.getHours()
  ).sort((a, b) => a[0] - b[0]);

  let x = d3.scaleBand()
    .domain(hourCounts.map(d => d[0]))
    .range([0, width])
    .padding(0.1);

  let y = d3.scaleLinear()
    .domain([0, d3.max(hourCounts, d => d[1])])
    .range([height, 0]);

  g.append('g')
    .call(d3.axisLeft(y));

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}:00`));

  g.selectAll('rect')
    .data(hourCounts)
    .join('rect')
    .attr('x', d => x(d[0]))
    .attr('y', d => y(d[1]))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d[1]))
    .attr('fill', 'steelblue');
}

function vis2(data) {
  let svg = d3.select('#vis2 svg');
  svg.selectAll('*').remove();

  svg.attr('width', 600).attr('height', 300);
  let margin = { top: 20, right: 30, bottom: 30, left: 40 };
  let width = +svg.attr('width') - margin.left - margin.right;
  let height = +svg.attr('height') - margin.top - margin.bottom;
  let g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  let x = d3.scaleTime()
    .domain(d3.extent(data, d => d.timestamp))
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.lines_added + d.lines_deleted)])
    .nice()
    .range([height, 0]);

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append('g')
    .call(d3.axisLeft(y));

  g.selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', d => x(d.timestamp))
    .attr('cy', d => y(d.lines_added + d.lines_deleted))
    .attr('r', 4)
    .attr('fill', 'darkorange')
    .append('title')
    .text(d => `${d.author}\n+${d.lines_added}, -${d.lines_deleted}`);
}
