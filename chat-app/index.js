
const USERS = [
    { id: 'u1', name: 'Alice', avatar: 'AL', color: 'av-1' },
    { id: 'u2', name: 'Bob', avatar: 'BO', color: 'av-2' },
    { id: 'u3', name: 'Carol', avatar: 'CA', color: 'av-3' },
    { id: 'u4', name: 'Dave', avatar: 'DA', color: 'av-4' },
    { id: 'u5', name: 'Eve', avatar: 'EV', color: 'av-5' },
    { id: 'u6', name: 'Frank', avatar: 'FR', color: 'av-6' },
];

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '🎉', '🔥', '👍', '👋', '❤️', '💯', '✨', '🙏', '😴', '🤣', '🫡', '💪'];

const DEFAULT_GROUPS = [
    { id: 'g1', name: 'Dev Team', desc: 'Engineering discussions', emoji: '💻', members: ['u1', 'u2', 'u3', 'u4'] },
    { id: 'g2', name: 'Friends', desc: 'Weekend plans & fun', emoji: '🎉', members: ['u1', 'u2', 'u5', 'u6'] },
    { id: 'g3', name: 'Announcements', desc: 'Company-wide updates', emoji: '📣', members: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] },
];

let me = null;
let channel = null;
let state = {
    chats: {},   // chatId -> { type, name, members, messages, unread }
    activeChat: null,
    tab: 'all',
    typingMap: {},  // chatId -> { userId: timeout }
};
let typingTimer = null;

// ── LOGIN ──────────────────────────────────────────────────────────────────
function renderLoginUsers() {
    const wrap = document.getElementById('user-picks');
    wrap.innerHTML = USERS.map(u => `
    <div class="user-pick" id="pick-${u.id}" onclick="selectUser('${u.id}')">
      <div class="avatar ${u.color}">${u.avatar}</div>
      <div class="uname">${u.name}</div>
    </div>
  `).join('');
}

function selectUser(uid) {
    document.querySelectorAll('.user-pick').forEach(el => el.classList.remove('active'));
    document.getElementById('pick-' + uid).classList.add('active');
    me = USERS.find(u => u.id === uid);
}

function enterApp() {
    if (!me) { alert('Please pick a user first!'); return; }
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
}

// ── INIT ──────────────────────────────────────────────────────────────────
function initApp() {
    // Set up header
    const meavatar = document.getElementById('sb-me-avatar');
    meavatar.innerHTML = `<span class="${me.color}" style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;">${me.avatar}</span><div class="me-online"></div>`;
    document.getElementById('sb-me-name').textContent = me.name;
    document.getElementById('sb-me-tag').textContent = '@' + me.name.toLowerCase();

    // Seed DMs (with every other user)
    USERS.filter(u => u.id !== me.id).forEach(u => {
        const cid = dmId(me.id, u.id);
        if (!state.chats[cid]) state.chats[cid] = { id: cid, type: 'dm', peer: u, messages: [], unread: 0 };
    });

    // Seed groups
    DEFAULT_GROUPS.forEach(g => {
        if (g.members.includes(me.id)) {
            if (!state.chats[g.id]) state.chats[g.id] = { id: g.id, type: 'group', name: g.name, desc: g.desc, emoji: g.emoji, members: g.members, messages: [], unread: 0 };
        }
    });

    // BroadcastChannel (simulated WebSocket)
    channel = new BroadcastChannel('chatterbox');
    channel.onmessage = handleIncoming;

    // Announce presence
    broadcast({ type: 'presence', userId: me.id });

    renderSidebar();
    buildGroupMemberChecks();
    buildEmojiPanel();
}

function dmId(a, b) { return [a, b].sort().join('_'); }

// ── BROADCAST ─────────────────────────────────────────────────────────────
function broadcast(data) {
    data.from = me.id;
    channel.postMessage(data);
}

