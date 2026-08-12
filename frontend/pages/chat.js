export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div class="card" style="height:calc(100vh - var(--header-height) - 72px);display:flex;flex-direction:column;">
          <div class="card-header flex-between" style="padding:16px 24px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-center gap-3">
              <h3 class="card-title" style="margin:0;">💬 Community Chat</h3>
              <span class="badge badge-success" id="online-count">0 online</span>
            </div>
            <div class="flex-center gap-2">
              <button class="btn btn-ghost btn-icon" id="chat-settings" aria-label="Settings"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
              <button class="btn btn-ghost btn-icon" id="clear-chat" aria-label="Clear chat"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            </div>
          </div>

          <div id="messages-container" style="flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:12px;"></div>

          <div style="padding:16px 24px;border-top:1px solid var(--border-muted);">
            <div class="flex-center gap-2" style="margin-bottom:12px;">
              <button class="btn btn-ghost btn-sm" id="quick-topics" aria-label="Quick topics"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg></button>
              <button class="btn btn-ghost btn-sm" id="insert-emoji" aria-label="Emoji"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg></button>
              <div style="flex:1;"></div>
              <span style="font-size:0.75rem;color:var(--text-muted);">AI Assistant responds automatically • Everyone sees all messages</span>
            </div>
            <form id="chat-form" class="flex-center gap-2">
              <input type="text" id="chat-input" placeholder="Ask BITOP AI anything... (e.g., 'How do I deposit?', 'Trading fees?')" style="flex:1;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-lg);font-size:0.9375rem;" autocomplete="off">
              <button type="submit" class="btn btn-primary" id="send-message" style="padding:12px 24px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.messages = [];
    this.currentUser = null;
    this.bindEvents();
    await this.loadCurrentUser();
    await this.loadMessages();
    this.connectWebSocket();
    this.startOnlineUsersUpdater();
  },

  async loadCurrentUser() {
    try {
      const { default: auth } = await import('../utils/auth.js');
      this.currentUser = auth.getUser();
    } catch (e) {
      console.error('Load user error:', e);
    }
  },

  bindEvents() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const quickBtn = document.getElementById('quick-topics');
    const emojiBtn = document.getElementById('insert-emoji');
    const clearBtn = document.getElementById('clear-chat');

    form.addEventListener('submit', (e) => this.sendMessage(e));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(e);
      }
    });

    quickBtn.addEventListener('click', () => this.showQuickTopics());
    emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
    clearBtn.addEventListener('click', () => this.clearChat());
  },

  async loadMessages() {
    try {
      const { default: api } = await import('../utils/api.js');
      const response = await api.getPublicMessages({ limit: 50 });
      if (response.success) {
        this.messages = response.messages;
        this.renderMessages();
      }
    } catch (error) {
      console.error('Load messages error:', error);
      this.addWelcomeMessage();
    }
  },

  addWelcomeMessage() {
    this.addMessage({
      id: 'welcome',
      user: { name: 'BITOP AI', avatar: null },
      message: 'Welcome to BITOP Community Chat! 👋 I\'m your AI assistant. Ask me anything about trading, deposits, KYC, security, referrals, or fees. Everyone here can see all messages!',
      sender: 'ai',
      isAiResponse: true,
      createdAt: new Date().toISOString()
    });
  },

  showQuickTopics() {
    const topics = [
      'How do I deposit?',
      'Trading fees?',
      'Enable 2FA',
      'KYC requirements',
      'Withdrawal limits',
      'Referral program',
      'API access',
      'Supported coins'
    ];

    const container = document.createElement('div');
    container.className = 'quick-topics';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '8px';
    container.style.marginBottom = '12px';
    container.innerHTML = topics.map(t => `
      <button class="btn btn-ghost btn-sm quick-topic" data-topic="${t}">${t}</button>
    `).join('');

    container.querySelectorAll('.quick-topic').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('chat-input').value = btn.dataset.topic;
        document.getElementById('chat-input').focus();
        container.remove();
      });
    });

    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.appendChild(container);
    this.scrollToBottom();
  },

  toggleEmojiPicker() {
    const emojis = ['😀','😊','👍','👎','🔥','💎','🚀','📈','📉','💰','🎉','❓','✅','❌','🤖','💡'];
    const container = document.createElement('div');
    container.className = 'emoji-picker';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '4px';
    container.style.padding = '8px';
    container.style.background = 'var(--bg-card)';
    container.style.border = '1px solid var(--border-muted)';
    container.style.borderRadius = 'var(--radius-md)';
    container.style.marginBottom = '12px';
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

  clearChat() {
    this.messages = [];
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    this.addWelcomeMessage();
  },

  async sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.disabled = true;

    try {
      const { default: api } = await import('../utils/api.js');
      await api.sendPublicMessage(text);
    } catch (error) {
      console.error('Send message error:', error);
      input.disabled = false;
    }
  },

  addMessage(message) {
    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  },

  renderMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    this.messages.forEach(m => this.renderMessage(m));
    this.scrollToBottom();
  },

  renderMessage(message) {
    const container = document.getElementById('messages-container');
    const isAI = message.sender === 'ai' || message.isAiResponse;
    const isCurrentUser = this.currentUser && message.user?._id === this.currentUser.id;

    const el = document.createElement('div');
    el.id = `msg-${message.id}`;
    el.style.display = 'flex';
    el.style.flexDirection = isCurrentUser && !isAI ? 'row-reverse' : 'row';
    el.style.gap = '8px';
    el.style.maxWidth = '85%';
    el.style.alignSelf = isCurrentUser && !isAI ? 'flex-end' : 'flex-start';

    const avatarInitial = message.user?.name?.charAt(0).toUpperCase() || (isAI ? '🤖' : 'U');
    const avatarColor = isAI 
      ? 'linear-gradient(135deg, #00d4ff, #ffd700)' 
      : 'linear-gradient(135deg, #00d4ff, #ffd700)';
    const bubbleBg = isAI ? 'var(--bg-secondary)' : (isCurrentUser ? 'var(--accent-primary)' : 'var(--bg-card)');
    const bubbleBorder = isAI ? '1px solid var(--gold-primary)' : (isCurrentUser ? 'none' : '1px solid var(--border-muted)');
    const textColor = isCurrentUser && !isAI ? 'white' : 'var(--text-primary)';

    el.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:${avatarColor};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;color:#000;flex-shrink:0;">${isAI ? '🤖' : avatarInitial}</div>
      <div class="flex-col gap-2" style="${isCurrentUser && !isAI ? 'align-items:flex-end;' : ''}max-width:100%;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
          <span style="font-weight:600;font-size:0.8125rem;color:var(--text-primary);">${isAI ? 'BITOP AI 🤖' : (message.user?.name || 'User')}</span>
          <span style="font-size:0.625rem;color:var(--text-muted);">${new Date(message.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
          ${isAI ? '<span class="badge badge-gold" style="font-size:0.5rem;padding:2px 6px;">AI</span>' : ''}
        </div>
        <div style="padding:12px 16px;background:${bubbleBg};border:${bubbleBorder};border-radius:var(--radius-lg);max-width:100%;word-wrap:break-word;">
          <div style="color:${textColor};line-height:1.5;">${this.formatMessage(message.message)}</div>
        </div>
      </div>
    `;

    container.appendChild(el);
  },

  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:var(--bg-primary);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.875rem;">$1</code>')
      .replace(/\n/g, '<br>');
  },

  scrollToBottom() {
    const container = document.getElementById('messages-container');
    container.scrollTop = container.scrollHeight;
  },

  connectWebSocket() {
    import('../utils/websocket.js').then(({ default: ws }) => {
      ws.on('public-chat:message', (data) => {
        if (data.message && !this.messages.find(m => m.id === data.message.id)) {
          this.addMessage(data.message);
        }
      });
      
      ws.emit('join-room', 'public-chat');
    }).catch(err => console.warn('WebSocket not available:', err));
  },

  startOnlineUsersUpdater() {
    this.onlineInterval = setInterval(async () => {
      try {
        const { default: api } = await import('../utils/api.js');
        const response = await api.getOnlineUsers();
        if (response.success) {
          const count = response.users?.length || 0;
          document.getElementById('online-count').textContent = `${count} online`;
        }
      } catch (e) {
        // silent
      }
    }, 30000);
  },

  destroy() {
    if (this.onlineInterval) clearInterval(this.onlineInterval);
    import('../utils/websocket.js').then(({ default: ws }) => {
      ws.emit('leave-room', 'public-chat');
    }).catch(() => {});
  }
};