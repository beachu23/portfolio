// global.js
console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume.html', title: 'Resume' },
  { url: 'https://github.com/beachu23', title: 'GitHub' },
  { url: 'meta/', title: 'Meta'}  
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/"; 

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;
  nav.append(a);

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  // Open external links in new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

let select = document.querySelector('select');

select.addEventListener('input', function(event) {
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value;
});

if ("colorScheme" in localStorage) {
  document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  select.value = localStorage.colorScheme;
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  for (let project of projects) {
    const article = document.createElement('article');

    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <div class="project-description">
        <p>${project.description}</p>
        <p class="project-year">${project.year}</p>
      </div>
    `;

    containerElement.appendChild(article);
  }
}




export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