function handleIncoming(event) {
    const d = event.data;
    if (d.from === me.id) return;

    if (d.type === 'message') {
        const chat = state.chats[d.chatId];
        if (!chat) {
            // New group created by someone else — join it
            if (d.chatMeta && d.chatMeta.members && d.chatMeta.members.includes(me.id)) {
                state.chats[d.chatId] = { ...d.chatMeta, messages: [], unread: 0 };
            } else return;
        }
        const msg = d.msg;
        state.chats[d.chatId].messages.push(msg);
        if (state.activeChat === d.chatId) {
            renderMessage(msg, d.chatId);
            scrollToBottom();
        } else {
            state.chats[d.chatId].unread = (state.chats[d.chatId].unread || 0) + 1;
            showToast(d.from, msg.text, d.chatId);
        }
        renderSidebar();
        clearTyping(d.chatId, d.from);
    }

    if (d.type === 'typing') {
        if (d.chatId !== state.activeChat) return;
        if (!state.typingMap[d.chatId]) state.typingMap[d.chatId] = {};
        if (state.typingMap[d.chatId][d.from]) clearTimeout(state.typingMap[d.chatId][d.from]);
        state.typingMap[d.chatId][d.from] = setTimeout(() => clearTyping(d.chatId, d.from), 2500);
        renderTyping(d.chatId);
    }

    if (d.type === 'new_group') {
        if (d.group.members.includes(me.id) && !state.chats[d.group.id]) {
            state.chats[d.group.id] = { ...d.group, messages: [], unread: 0 };
            renderSidebar();
        }
    }

    if (d.type === 'presence') { }
}

function clearTyping(chatId, uid) {
    if (state.typingMap[chatId]) delete state.typingMap[chatId][uid];
    if (state.activeChat === chatId) renderTyping(chatId);
}

