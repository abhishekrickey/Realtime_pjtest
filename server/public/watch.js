function qs(name){
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

function randUser(){ return 'User_' + Math.random().toString(36).slice(2,8) }

(async function(){
  const videoId = qs('id');
  if(!videoId){ document.getElementById('title').innerText = 'No video id'; return }

  const res = await fetch('/videos/' + videoId);
  if(!res.ok){ document.getElementById('title').innerText = 'Video not found'; return }
  const vid = await res.json();

  document.getElementById('title').innerText = vid.title;
  const player = document.getElementById('player');
  player.src = vid.url;
  document.getElementById('description').innerText = vid.description || '';
  document.getElementById('likesCount').innerText = String(vid.likes || 0);

  const socket = io();
  const user = randUser();

  socket.emit('joinVideo', videoId);

  const commentsList = document.getElementById('commentsList');

  socket.on('comments:init', (items) => {
    commentsList.innerHTML = items.length ? '' : 'No comments yet';
    items.forEach(addComment);
  });

  socket.on('comment:new', (c) => {
    if(commentsList.innerText === 'No comments yet') commentsList.innerHTML = '';
    addComment(c);
  });

  socket.on('likes:update', (d) => {
    if(d && d.videoId === videoId){
      document.getElementById('likesCount').innerText = String(d.likes);
    }
  });

  document.getElementById('commentForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if(!text) return;
    socket.emit('comment', { videoId, user, text });
    input.value = '';
  });

  document.getElementById('likeBtn').addEventListener('click', ()=>{
    socket.emit('like', { videoId });
  });

  function addComment(c){
    const d = document.createElement('div');
    d.className = 'comment';
    d.innerHTML = `<strong>${escapeHtml(c.user)}</strong> <div>${escapeHtml(c.text)}</div> <div class="ts">${new Date(c.ts).toLocaleString()}</div>`;
    commentsList.appendChild(d);
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
})();
