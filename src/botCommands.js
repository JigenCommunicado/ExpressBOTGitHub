const GitHubAPI = require('./github');

class BotCommands {
  constructor(githubAPI) {
    this.github = githubAPI;
    this.commands = new Map();
    this.setupCommands();
  }

  setupCommands() {
    // Команда: /user <username>
    this.commands.set('user', {
      description: 'Получить информацию о пользователе GitHub',
      usage: '/user <username>',
      handler: this.getUserInfo.bind(this)
    });

    // Команда: /repos <username>
    this.commands.set('repos', {
      description: 'Получить список репозиториев пользователя',
      usage: '/repos <username> [options]',
      handler: this.getUserRepos.bind(this)
    });

    // Команда: /repo <owner/repo>
    this.commands.set('repo', {
      description: 'Получить информацию о репозитории',
      usage: '/repo <owner/repo>',
      handler: this.getRepoInfo.bind(this)
    });

    // Команда: /issues <owner/repo>
    this.commands.set('issues', {
      description: 'Получить issues репозитория',
      usage: '/issues <owner/repo> [state]',
      handler: this.getRepoIssues.bind(this)
    });

    // Команда: /prs <owner/repo>
    this.commands.set('prs', {
      description: 'Получить pull requests репозитория',
      usage: '/prs <owner/repo> [state]',
      handler: this.getRepoPullRequests.bind(this)
    });

    // Команда: /help
    this.commands.set('help', {
      description: 'Показать список доступных команд',
      usage: '/help',
      handler: this.showHelp.bind(this)
    });
  }

  async processCommand(command, args, context = {}) {
    const cmd = this.commands.get(command);
    
    if (!cmd) {
      return {
        success: false,
        message: `❌ Неизвестная команда: ${command}. Используйте /help для списка команд.`
      };
    }

    try {
      const result = await cmd.handler(args, context);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      return {
        success: false,
        message: `❌ Ошибка выполнения команды: ${error.message}`
      };
    }
  }

  async getUserInfo(args) {
    if (!args || args.length === 0) {
      throw new Error('Необходимо указать имя пользователя');
    }

    const username = args[0];
    const user = await this.github.getUser(username);
    
    return {
      type: 'user_info',
      data: {
        username: user.login,
        name: user.name,
        bio: user.bio,
        company: user.company,
        location: user.location,
        email: user.email,
        blog: user.blog,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        avatar_url: user.avatar_url,
        html_url: user.html_url
      }
    };
  }

  async getUserRepos(args) {
    if (!args || args.length === 0) {
      throw new Error('Необходимо указать имя пользователя');
    }

    const username = args[0];
    const options = {
      sort: 'updated',
      per_page: 10
    };

    // Парсинг дополнительных опций
    if (args.length > 1) {
      const sortOption = args[1];
      if (['created', 'updated', 'pushed', 'full_name'].includes(sortOption)) {
        options.sort = sortOption;
      }
    }

    const repos = await this.github.getUserRepos(username, options);
    
    return {
      type: 'user_repos',
      data: {
        username,
        repos: repos.map(repo => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          open_issues: repo.open_issues_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          html_url: repo.html_url
        }))
      }
    };
  }

  async getRepoInfo(args) {
    if (!args || args.length === 0) {
      throw new Error('Необходимо указать owner/repo');
    }

    const [owner, repo] = args[0].split('/');
    if (!owner || !repo) {
      throw new Error('Неверный формат. Используйте: owner/repo');
    }

    const repoData = await this.github.getRepo(owner, repo);
    
    return {
      type: 'repo_info',
      data: {
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        open_issues: repoData.open_issues_count,
        watchers: repoData.watchers_count,
        size: repoData.size,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        pushed_at: repoData.pushed_at,
        html_url: repoData.html_url,
        clone_url: repoData.clone_url,
        topics: repoData.topics || []
      }
    };
  }

  async getRepoIssues(args) {
    if (!args || args.length === 0) {
      throw new Error('Необходимо указать owner/repo');
    }

    const [owner, repo] = args[0].split('/');
    if (!owner || !repo) {
      throw new Error('Неверный формат. Используйте: owner/repo');
    }

    const state = args[1] || 'open';
    const issues = await this.github.getRepoIssues(owner, repo, { state });
    
    return {
      type: 'repo_issues',
      data: {
        owner,
        repo,
        state,
        issues: issues.map(issue => ({
          number: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          labels: issue.labels.map(label => label.name),
          assignees: issue.assignees.map(assignee => assignee.login),
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          html_url: issue.html_url
        }))
      }
    };
  }

  async getRepoPullRequests(args) {
    if (!args || args.length === 0) {
      throw new Error('Необходимо указать owner/repo');
    }

    const [owner, repo] = args[0].split('/');
    if (!owner || !repo) {
      throw new Error('Неверный формат. Используйте: owner/repo');
    }

    const state = args[1] || 'open';
    const prs = await this.github.getRepoPullRequests(owner, repo, { state });
    
    return {
      type: 'repo_prs',
      data: {
        owner,
        repo,
        state,
        pull_requests: prs.map(pr => ({
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          draft: pr.draft,
          labels: pr.labels.map(label => label.name),
          assignees: pr.assignees.map(assignee => assignee.login),
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          html_url: pr.html_url
        }))
      }
    };
  }

  async showHelp() {
    const helpText = Array.from(this.commands.entries())
      .map(([command, info]) => `**${command}** - ${info.description}\n   Использование: \`${info.usage}\``)
      .join('\n\n');

    return {
      type: 'help',
      data: {
        commands: this.commands.size,
        help_text: helpText
      }
    };
  }

  getAvailableCommands() {
    return Array.from(this.commands.keys());
  }
}

module.exports = BotCommands;
