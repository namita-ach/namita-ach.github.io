// ---- TABS ----

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ---- SUBSTACK FEED ----

async function loadSubstackPosts() {
  const container = document.getElementById('blog-posts');
  const feedUrl = 'https://namitalearns.substack.com/feed';
  const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);

  const slowTimer = setTimeout(() => {
    const fallback = document.getElementById('blog-slow');
    if (fallback) fallback.style.display = 'block';
  }, 3000);

  try {
    const res = await fetch(proxyUrl);
    const data = await res.json();
    clearTimeout(slowTimer);

    if (data.status !== 'ok' || !data.items || data.items.length === 0) {
      container.innerHTML = '<p class="loading-text">Could not load posts. <a href="https://namitalearns.substack.com">Visit Substack</a></p>';
      return;
    }

    const posts = data.items.slice(0, 5);
    container.innerHTML = posts.map(post => {
      const date = new Date(post.pubDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
      const excerpt = stripHtml(post.description).slice(0, 160) + '...';

      return `
        <a href="${post.link}" target="_blank" rel="noopener" class="blog-post">
          <div class="blog-post-title">${escapeHtml(post.title)}</div>
          <div class="blog-post-date">${date}</div>
          <div class="blog-post-excerpt">${escapeHtml(excerpt)}</div>
        </a>
      `;
    }).join('');
    const slow = document.getElementById('blog-slow');
    if (slow) slow.style.display = 'none';
  } catch (e) {
    clearTimeout(slowTimer);
    container.innerHTML = '<p class="loading-text">Could not load posts. <a href="https://namitalearns.substack.com">Visit Substack</a></p>';
  }
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

loadSubstackPosts();

// ---- NOTES FROM GITHUB ----

async function loadNotes() {
  const container = document.getElementById('notes-grid');

  const slowTimer = setTimeout(() => {
    const fallback = document.getElementById('notes-slow');
    if (fallback) fallback.style.display = 'block';
  }, 3000);

  try {
    const res = await fetch('https://api.github.com/repos/namita-ach/NamitaWrites/contents');
    const items = await res.json();
    clearTimeout(slowTimer);

    if (!Array.isArray(items)) {
      container.innerHTML = '<p class="loading-text">Could not load notes. <a href="https://github.com/namita-ach/NamitaWrites">View on GitHub</a></p>';
      return;
    }

    const folders = items.filter(item => item.type === 'dir').sort((a, b) => a.name.localeCompare(b.name));

    if (folders.length === 0) {
      container.innerHTML = '<p class="loading-text">No notes yet.</p>';
      return;
    }

    container.innerHTML = folders.map(folder =>
      `<a href="${folder.html_url}" target="_blank" rel="noopener" class="note-card">${escapeHtml(folder.name)}</a>`
    ).join('');
    const slow = document.getElementById('notes-slow');
    if (slow) slow.style.display = 'none';
  } catch (e) {
    clearTimeout(slowTimer);
    container.innerHTML = '<p class="loading-text">Could not load notes. <a href="https://github.com/namita-ach/NamitaWrites">View on GitHub</a></p>';
  }
}

loadNotes();

// ---- SCROLL FADE-IN ----

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.news, footer').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  observer.observe(el);
});
