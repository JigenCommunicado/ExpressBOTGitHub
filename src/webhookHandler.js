const GitHubAPI = require('./github');

class WebhookHandler {
  constructor(githubAPI, botCommands) {
    this.github = githubAPI;
    this.bot = botCommands;
    this.eventHandlers = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Обработчик события push
    this.eventHandlers.set('push', this.handlePushEvent.bind(this));
    
    // Обработчик события pull_request
    this.eventHandlers.set('pull_request', this.handlePullRequestEvent.bind(this));
    
    // Обработчик события issues
    this.eventHandlers.set('issues', this.handleIssuesEvent.bind(this));
    
    // Обработчик события issue_comment
    this.eventHandlers.set('issue_comment', this.handleIssueCommentEvent.bind(this));
    
    // Обработчик события create
    this.eventHandlers.set('create', this.handleCreateEvent.bind(this));
    
    // Обработчик события delete
    this.eventHandlers.set('delete', this.handleDeleteEvent.bind(this));
    
    // Обработчик события fork
    this.eventHandlers.set('fork', this.handleForkEvent.bind(this));
    
    // Обработчик события star
    this.eventHandlers.set('star', this.handleStarEvent.bind(this));
    
    // Обработчик события watch
    this.eventHandlers.set('watch', this.handleWatchEvent.bind(this));
  }

  async handleWebhook(event, payload) {
    console.log(`📨 Webhook event received: ${event}`);
    
    const handler = this.eventHandlers.get(event);
    if (!handler) {
      console.log(`⚠️ No handler for event: ${event}`);
      return {
        success: false,
        message: `No handler for event: ${event}`
      };
    }

    try {
      const result = await handler(payload);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error handling webhook event ${event}:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async handlePushEvent(payload) {
    const { repository, pusher, commits, ref } = payload;
    
    console.log(`🔨 Push to ${repository.full_name} on ${ref} by ${pusher.name}`);
    console.log(`📝 ${commits.length} commit(s) pushed`);
    
    return {
      type: 'push',
      repository: repository.full_name,
      branch: ref.replace('refs/heads/', ''),
      pusher: pusher.name,
      commits_count: commits.length,
      commits: commits.map(commit => ({
        id: commit.id,
        message: commit.message,
        author: commit.author.name,
        url: commit.url
      }))
    };
  }

  async handlePullRequestEvent(payload) {
    const { action, pull_request, repository } = payload;
    
    console.log(`🔀 Pull Request ${action} in ${repository.full_name}`);
    console.log(`📋 PR #${pull_request.number}: ${pull_request.title}`);
    
    return {
      type: 'pull_request',
      action,
      repository: repository.full_name,
      number: pull_request.number,
      title: pull_request.title,
      state: pull_request.state,
      author: pull_request.user.login,
      html_url: pull_request.html_url
    };
  }

  async handleIssuesEvent(payload) {
    const { action, issue, repository } = payload;
    
    console.log(`📋 Issue ${action} in ${repository.full_name}`);
    console.log(`🐛 Issue #${issue.number}: ${issue.title}`);
    
    return {
      type: 'issue',
      action,
      repository: repository.full_name,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      author: issue.user.login,
      html_url: issue.html_url
    };
  }

  async handleIssueCommentEvent(payload) {
    const { action, issue, comment, repository } = payload;
    
    console.log(`💬 Comment ${action} on issue #${issue.number} in ${repository.full_name}`);
    
    return {
      type: 'issue_comment',
      action,
      repository: repository.full_name,
      issue_number: issue.number,
      comment_author: comment.user.login,
      comment_body: comment.body.substring(0, 100) + '...'
    };
  }

  async handleCreateEvent(payload) {
    const { ref_type, ref, repository, sender } = payload;
    
    console.log(`✨ ${ref_type} created: ${ref} in ${repository.full_name} by ${sender.login}`);
    
    return {
      type: 'create',
      ref_type,
      ref,
      repository: repository.full_name,
      author: sender.login
    };
  }

  async handleDeleteEvent(payload) {
    const { ref_type, ref, repository, sender } = payload;
    
    console.log(`🗑️ ${ref_type} deleted: ${ref} in ${repository.full_name} by ${sender.login}`);
    
    return {
      type: 'delete',
      ref_type,
      ref,
      repository: repository.full_name,
      author: sender.login
    };
  }

  async handleForkEvent(payload) {
    const { forkee, repository, sender } = payload;
    
    console.log(`🍴 Repository forked: ${repository.full_name} -> ${forkee.full_name} by ${sender.login}`);
    
    return {
      type: 'fork',
      original_repo: repository.full_name,
      forked_repo: forkee.full_name,
      author: sender.login
    };
  }

  async handleStarEvent(payload) {
    const { action, repository, sender } = payload;
    
    console.log(`⭐ Repository ${action}: ${repository.full_name} by ${sender.login}`);
    
    return {
      type: 'star',
      action,
      repository: repository.full_name,
      author: sender.login
    };
  }

  async handleWatchEvent(payload) {
    const { action, repository, sender } = payload;
    
    console.log(`👀 Repository ${action}: ${repository.full_name} by ${sender.login}`);
    
    return {
      type: 'watch',
      action,
      repository: repository.full_name,
      author: sender.login
    };
  }

  // Валидация webhook подписи
  validateSignature(payload, signature, secret) {
    return this.github.validateWebhookSignature(payload, signature, secret);
  }

  // Получить список поддерживаемых событий
  getSupportedEvents() {
    return Array.from(this.eventHandlers.keys());
  }
}

module.exports = WebhookHandler;