function renderTyping(chatId) {
    const row = document.getElementById('typing-row');
    const typers = Object.keys(state.typingMap[chatId] || {});
    if (!typers.length) { row.innerHTML = ''; return; }
    const names = typers.map(id => USERS.find(u => u.id === id)?.name || id);
    row.innerHTML = `<span style="font-size:12px;color:var(--muted);">${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} typing…</span>`;
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────
function setTab(tab, el) {
    state.tab = tab;
    document.querySelectorAll('.sb-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderSidebar();
}

function filterChats(q) { renderSidebar(q.toLowerCase()); }

function renderSidebar(filter = '') {
    const list = document.getElementById('sb-list');
    const chats = Object.values(state.chats).filter(c => {
        if (state.tab === 'dm' && c.type !== 'dm') return false;
        if (state.tab === 'group' && c.type !== 'group') return false;
        const label = c.type === 'dm' ? c.peer.name : c.name;
        return label.toLowerCase().includes(filter);
    }).sort((a, b) => {
        const at = a.messages.length ? a.messages[a.messages.length - 1].ts : 0;
        const bt = b.messages.length ? b.messages[b.messages.length - 1].ts : 0;
        return bt - at;
    });

    list.innerHTML = chats.map(c => {
        const isActive = c.id === state.activeChat;
        const last = c.messages[c.messages.length - 1];
        const preview = last ? (last.sender === me.id ? 'You: ' : '') + (last.text || '📷 Image') : 'No messages yet';
        const timeStr = last ? fmtTime(last.ts) : '';
        if (c.type === 'dm') {
            const u = c.peer;
            return `<div class="chat-item${isActive ? ' active' : ''}" onclick="openChat('${c.id}')">
        <div class="ci-avatar ${u.color}">${u.avatar}<div class="ci-dot"></div></div>
        <div class="ci-info">
          <div class="ci-top"><span class="ci-name">${u.name}</span><span class="ci-time">${timeStr}</span></div>
          <div class="ci-preview">${esc(preview)}</div>
        </div>
        ${c.unread ? `<div class="ci-badge">${c.unread}</div>` : ''}
      </div>`;
        } else {
            return `<div class="chat-item${isActive ? ' active' : ''}" onclick="openChat('${c.id}')">
        <div class="ci-avatar av-7" style="font-size:20px;">${c.emoji || '👥'}</div>
        <div class="ci-info">
          <div class="ci-top"><span class="ci-name">${esc(c.name)}</span><span class="ci-time">${timeStr}</span></div>
          <div class="ci-preview">${esc(preview)}</div>
        </div>
        ${c.unread ? `<div class="ci-badge">${c.unread}</div>` : ''}
      </div>`;
        }
    }).join('') || '<div style="text-align:center;color:var(--muted);padding:30px 0;font-size:13px;">No chats found</div>';
}

// ── OPEN CHAT ─────────────────────────────────────────────────────────────
function openChat(chatId) {
    state.activeChat = chatId;
    const chat = state.chats[chatId];
    chat.unread = 0;

    document.getElementById('no-chat').classList.add('hidden');
    document.getElementById('chat-view').classList.remove('hidden');
    document.getElementById('typing-row').innerHTML = '';
    document.getElementById('emoji-panel').classList.add('hidden');

    const avEl = document.getElementById('ch-avatar');
    const nameEl = document.getElementById('ch-name');
    const subEl = document.getElementById('ch-sub');
    const membersBtn = document.getElementById('members-btn');

    if (chat.type === 'dm') {
        const u = chat.peer;
        avEl.className = `ch-avatar ${u.color}`;
        avEl.textContent = u.avatar;
        nameEl.textContent = u.name;
        subEl.textContent = 'Online';
        membersBtn.classList.add('hidden');
    } else {
        avEl.className = 'ch-avatar av-7';
        avEl.style.fontSize = '20px';
        avEl.textContent = chat.emoji || '👥';
        nameEl.textContent = chat.name;
        const members = chat.members.map(id => USERS.find(u => u.id === id)?.name || id);
        subEl.textContent = members.join(', ');
        membersBtn.classList.remove('hidden');
    }

    const area = document.getElementById('messages-area');
    area.innerHTML = '';
    chat.messages.forEach(msg => renderMessage(msg, chatId));

    if (!chat.messages.length) {
        area.innerHTML = `<div class="system-msg">No messages yet. Say hello! 👋</div>`;
    }

    scrollToBottom();
    renderSidebar();
    document.getElementById('msg-input').focus();
}

function renderMessage(msg, chatId) {
    const area = document.getElementById('messages-area');
    if (!area) return;

    // Remove empty placeholder
    const placeholder = area.querySelector('.system-msg');
    if (placeholder) placeholder.remove();

    const isSent = msg.sender === me.id;
    const sender = USERS.find(u => u.id === msg.sender);
    const chat = state.chats[chatId];
    const showName = chat && chat.type === 'group' && !isSent;

    const div = document.createElement('div');
    div.className = `msg-row ${isSent ? 'sent' : 'received'}`;
    div.innerHTML = `
    ${!isSent ? `<div class="msg-avatar ${sender?.color || 'av-5'}">${sender?.avatar || '?'}</div>` : ''}
    <div>
      <div class="msg-bubble">
        ${showName ? `<div class="msg-name" style="color:${avatarColor(sender?.color)}">${sender?.name}</div>` : ''}
        ${msg.text ? `<div>${esc(msg.text)}</div>` : ''}
        <div class="msg-time">${fmtTime(msg.ts)}${isSent ? ' ✓✓' : ''}</div>
      </div>
    </div>
  `;
    area.appendChild(div);
}

function avatarColor(cls) {
    const map = { 'av-1': '#a89dff', 'av-2': '#4ade80', 'av-3': '#fbbf24', 'av-4': '#f87171', 'av-5': '#22d3ee', 'av-6': '#f472b6', 'av-7': '#c084fc', 'av-8': '#34d399' };
    return map[cls] || '#a89dff';
}

// ── SEND ──────────────────────────────────────────────────────────────────
function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text || !state.activeChat) return;

    const msg = { id: uid(), sender: me.id, text, ts: Date.now() };
    const chat = state.chats[state.activeChat];
    chat.messages.push(msg);
    renderMessage(msg, state.activeChat);
    scrollToBottom();
    renderSidebar();

    broadcast({ type: 'message', chatId: state.activeChat, msg, chatMeta: chat.type === 'group' ? { id: chat.id, type: 'group', name: chat.name, desc: chat.desc, emoji: chat.emoji, members: chat.members } : null });

    input.value = '';
    input.style.height = '';
    clearTimeout(typingTimer);
}

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function onTyping() {
    if (!state.activeChat) return;
    broadcast({ type: 'typing', chatId: state.activeChat });
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => { }, 2000);
}

