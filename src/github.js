const axios = require('axios');

class GitHubAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.github.com';
    this.headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ExpressBOT-GitHub-Integration'
    };
  }

  // Получить информацию о пользователе
  async getUser(username) {
    try {
      const response = await axios.get(`${this.baseURL}/users/${username}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.response?.data || error.message);
      throw error;
    }
  }

  // Получить репозитории пользователя
  async getUserRepos(username, options = {}) {
    try {
      const params = {
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      };

      const response = await axios.get(`${this.baseURL}/users/${username}/repos`, {
        headers: this.headers,
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user repos:', error.response?.data || error.message);
      throw error;
    }
  }

  // Получить информацию о репозитории
  async getRepo(owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repo:', error.response?.data || error.message);
      throw error;
    }
  }

  // Получить issues репозитория
  async getRepoIssues(owner, repo, options = {}) {
    try {
      const params = {
        state: options.state || 'open',
        sort: options.sort || 'created',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      };

      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/issues`, {
        headers: this.headers,
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repo issues:', error.response?.data || error.message);
      throw error;
    }
  }

  // Получить pull requests репозитория
  async getRepoPullRequests(owner, repo, options = {}) {
    try {
      const params = {
        state: options.state || 'open',
        sort: options.sort || 'created',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      };

      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/pulls`, {
        headers: this.headers,
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repo PRs:', error.response?.data || error.message);
      throw error;
    }
  }

  // Создать issue
  async createIssue(owner, repo, issueData) {
    try {
      const response = await axios.post(`${this.baseURL}/repos/${owner}/${repo}/issues`, {
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels || [],
        assignees: issueData.assignees || []
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error.response?.data || error.message);
      throw error;
    }
  }

  // Получить webhook события
  async getWebhookEvents() {
    return [
      'push',
      'pull_request',
      'issues',
      'issue_comment',
      'create',
      'delete',
      'fork',
      'star',
      'watch'
    ];
  }

  // Валидация webhook подписи
  validateWebhookSignature(payload, signature, secret) {
    const crypto = require('crypto');
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

module.exports = GitHubAPI;
