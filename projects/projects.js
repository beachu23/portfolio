import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
let filteredProjectsGlobal = [...projects];
let selectedIndex = -1;
let query = '';

renderProjects(filteredProjectsGlobal, projectsContainer, 'h2');
renderPieChart(filteredProjectsGlobal);

searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  filteredProjectsGlobal = projects.filter((project) => {
    const values = Object.values(project).join(' ').toLowerCase();
    return values.includes(query);
  });

  renderProjects(filteredProjectsGlobal, projectsContainer, 'h2');
  renderPieChart(filteredProjectsGlobal);
});

function renderPieChart(projectsGiven) {
  const svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  const legend = d3.select('.legend');
  legend.selectAll('li').remove();

  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', selectedIndex === i ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        svg
          .selectAll('path')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));

        legend
          .selectAll('li')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));

        if (selectedIndex === -1) {
          renderProjects(filteredProjectsGlobal, projectsContainer, 'h2');
        } else {
          const selectedYear = data[selectedIndex].label;
          const filtered = projects.filter((p) => {
            const values = Object.values(p).join(' ').toLowerCase();
            return values.includes(query) && p.year === selectedYear;
          });
          renderProjects(filtered, projectsContainer, 'h2');
        }
      });
  });

  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', selectedIndex === i ? 'selected' : '')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
