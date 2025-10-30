async function loadVideos(){
  const el = document.getElementById('list');
  try{
    const res = await fetch('/videos');
    const data = await res.json();
    if(!data.length){ el.innerHTML = '<p>No videos</p>'; return }
    el.innerHTML = '';
    data.forEach(v=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <a href="/watch.html?id=${v.id}">
          <div class="title">${escapeHtml(v.title)}</div>
          <div class="desc">${escapeHtml(v.description || '')}</div>
          <div class="meta">Likes: ${v.likes}</div>
        </a>
      `;
      el.appendChild(card);
    })
  }catch(e){ el.innerText = 'Failed to load videos' }
}

function escapeHtml(s){ return String(s)
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
}

window.addEventListener('DOMContentLoaded', loadVideos);
