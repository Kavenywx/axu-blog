const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;
const POSTS_DIR = path.join(__dirname, '..', 'source', '_posts');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function listPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8');
      const title = content.match(/^title:\s*(.+)/m)?.[1]?.trim() || f.replace('.md', '');
      const date = content.match(/^date:\s*(.+)/m)?.[1]?.trim() || fs.statSync(path.join(POSTS_DIR, f)).mtime.toISOString();
      const tags = content.match(/^tags:\s*\[?(.+?)\]?\s*$/m)?.[1]?.split(/[,\s]+/).filter(Boolean) || [];
      const categories = content.match(/^categories:\s*\[?(.+?)\]?\s*$/m)?.[1]?.split(/[,\s]+/).filter(Boolean) || [];
      return { file: f, title, date, tags, categories };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

app.get('/api/posts', (req, res) => {
  res.json(listPosts());
});

app.get('/api/posts/:file', (req, res) => {
  const filePath = path.join(POSTS_DIR, req.params.file);
  if (!filePath.startsWith(POSTS_DIR) || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文章不存在' });
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  res.json({ content });
});

app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: '标题不能为空' });
  const slug = title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'post';
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '/') + ' ' + now.toTimeString().split(' ')[0];
  const fm = `---\ntitle: ${title}\ndate: ${dateStr}\ntags: []\ncategories: []\n---\n\n${content || '请输入内容...'}`;
  const fileName = `${slug}.md`;
  const filePath = path.join(POSTS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: '文件名已存在', file: fileName });
  }
  fs.writeFileSync(filePath, fm, 'utf-8');
  res.json({ success: true, file: fileName });
});

app.put('/api/posts/:file', (req, res) => {
  const filePath = path.join(POSTS_DIR, req.params.file);
  if (!filePath.startsWith(POSTS_DIR)) return res.status(404).json({ error: '文章不存在' });
  fs.writeFileSync(filePath, req.body.content, 'utf-8');
  res.json({ success: true });
});

app.delete('/api/posts/:file', (req, res) => {
  const filePath = path.join(POSTS_DIR, req.params.file);
  if (!filePath.startsWith(POSTS_DIR)) return res.status(404).json({ error: '文章不存在' });
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
});

app.post('/api/publish', (req, res) => {
  try {
    const blogDir = path.join(__dirname, '..');
    execSync('npx hexo clean && npx hexo generate && npx hexo deploy', { cwd: blogDir, stdio: 'pipe', timeout: 120000 });
    res.json({ success: true, message: '发布成功！' });
  } catch (e) {
    res.status(500).json({ error: e.stderr?.toString() || e.message });
  }
});

app.listen(PORT, () => {
  console.log(`博客管理后台: http://localhost:${PORT}`);
  console.log(`文章目录: ${POSTS_DIR}`);
});
