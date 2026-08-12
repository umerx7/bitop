export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div class="card" style="height:calc(100vh - var(--header-height) - 72px);display:flex;flex-direction:column;">
          <div class="card-header flex-between" style="padding:16px 24px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-center gap-3">
              <h3 class="card-title" style="margin:0;">Support Chat</h3>
              <span class="badge badge-success" id="agent-status">Agent Online</span>
            </div>
            <div class="flex-center gap-2">
              <button class="btn btn-ghost btn-icon" id="chat-settings" aria-label="Settings"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
              <button class="btn btn-ghost btn-icon" id="minimize-chat" aria-label="Minimize"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
            </div>
          </div>

          <div id="messages-container" style="flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px;"></div>

          <div style="padding:16px 24px;border-top:1px solid var(--border-muted);">
            <div class="flex-center gap-2" style="margin-bottom:12px;">
              <button class="btn btn-ghost btn-sm" id="attach-file" aria-label="Attach file"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05a9 9 0 0 1-12.74 7.93 9 9 0 0 1-5.76-13.56 9 9 0 0 1 12.74 7.93z"></path></svg></button>
              <button class="btn btn-ghost btn-sm" id="insert-emoji" aria-label="Emoji"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg></button>
              <button class="btn btn-ghost btn-sm" id="quick-replies" aria-label="Quick replies"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></button>
              <div style="flex:1;"></div>
              <span style="font-size:0.75rem;color:var(--text-muted);">Typically replies in a few minutes</span>
            </div>
            <form id="chat-form" class="flex-center gap-2">
              <input type="text" id="chat-input" placeholder="Type your message..." style="flex:1;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-lg);font-size:0.9375rem;" autocomplete="off">
              <button type="submit" class="btn btn-primary" id="send-message" style="padding:12px 24px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.messages = [];
    this.agentTyping = false;
    this.bindEvents();
    await this.loadChatHistory();
    this.connectWebSocket();
  },

  bindEvents() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const attachBtn = document.getElementById('attach-file');
    const emojiBtn = document.getElementById('insert-emoji');
    const quickBtn = document.getElementById('quick-replies');

    form.addEventListener('submit', (e) => this.sendMessage(e));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(e);
      }
    });

    attachBtn.addEventListener('click', () => this.attachFile());
    emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
    quickBtn.addEventListener('click', () => this.showQuickReplies());
  },

  async loadChatHistory() {
    try {
      const { default: api } = await import('../utils/api.js');
      const response = await api.getChatSessions({ limit: 1 });
      if (response.success && response.sessions.length > 0) {
        const session = response.sessions[0];
        const messagesRes = await api.getChatSession(session._id);
        if (messagesRes.success) {
          this.messages = messagesRes.messages;
          this.renderMessages();
        }
      } else {
        this.addWelcomeMessage();
      }
    } catch (error) {
      console.error('Chat history load error:', error);
      this.addWelcomeMessage();
    }
  },

  addWelcomeMessage() {
    this.addMessage({
      id: 'welcome',
      type: 'system',
      content: 'Welcome to BITOP Support! How can we help you today?',
      timestamp: Date.now()
    });
    this.addQuickReplies();
  },

  addQuickReplies() {
    const replies = [
      'Deposit/Withdrawal issues',
      'Trading questions',
      'Account verification',
      'API & technical support',
      'Security concerns',
      'Other'
    ];

    const container = document.createElement('div');
    container.className = 'quick-replies';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '8px';
    container.innerHTML = replies.map(r => `
      <button class="btn btn-ghost btn-sm quick-reply" data-reply="${r}">${r}</button>
    `).join('');

    container.querySelectorAll('.quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('chat-input').value = btn.dataset.reply;
        document.getElementById('chat-input').focus();
        container.remove();
      });
    });

    document.getElementById('messages-container').appendChild(container);
    this.scrollToBottom();
  },

  showQuickReplies() {
    this.addQuickReplies();
  },

  toggleEmojiPicker() {
    // Simple emoji picker
    const emojis = ['😀','😊','👍','👎','🔥','💎','🚀','📈','📉','💰','🎉','❓','✅','❌'];
    const container = document.createElement('div');
    container.className = 'emoji-picker';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '4px';
    container.style.padding = '8px';
    container.style.background = 'var(--bg-card)';
    container.style.border = '1px solid var(--border-muted)';
    container.style.borderRadius = 'var(--radius-md)';
    container.innerHTML = emojis.map(e => `<button class="emoji-btn" style="font-size:1.25rem;background:none;border:none;cursor:pointer;padding:4px;" data-emoji="${e}">${e}</button>`).join('');

    container.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        input.value += btn.dataset.emoji;
        input.focus();
        container.remove();
      });
    });

    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.appendChild(container);
    this.scrollToBottom();
  },

  attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.txt,.csv';
    input.onchange = (e) => this.uploadFile(e.target.files[0]);
    input.click();
  },

  async uploadFile(file) {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    const messageId = 'msg-' + Date.now();
    this.addMessage({
      id: messageId,
      type: 'user',
      content: `📎 ${file.name} (${this.formatFileSize(file.size)})`,
      timestamp: Date.now(),
      status: 'sending'
    });

    try {
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        this.updateMessage(messageId, { content: `📎 <a href="${data.url}" target="_blank">${file.name}</a>`, status: 'sent' });
      } else {
        this.updateMessage(messageId, { status: 'failed' });
      }
    } catch (error) {
      this.updateMessage(messageId, { status: 'failed' });
    }
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  async sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    
    const messageId = 'msg-' + Date.now();
    this.addMessage({
      id: messageId,
      type: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'sending'
    });

    try {
      const { default: api } = await import('../utils/api.js');
      // First ensure we have a session
      let sessionRes = await api.getChatSessions({ limit: 1 });
      let sessionId;
      
      if (sessionRes.success && sessionRes.sessions.length > 0) {
        sessionId = sessionRes.sessions[0]._id;
      } else {
        const newSession = await api.createChatSession({ subject: 'Support', category: 'general' });
        if (newSession.success) {
          sessionId = newSession.session._id;
        }
      }
      
      if (sessionId) {
        const response = await api.sendMessage(sessionId, text, 'chat');
        if (response.success) {
          this.updateMessage(messageId, { status: 'sent' });
        } else {
          this.updateMessage(messageId, { status: 'failed' });
        }
      } else {
        this.updateMessage(messageId, { status: 'failed' });
      }
    } catch (error) {
      this.updateMessage(messageId, { status: 'failed' });
    }
  },

  addMessage(message) {
    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  },

  updateMessage(id, updates) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) Object.assign(msg, updates);
    this.renderMessages();
  },

  renderMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    this.messages.forEach(m => this.renderMessage(m));
    this.scrollToBottom();
  },

  renderMessage(message) {
    const container = document.getElementById('messages-container');
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    const el = document.createElement('div');
    el.id = `msg-${message.id}`;
    el.style.display = 'flex';
    el.style.flexDirection = isUser ? 'row-reverse' : 'row';
    el.style.gap = '8px';
    el.style.maxWidth = '85%';
    el.style.alignSelf = isUser ? 'flex-end' : 'flex-start';

    if (isSystem) {
      el.style.alignSelf = 'center';
      el.style.maxWidth = '100%';
      el.innerHTML = `<div style="padding:8px 16px;background:var(--bg-secondary);border-radius:var(--radius-lg);color:var(--text-secondary);font-size:0.875rem;text-align:center;">${message.content}</div>`;
    } else {
      el.innerHTML = `
        <div class="flex-col gap-2" style="${isUser ? 'align-items:flex-end;' : ''}">
          <div style="padding:12px 16px;background:${isUser ? 'var(--accent-primary)' : 'var(--bg-card)'};border:${isUser ? 'none' : '1px solid var(--border-muted)'};border-radius:var(--radius-lg);max-width:400px;">
            <div style="color:${isUser ? 'white' : 'var(--text-primary)'};">${message.content}</div>
            <div style="font-size:0.625rem;color:${isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'};margin-top:4px;display:flex;align-items:center;gap:4px;">
              <span>${new Date(message.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
              ${isUser ? `<span class="message-status" data-status="${message.status}">${this.getStatusIcon(message.status)}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    container.appendChild(el);
  },

  getStatusIcon(status) {
    switch (status) {
      case 'sending': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>';
      case 'sent': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      case 'failed': return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      default: return '';
    }
  },

  scrollToBottom() {
    const container = document.getElementById('messages-container');
    container.scrollTop = container.scrollHeight;
  },

  connectWebSocket() {
    // WebSocket connection for real-time messages
    // Implementation depends on backend WS setup
  },

  receiveMessage(message) {
    this.addMessage({
      id: message.id || 'msg-' + Date.now(),
      type: 'agent',
      content: message.content,
      timestamp: Date.now()
    });
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};