function autoResize(el) {
    el.style.height = '';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

// ── EMOJI ─────────────────────────────────────────────────────────────────
function buildEmojiPanel() {
    const panel = document.getElementById('emoji-panel');
    panel.innerHTML = EMOJIS.map(e => `<span onclick="insertEmoji('${e}')">${e}</span>`).join('');
}

function toggleEmoji() {
    document.getElementById('emoji-panel').classList.toggle('hidden');
}

function insertEmoji(e) {
    const input = document.getElementById('msg-input');
    input.value += e;
    input.focus();
    document.getElementById('emoji-panel').classList.add('hidden');
}

// ── GROUPS ────────────────────────────────────────────────────────────────
function buildGroupMemberChecks() {
    const wrap = document.getElementById('group-members');
    wrap.innerHTML = USERS.filter(u => u.id !== me.id).map(u => `
    <label class="member-check">
      <input type="checkbox" value="${u.id}">
      <div class="ava ${u.color}">${u.avatar}</div>
      <span style="font-size:13px;">${u.name}</span>
    </label>
  `).join('');
}

function createGroup() {
    const name = document.getElementById('gname').value.trim();
    if (!name) { alert('Please enter a group name'); return; }
    const selected = [...document.querySelectorAll('#group-members input:checked')].map(i => i.value);
    const members = [me.id, ...selected];
    const emojis = ['🚀', '💡', '🎯', '🌟', '⚡', '🎨', '🌈', '🔮'];
    const group = {
        id: 'g_' + uid(),
        type: 'group',
        name,
        desc: document.getElementById('gdesc').value.trim() || 'Group chat',
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        members,
        messages: [],
        unread: 0,
    };
    state.chats[group.id] = group;

    const sysMsg = { id: uid(), sender: 'system', text: `${me.name} created this group`, ts: Date.now() };
    group.messages.push(sysMsg);

    broadcast({ type: 'new_group', group });
    broadcast({ type: 'message', chatId: group.id, msg: sysMsg, chatMeta: { id: group.id, type: 'group', name: group.name, desc: group.desc, emoji: group.emoji, members: group.members } });

    hideModal('group-modal');
    renderSidebar();
    openChat(group.id);

    document.getElementById('gname').value = '';
    document.getElementById('gdesc').value = '';
    document.querySelectorAll('#group-members input').forEach(i => i.checked = false);
}

function showMembers() {
    const chat = state.chats[state.activeChat];
    if (!chat || chat.type !== 'group') return;
    document.getElementById('mm-title').textContent = chat.name + ' — Members';
    const list = document.getElementById('mm-list');
    list.innerHTML = chat.members.map(id => {
        const u = USERS.find(u => u.id === id);
        if (!u) return '';
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
      <div class="${u.color}" style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;">${u.avatar}</div>
      <div>
        <div style="font-weight:500;">${u.name} ${u.id === me.id ? '<span style="font-size:11px;color:var(--muted);">(you)</span>' : ''}</div>
        <div style="font-size:12px;color:var(--muted);">@${u.name.toLowerCase()}</div>
      </div>
      <div style="margin-left:auto;width:8px;height:8px;background:var(--green);border-radius:50%;"></div>
    </div>`;
    }).join('');
    showModal('members-modal');
}

// ── MODALS ────────────────────────────────────────────────────────────────
function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
function hideModal(id) { document.getElementById(id).classList.add('hidden'); }
function closeModalIf(e, id) { if (e.target.id === id) hideModal(id); }

// ── TOAST ─────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(fromId, text, chatId) {
    const user = USERS.find(u => u.id === fromId);
    const chat = state.chats[chatId];
    const chatName = chat?.type === 'group' ? chat.name : user?.name || fromId;
    document.getElementById('t-name').textContent = chatName;
    document.getElementById('t-msg').textContent = (chat?.type === 'group' ? (user?.name + ': ') : '') + (text || 'New message');
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    toast.onclick = () => { openChat(chatId); toast.classList.remove('show'); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── UTIL ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }
function scrollToBottom() {
    const a = document.getElementById('messages-area');
    if (a) { a.scrollTop = a.scrollHeight; }
}
function fmtTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── BOOT ──────────────────────────────────────────────────────────────────
renderLoginUsers();

document.addEventListener('click', (e) => {
    const panel = document.getElementById('emoji-panel');
    if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !e.target.closest('.icon-btn')) {
        panel.classList.add('hidden');
    }
});
