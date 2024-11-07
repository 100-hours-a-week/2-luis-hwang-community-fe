import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/* NOTE
 * - '__dirname': 현재 파일이 위치한 폴더의 절대경로
 * - '__filename': 현재 파일명
 *
 * 위 환경변수는 CommonJS 환경에서만 사용 가능하며, ES Module인 경우 'import.meta.url'을 사용한다.
 */

const app = express();
const PORT = 3000;

// 경로
const PATH = {
  get ROOT() {
    return process.cwd();
  },
  get __dirname() {
    return fileURLToPath(new URL('.', import.meta.url));
  },
  get PUBLIC() {
    return path.join(this.__dirname, 'public');
  },
  get PAGES() {
    return path.join(this.PUBLIC, 'pages');
  },
  get JSON() {
    return path.join(this.PUBLIC, 'json');
  },
  get LOGS() {
    return path.join(this.ROOT, 'logs');
  },
  get LOGIN_HISTORY() {
    return path.join(
      this.LOGS,
      `login-${new Date().toDateString().replaceAll(' ', '_')}.txt`,
    );
  },
};

// 미들웨어 설정
app.use(express.static(PATH.PUBLIC)); // 정적 파일 제공 설정
app.use(express.urlencoded({ extended: true })); // 임시 로그인 기능을 위해 인코딩 해석 미들웨어 추가

// index 페이지 응답
app.get('/', (req, res) => {
  res.sendFile(path.join(PATH.PAGES, 'index.html'));
});

// login 페이지 응답
app.get('/login', (req, res) => {
  res.sendFile(path.join(PATH.PAGES, 'login.html'));
});

/* 백엔드 서버 구현 전 임시 로그인 기능 구현 */
app.post('/login', (req, res) => {
  const body = req.body;

  if (body.name === '' || body.password !== 'start21') {
    return res.status(400);
  }

  const data = { ...body, date: new Date() };

  fs.appendFileSync(PATH.LOGIN_HISTORY, JSON.stringify(data) + '\n', 'utf8');
  res.redirect('http://localhost:3000');
});

// 이외 경로 접근시 디폴트 페이지
app.get('/*', (req, res) => {
  res.sendFile(path.join(PATH.PAGES, 'notFound.html'));
});

app.listen(PORT, () => {
  if (!fs.existsSync(PATH.LOGIN_HISTORY)) {
    fs.writeFileSync(PATH.LOGIN_HISTORY, '', 'utf8');
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
