/* AIEDAP 모듈5 · 마스터교원 지속적 전문성 개발 — 참여형 연수 웹앱 */
(function () {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- 콘텐츠 정의 ---------------- */
  const LEVELS = [
    { n: 1, ko: '입문가', en: 'Newcomer', d: 'AI와 디지털 기술의 교육적 잠재력을 인식하지만 실제 활용에 익숙하지 않아, 효과적인 사용을 위해 지원과 연수가 필요합니다.' },
    { n: 2, ko: '탐색가', en: 'Explorer', d: 'AI와 디지털 도구를 수업에 도입하기 위해 노력하지만, 체계적 접근이 부족해 지속적 학습과 전문가와의 협력이 필요합니다.' },
    { n: 3, ko: '실천가', en: 'Practitioner', d: 'AI와 디지털 도구를 교육에 효과적으로 활용하려 노력하나, 최적의 적용 방법을 찾기 위해 지속적인 전문성 개발이 필요합니다.' },
    { n: 4, ko: '전문가', en: 'Expert', d: 'AI와 디지털 기술을 창의적이고 비판적으로 활용하여 교육 혁신을 주도하며, 동료들을 지원하고 조직 변화를 이끌어 냅니다.' },
    { n: 5, ko: '선도자', en: 'Leader', d: 'AI와 디지털 기술의 교육적 활용 비전을 가지고 조직 변화를 주도하며, 동료 멘토링과 정책 수립을 통해 전반적인 교육 혁신을 이끕니다.' },
    { n: 6, ko: '개척자', en: 'Pioneer', d: 'AI와 디지털 도구를 활용하여 교육 혁신을 위한 새로운 도구와 방법론을 개발하고, 정책에 영향을 미치며, 미래 교육을 선도하는 롤모델 역할을 합니다.' }
  ];
  const COMPS = [
    ['A', 'AI·디지털 기반 교육 이해'], ['B', '윤리적 실천'], ['C', '수업 및 학습자 분석'],
    ['D', '교수·학습 및 평가 설계'], ['E', '교수·학습 실행'], ['F', '평가 실행'], ['G', 'AI·디지털 기반 교사 전문성 개발']
  ];
  const COMP_NAME = Object.fromEntries(COMPS);
  const ACTS = {
    q1: { n: 1, type: 'text', short: '필요한 이유', title: 'AX(AI Transformation) 시대, 교사가 전문성 개발이 필요한 이유는 무엇이라고 생각하시나요?', max: 300, ph: '생각을 자유롭게 적어 주세요.' },
    q2: { n: 2, type: 'diag', short: '나의 역량 수준', title: '나의 역량 수준은 Lv. 몇인가요?', hint: '현재 레벨과 함께 강점 역량, 보완이 필요한 역량을 골라 주세요.' },
    q3: { n: 3, type: 'level', short: '목표 레벨', title: '목표하는 레벨은 몇 레벨인가요?', hint: '이번 연수 이후 도달하고 싶은 레벨을 골라 주세요.' },
    q4: { n: 4, type: 'text', short: '단기 계획', title: '단기 역량 개발 계획 (6개월 이내)', hint: '본 연수를 통한 단기 역량 개발 계획을 탐색해 보아요.', ex: '예: 권역 내 AI·디지털 융합 수업 선도교사 활동, AI 융합 연구모임 등', max: 400, ph: '6개월 안에 해 보고 싶은 일을 적어 주세요.' },
    q5: { n: 5, type: 'text', short: '장기 계획', title: '장기 역량 개발 계획 (1년 이상)', hint: '본 연수를 통한 장기 역량 개발 계획을 탐색해 보아요.', ex: '예: 마스터교원 연수 강사 활동, AI 융합수업 모형 개발 등', max: 400, ph: '1년 이상 바라보는 계획을 적어 주세요.' },
    q6: { n: 6, type: 'short', short: '한 문장 정의', title: 'AX 시대의 교사 전문성은 ______ 이다.', hint: '빈칸에 들어갈 말을 짧게 채워 주세요.', max: 30 }
  };
  const QIDS = Object.keys(ACTS);
  const STEPS = [
    { id: 's0', name: '시작하기', sec: true },
    { id: 's1', name: '1. 전문성 개발이 필요한 이유', sec: true },
    { id: 'q1' },
    { id: 's2', name: '2. 지속적 전문성 개발의 방향', sec: true },
    { id: 's3', name: '3. 지속적 전문성 개발 지원체계', sec: true },
    { id: 'q2' },
    { id: 's4', name: '4. 전문성 개발 계획 탐색하기', sec: true },
    { id: 'q3' }, { id: 'q4' }, { id: 'q5' }, { id: 'q6' },
    { id: 's5', name: '마무리', sec: true }
  ];
  const stepName = id => ACTS[id] ? `의견 ${ACTS[id].n} · ${ACTS[id].short}` : (STEPS.find(s => s.id === id) || {}).name || id;

  /* ---------------- 상태 ---------------- */
  const params = new URLSearchParams(location.search);
  const ROOM = sanitizeRoom(params.get('room') || CFG.defaultRoom || 'module5');
  function sanitizeRoom(s) { return String(s).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'module5'; }
  const S = {
    store: null,
    room: { current: null, follow: true, showPeers: true, open: {} },
    responses: [],           // {id, uid, qid, value, ts}
    people: {},              // uid -> 별명
    role: 'student',
    admin: false,
    resTab: 'q1',
    present: null,
    lastCurrent: undefined,
    dirty: {}                // qid -> true while the participant is editing
  };

  /* ---------------- 저장소: 체험 모드 ---------------- */
  function makeDemoStore() {
    const mem = {};
    const ls = {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
    };
    let uid;
    try { uid = sessionStorage.getItem('cpd-demo-uid'); } catch (e) { }
    if (!uid) { uid = 'demo-' + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('cpd-demo-uid', uid); } catch (e) { } }
    const key = r => 'aiedap-cpd-demo:' + r;
    const read = r => { let d; try { d = JSON.parse(ls.get(key(r))); } catch (e) { } d = d || {}; return { room: d.room || null, responses: d.responses || {}, people: d.people || {} }; };
    const subs = [];
    const emit = r => subs.filter(s => s.room === r).forEach(s => s.fn(read(r)));
    const write = (r, data) => { ls.set(key(r), JSON.stringify(data)); emit(r); };
    const PFX = 'aiedap-cpd-demo:';
    window.addEventListener('storage', e => { if (e.key && e.key.startsWith(PFX)) emit(e.key.slice(PFX.length)); });
    let admin = false;
    try { admin = sessionStorage.getItem('cpd-demo-admin') === '1'; } catch (e) { }
    return {
      demo: true,
      uid: () => uid,
      isAdmin: () => admin,
      async loginAdmin(pw, email) { if (pw !== String(CFG.demoPassword || '1234')) throw new Error('비밀번호가 맞지 않아요.'); admin = true; try { sessionStorage.setItem('cpd-demo-admin', '1'); } catch (e) { } },
      async logoutAdmin() { admin = false; try { sessionStorage.removeItem('cpd-demo-admin'); } catch (e) { } },
      onRoom(r, fn) { const s = { room: r, fn: d => fn(d.room) }; subs.push(s); fn(read(r).room); },
      onResponses(r, fn) { const s = { room: r, fn: d => fn(Object.entries(d.responses).map(([id, v]) => ({ id, ...v }))) }; subs.push(s); s.fn(read(r)); },
      onPeople(r, fn) { const s = { room: r, fn: d => fn(Object.fromEntries(Object.entries(d.people).map(([u, v]) => [u, v.name]))) }; subs.push(s); s.fn(read(r)); },
      async setName(r, name) { const d = read(r); d.people[uid] = { name, ts: Date.now() }; write(r, d); },
      async setRoom(r, patch) {
        const d = read(r); const cur = d.room || {};
        d.room = { ...cur, ...patch, open: { ...(cur.open || {}), ...(patch.open || {}) } };
        write(r, d);
      },
      async saveResponse(r, qid, value) {
        const d = read(r); const st = d.room && d.room.open && d.room.open[qid] === false;
        if (st) throw new Error('마감된 활동이에요.');
        d.responses[uid + '_' + qid] = { uid, qid, value, ts: Date.now() }; write(r, d);
      },
      async deleteResponse(r, id) { const d = read(r); delete d.responses[id]; write(r, d); },
      async clearRoom(r) { const d = read(r); d.responses = {}; d.people = {}; write(r, d); },
      async seed(r) { const d = read(r); const sd = sampleData(); Object.assign(d.responses, sd.responses); Object.assign(d.people, sd.people); write(r, d); }
    };
  }

  /* ---------------- 저장소: Firebase ---------------- */
  async function makeFirebaseStore(cfg) {
    const V = '10.12.2', base = `https://www.gstatic.com/firebasejs/${V}/`;
    const [appMod, authMod, fs] = await Promise.all([
      import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')
    ]);
    const app = appMod.initializeApp(cfg);
    const auth = authMod.getAuth(app);
    const db = fs.getFirestore(app);
    await new Promise((resolve, reject) => {
      const un = authMod.onAuthStateChanged(auth, u => {
        if (u) { un(); resolve(u); }
        else authMod.signInAnonymously(auth).catch(err => { un(); reject(err); });
      });
    });
    const cfgEmail = String(CFG.instructorEmail || '').trim().toLowerCase();
    // config.js의 이메일이 형식에 맞지 않으면(예: 예시 문구 그대로) 무시하고 화면에서 입력한 이메일을 사용
    const adminEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfgEmail) && !/[^\x00-\x7f]/.test(cfgEmail) ? cfgEmail : '';
    const roomRef = r => fs.doc(db, 'rooms', r);
    const respCol = r => fs.collection(db, 'rooms', r, 'responses');
    const onErr = e => { console.error(e); toast('연결 오류: ' + (e.code || e.message)); };
    return {
      demo: false,
      uid: () => auth.currentUser && auth.currentUser.uid,
      isAdmin: () => {
        const u = auth.currentUser;
        if (!u || u.isAnonymous || !u.email) return false;
        return !adminEmail || u.email.toLowerCase() === adminEmail;
      },
      async loginAdmin(pw, email) {
        const em = String(email || adminEmail || '').trim().toLowerCase();
        if (!em) throw new Error('강사 이메일을 입력해 주세요.');
        try { await authMod.signInWithEmailAndPassword(auth, em, pw); }
        catch (e) {
          const c = e.code || '';
          if (/invalid-email/.test(c)) throw new Error('이메일 형식이 올바르지 않아요. 띄어쓰기나 오타를 확인해 주세요.');
          if (/password|credential|user-not-found/.test(c)) throw new Error('이메일 또는 비밀번호가 맞지 않아요. Firebase > Authentication > 사용자에 있는 계정인지 확인해 주세요.');
          if (/too-many-requests/.test(c)) throw new Error('시도가 너무 많아요. 잠시 뒤 다시 해 주세요.');
          if (/operation-not-allowed/.test(c)) throw new Error('Firebase > Authentication > 로그인 방법에서 "이메일/비밀번호"를 켜 주세요.');
          throw new Error('로그인 실패: ' + (c || e.message));
        }
        if (adminEmail && em !== adminEmail) {
          await authMod.signOut(auth); await authMod.signInAnonymously(auth);
          throw new Error('이 계정은 config.js의 instructorEmail과 달라요. 두 이메일을 같게 맞춰 주세요.');
        }
      },
      async logoutAdmin() { await authMod.signOut(auth); await authMod.signInAnonymously(auth); },
      onRoom(r, fn) { fs.onSnapshot(roomRef(r), s => fn(s.exists() ? s.data() : null), onErr); },
      onResponses(r, fn) {
        fs.onSnapshot(respCol(r), qs => fn(qs.docs.map(d => {
          const x = d.data(); return { id: d.id, uid: x.uid, qid: x.qid, value: x.value, ts: x.ts && x.ts.toMillis ? x.ts.toMillis() : Date.now() };
        })), onErr);
      },
      onPeople(r, fn) { fs.onSnapshot(fs.collection(db, 'rooms', r, 'people'), qs => fn(Object.fromEntries(qs.docs.map(d => [d.id, d.data().name]))), onErr); },
      async setName(r, name) { await fs.setDoc(fs.doc(db, 'rooms', r, 'people', auth.currentUser.uid), { name, ts: fs.serverTimestamp() }); },
      async setRoom(r, patch) { await fs.setDoc(roomRef(r), { ...patch, updatedAt: fs.serverTimestamp() }, { merge: true }); },
      async saveResponse(r, qid, value) {
        const uid = auth.currentUser.uid;
        await fs.setDoc(fs.doc(db, 'rooms', r, 'responses', uid + '_' + qid), { uid, qid, value, ts: fs.serverTimestamp() });
      },
      async deleteResponse(r, id) { await fs.deleteDoc(fs.doc(db, 'rooms', r, 'responses', id)); },
      async clearRoom(r) {
        const a = await fs.getDocs(respCol(r)), b2 = await fs.getDocs(fs.collection(db, 'rooms', r, 'people'));
        const docs = a.docs.concat(b2.docs);
        const qs = { docs };
        for (let i = 0; i < qs.docs.length; i += 400) {
          const b = fs.writeBatch(db); qs.docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit();
        }
      }
    };
  }

  /* ---------------- 공통 유틸 ---------------- */
  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 2400); }
  const isOpen = qid => !(S.room && S.room.open && S.room.open[qid] === false);
  const byQ = qid => S.responses.filter(r => r.qid === qid);
  const mine = qid => S.responses.find(r => r.qid === qid && r.uid === S.store.uid());
  function participantIndex() {
    const first = {};
    S.responses.forEach(r => { if (!(r.uid in first) || r.ts < first[r.uid]) first[r.uid] = r.ts; });
    const order = Object.keys(first).sort((a, b) => first[a] - first[b]);
    return Object.fromEntries(order.map((u, i) => [u, i + 1]));
  }
  const myName = () => S.people[S.store.uid()] || '';
  function nameOf(uid, idx) { return S.people[uid] || (idx ? `참여자 ${idx[uid]}` : '별명 없음'); }
  function timeAgo(ts) {
    const s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return '방금'; if (s < 3600) return Math.floor(s / 60) + '분 전';
    const d = new Date(ts); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ---------------- 시각화 ---------------- */
  function levelChart(seriesList, opt = {}) {
    // seriesList: [{name,color,counts:[6]}]
    const h = opt.h || 220;
    const max = Math.max(1, ...seriesList.flatMap(s => s.counts));
    const single = seriesList.length === 1;
    const legend = single ? '' : `<div class="chart-legend">${seriesList.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
    const cols = LEVELS.map((L, i) => `<div class="col ${single ? 'single' : ''}">${seriesList.map(s => {
      const v = s.counts[i]; const pct = Math.round((v / max) * (100 - 14));
      return `<div class="bar ${v ? '' : 'zero'}" style="height:${v ? pct : 0}%;background:${s.color}" data-tip="${esc(s.name)} · Lv.${L.n} ${L.ko}: ${v}명"><span class="v">${v}</span></div>`;
    }).join('')}</div>`).join('');
    const labels = LEVELS.map(L => `<div><img src="assets/badge-lv${L.n}.png" alt="">Lv.${L.n} ${L.ko}<small>${L.en}</small></div>`).join('');
    return `${legend}<div class="cols" style="--h:${h}px">${cols}</div><div class="col-labels">${labels}</div>`;
  }
  function divergeChart(strong, weak) {
    const max = Math.max(1, ...Object.values(strong), ...Object.values(weak));
    const rows = COMPS.map(([k, nm]) => {
      const s = strong[k] || 0, w = weak[k] || 0;
      return `<div class="drow">
        <div class="l"><span class="n">${w}</span><div class="bx" style="width:${(w / max) * 88}%;background:var(--c-b)" data-tip="${k} ${esc(nm)} · 보완 필요 ${w}명"></div></div>
        <div class="lab"><b>${k}</b> ${esc(nm)}</div>
        <div class="r"><div class="bx" style="width:${(s / max) * 88}%;background:var(--c-a)" data-tip="${k} ${esc(nm)} · 강점 ${s}명"></div><span class="n">${s}</span></div>
      </div>`;
    }).join('');
    return `<div class="chart-legend"><span><i style="background:var(--c-b)"></i>보완이 필요한 역량</span><span><i style="background:var(--c-a)"></i>강점 역량</span></div>
      <div class="dhead"><div>← 보완 필요</div><div></div><div>강점 →</div></div><div class="diverge">${rows}</div>`;
  }
  function normalizePhrase(s) {
    return String(s || '').trim().replace(/[.!?。…~"'“”‘’]+$/g, '').replace(/\s*(이다|입니다|다)$/g, '').replace(/\s+/g, ' ').trim();
  }
  function cloud(list, opt = {}) {
    const cnt = {};
    list.forEach(v => { const p = normalizePhrase(v); if (p) cnt[p] = (cnt[p] || 0) + 1; });
    const items = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, opt.limit || 60);
    if (!items.length) return `<div class="empty">아직 응답이 없어요.</div>`;
    const max = items[0][1], min = items[items.length - 1][1];
    const big = opt.big ? 1.5 : 1;
    const shades = ['#003C83', '#0B4FA8', '#1D5FC4', '#2F6FB8', '#44536F'];
    // 큰 단어가 가운데 오도록 배치
    const arranged = []; items.forEach((it, i) => i % 2 ? arranged.push(it) : arranged.unshift(it));
    return `<div class="cloud">${arranged.map(([w, c], i) => {
      const t = max === min ? 0.5 : (c - min) / (max - min);
      const size = Math.round((17 + t * 30) * big);
      return `<span style="font-size:${size}px;color:${shades[i % shades.length]};opacity:${0.72 + t * 0.28}" data-tip="${esc(w)} · ${c}명">${esc(w)}</span>`;
    }).join('')}</div>`;
  }
  function wall(list, opt = {}) {
    if (!list.length) return `<div class="empty">아직 응답이 없어요.</div>`;
    const idx = opt.admin ? participantIndex() : null;
    const me = S.store.uid();
    const sorted = list.slice().sort((a, b) => b.ts - a.ts);
    const shown = opt.limit ? sorted.slice(0, opt.limit) : sorted;
    const html = shown.map(r => `<div class="note ${r.uid === me ? 'mine' : ''}">${esc(r.value)}<div class="who"><b style="color:var(--navy-ink)">${esc(nameOf(r.uid, idx))}</b>${r.uid === me ? ' (나)' : ''} · ${timeAgo(r.ts)}${opt.admin ? `<button class="del" data-del="${esc(r.id)}" title="이 의견 삭제">삭제</button>` : ''}</div></div>`).join('');
    const more = opt.limit && sorted.length > opt.limit ? `<button class="btn sm more" data-more="${opt.more}">전체 ${sorted.length}개 보기</button>` : '';
    return `<div class="wall">${html}</div>${more}`;
  }
  function levelCounts(list, pick) { const c = [0, 0, 0, 0, 0, 0]; list.forEach(r => { const l = pick(r.value); if (l >= 1 && l <= 6) c[l - 1]++; }); return c; }
  function compCounts(list, field) { const c = {}; list.forEach(r => (r.value && r.value[field] || []).forEach(k => c[k] = (c[k] || 0) + 1)); return c; }

  function resultsHTML(qid, opt = {}) {
    const list = byQ(qid);
    const a = ACTS[qid];
    if (a.type === 'text') return wall(list.filter(r => typeof r.value === 'string' && r.value.trim()), opt);
    if (a.type === 'short') {
      const vals = list.map(r => r.value);
      return cloud(vals, { big: opt.big }) + (opt.admin ? `<details style="margin-top:12px"><summary style="cursor:pointer;font-weight:700;color:var(--ink-2)">응답 목록 보기 (${list.length})</summary><div class="block">${wall(list, { admin: true })}</div></details>` : '');
    }
    if (a.type === 'diag') {
      const lv = levelCounts(list, v => v && v.level);
      const avg = list.length ? (list.reduce((s, r) => s + (r.value.level || 0), 0) / list.length).toFixed(1) : '–';
      const stats = opt.admin || opt.big ? `<div class="stats"><div class="stat"><b>${list.length}</b><span>응답</span></div><div class="stat"><b>Lv.${avg}</b><span>평균 현재 레벨</span></div></div>` : '';
      const h = opt.big ? 300 : (opt.admin ? 220 : 160);
      return stats + `<div class="kicker" style="margin-top:4px">현재 레벨 분포</div>` + levelChart([{ name: '현재 레벨', color: 'var(--c-a)', counts: lv }], { h }) +
        `<div class="kicker" style="margin-top:22px">강점 역량 · 보완이 필요한 역량</div>` + divergeChart(compCounts(list, 'strong'), compCounts(list, 'weak'));
    }
    if (a.type === 'level') {
      const cur = levelCounts(byQ('q2'), v => v && v.level);
      const tgt = levelCounts(list, v => v && v.level);
      const avgT = list.length ? list.reduce((s, r) => s + r.value.level, 0) / list.length : null;
      const curMap = Object.fromEntries(byQ('q2').map(r => [r.uid, r.value.level]));
      const gaps = list.filter(r => curMap[r.uid]).map(r => r.value.level - curMap[r.uid]);
      const avgGap = gaps.length ? (gaps.reduce((s, g) => s + g, 0) / gaps.length) : null;
      const stats = `<div class="stats"><div class="stat"><b>${list.length}</b><span>응답</span></div><div class="stat"><b>${avgT ? 'Lv.' + avgT.toFixed(1) : '–'}</b><span>평균 목표 레벨</span></div><div class="stat"><b>${avgGap !== null ? (avgGap >= 0 ? '+' : '') + avgGap.toFixed(1) : '–'}</b><span>평균 성장 목표(레벨)</span></div></div>`;
      return stats + levelChart([{ name: '현재 레벨(의견 2)', color: 'var(--c-a)', counts: cur }, { name: '목표 레벨', color: 'var(--c-b)', counts: tgt }], { h: opt.big ? 300 : (opt.admin ? 220 : 160) });
    }
    return '';
  }

  /* ---------------- 연수생: 활동 카드 ---------------- */
  function buildActivity(el) {
    const qid = el.dataset.q, a = ACTS[qid];
    let form = '';
    if (a.type === 'text') {
      form = `<label class="sr-only" for="in-${qid}">${esc(a.title)}</label>
        <textarea id="in-${qid}" maxlength="${a.max}" placeholder="${esc(a.ph)}"></textarea>
        <div class="row"><button class="btn primary" type="submit">의견 보내기</button><span class="counter"><span data-c>0</span>/${a.max}</span><span class="saved" data-saved hidden></span><span class="err" data-err hidden></span></div>`;
    } else if (a.type === 'short') {
      form = `<div class="fill-sentence"><span>AX 시대의 교사 전문성은</span><input id="in-${qid}" type="text" maxlength="${a.max}" placeholder="빈칸 채우기" aria-label="빈칸에 들어갈 말"><span>이다.</span></div>
        <div class="row"><button class="btn primary" type="submit">의견 보내기</button><span class="counter"><span data-c>0</span>/${a.max}</span><span class="saved" data-saved hidden></span><span class="err" data-err hidden></span></div>`;
    } else {
      const lvBtns = LEVELS.map(L => `<button type="button" data-lv="${L.n}" aria-pressed="false"><img src="assets/badge-lv${L.n}.png" alt=""><b>Lv.${L.n} ${L.ko}</b><small>${L.en}</small></button>`).join('');
      form = `<div class="pick-label">${a.type === 'diag' ? '현재 나의 레벨' : '목표 레벨'}</div><div class="levels" role="group" aria-label="레벨 선택">${lvBtns}</div>`;
      if (a.type === 'level') form += `<div class="from-to" data-fromto hidden></div>`;
      if (a.type === 'diag') {
        const chips = cls => `<div class="comps ${cls}" role="group">${COMPS.map(([k, n]) => `<button type="button" data-comp="${k}" aria-pressed="false"><i>${k}</i>${esc(n)}</button>`).join('')}</div>`;
        form += `<div class="pick-label">💪 강점 역량 <small>최대 2개</small></div>${chips('strong')}
          <div class="pick-label">🌱 보완이 필요한 역량 <small>최대 2개</small></div>${chips('weak')}`;
      }
      form += `<div class="row" style="margin-top:16px"><button class="btn primary" type="submit">의견 보내기</button><span class="saved" data-saved hidden></span><span class="err" data-err hidden></span></div>`;
    }
    el.innerHTML = `<div class="act-top"><span class="act-chip">의견 ${a.n}</span><span class="act-state" data-state>참여 가능</span><span class="live-tag"><span class="live-dot"></span>지금 진행 중</span></div>
      <h3>${esc(a.title)}</h3>${a.hint ? `<p class="hint">${esc(a.hint)}</p>` : ''}${a.ex ? `<p class="ex">${esc(a.ex)}</p>` : ''}
      <form novalidate>${form}</form><div class="closed-msg" data-closed hidden>강사님이 이 활동을 마감했어요. 다음 활동에서 만나요!</div>
      <div class="peers" data-peers hidden></div>`;

    const f = $('form', el);
    const sel = { level: null, strong: [], weak: [] };
    el._sel = sel;
    const input = $('textarea, input[type=text]', f);
    if (input) input.addEventListener('input', () => { $('[data-c]', f).textContent = input.value.length; S.dirty[qid] = true; markUnsaved(el); });
    $$('[data-lv]', f).forEach(b => b.addEventListener('click', () => {
      sel.level = +b.dataset.lv; S.dirty[qid] = true; syncPicks(el); markUnsaved(el);
    }));
    $$('.comps', f).forEach(g => {
      const field = g.classList.contains('strong') ? 'strong' : 'weak';
      $$('[data-comp]', g).forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.comp, arr = sel[field];
        const i = arr.indexOf(k);
        if (i >= 0) arr.splice(i, 1); else if (arr.length < 2) arr.push(k); else { arr.shift(); arr.push(k); }
        S.dirty[qid] = true; syncPicks(el); markUnsaved(el);
      }));
    });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const err = $('[data-err]', f); err.hidden = true;
      let value;
      if (a.type === 'text' || a.type === 'short') {
        value = input.value.trim();
        if (!value) { err.textContent = '내용을 입력해 주세요.'; err.hidden = false; input.focus(); return; }
      } else if (a.type === 'level') {
        if (!sel.level) { err.textContent = '레벨을 골라 주세요.'; err.hidden = false; return; }
        value = { level: sel.level };
      } else {
        if (!sel.level) { err.textContent = '현재 레벨을 골라 주세요.'; err.hidden = false; return; }
        if (!sel.strong.length || !sel.weak.length) { err.textContent = '강점 역량과 보완이 필요한 역량을 하나 이상 골라 주세요.'; err.hidden = false; return; }
        value = { level: sel.level, strong: sel.strong.slice(), weak: sel.weak.slice() };
      }
      if (!myName()) { const ok = await askName(); if (!ok) { err.textContent = '별명을 정해야 의견을 보낼 수 있어요.'; err.hidden = false; return; } }
      const btn = $('button[type=submit]', f); btn.disabled = true;
      try {
        await S.store.saveResponse(ROOM, qid, value);
        S.dirty[qid] = false;
        const sv = $('[data-saved]', f); sv.textContent = '✓ 저장했어요'; sv.hidden = false;
        btn.textContent = '수정해서 다시 보내기';
        toast(`의견 ${a.n}을(를) 보냈어요`);
      } catch (ex) {
        console.error(ex);
        err.textContent = /permission/i.test(ex.code || ex.message) ? '지금은 보낼 수 없어요(마감되었거나 권한 없음).' : (ex.message || '저장하지 못했어요. 다시 시도해 주세요.');
        err.hidden = false;
      } finally { btn.disabled = false; }
    });
  }
  function markUnsaved(el) { const sv = $('[data-saved]', el); if (sv && !sv.hidden) { sv.textContent = '수정 중 · 다시 보내야 반영돼요'; sv.style.color = 'var(--amber)'; } }
  function syncPicks(el) {
    const sel = el._sel;
    $$('[data-lv]', el).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.lv === sel.level)));
    $$('.comps', el).forEach(g => {
      const field = g.classList.contains('strong') ? 'strong' : 'weak', other = field === 'strong' ? 'weak' : 'strong';
      $$('[data-comp]', g).forEach(b => {
        const k = b.dataset.comp;
        b.setAttribute('aria-pressed', String(sel[field].includes(k)));
        b.disabled = sel[other].includes(k);
      });
    });
    const ft = $('[data-fromto]', el);
    if (ft) {
      const cur = mine('q2');
      if (cur && cur.value && cur.value.level) {
        const c = cur.value.level, t = sel.level;
        ft.hidden = false;
        ft.innerHTML = t ? `현재 <b>Lv.${c}</b> → 목표 <b>Lv.${t}</b> ${t > c ? `· ${t - c}단계 성장을 목표로 해요 🚀` : t === c ? '· 지금 레벨을 단단히 다져요' : ''}` : `의견 2에서 고른 현재 레벨은 <b>Lv.${c}</b>예요.`;
      } else ft.hidden = true;
    }
  }
  function refreshActivity(el) {
    const qid = el.dataset.q, a = ACTS[qid];
    const open = isOpen(qid);
    const my = mine(qid);
    const st = $('[data-state]', el);
    st.textContent = open ? (my ? '제출 완료 · 수정 가능' : '참여 가능') : '마감';
    st.classList.toggle('closed', !open);
    $('form', el).hidden = !open;
    $('[data-closed]', el).hidden = open;
    el.classList.toggle('is-live', S.room && S.room.current === qid);
    // 내 응답을 폼에 채우기 (수정 중이 아닐 때만)
    if (my && !S.dirty[qid]) {
      const f = $('form', el);
      if (a.type === 'text' || a.type === 'short') {
        const inp = $('textarea, input[type=text]', f);
        if (document.activeElement !== inp) { inp.value = my.value; $('[data-c]', f).textContent = String(my.value).length; }
      } else {
        el._sel.level = my.value.level;
        if (a.type === 'diag') { el._sel.strong = (my.value.strong || []).slice(); el._sel.weak = (my.value.weak || []).slice(); }
      }
      const sv = $('[data-saved]', f); sv.hidden = false; sv.style.color = ''; sv.textContent = '✓ 저장된 의견이 있어요';
      $('button[type=submit]', f).textContent = '수정해서 다시 보내기';
    }
    if (a.type !== 'text' && a.type !== 'short') syncPicks(el);
    // 다른 선생님 의견
    const peers = $('[data-peers]', el);
    const showPeers = !S.room || S.room.showPeers !== false;
    if (!showPeers) { peers.hidden = true; return; }
    peers.hidden = false;
    const n = byQ(qid).length;
    if (!my && open) { peers.innerHTML = `<div class="peers-lock">🔒 의견을 보내면 다른 선생님들의 생각(${n}개)을 볼 수 있어요.</div>`; return; }
    const expanded = el._expanded;
    peers.innerHTML = `<div class="peers-h">👀 다른 선생님들의 생각 <small>${n}명 참여</small></div>` +
      resultsHTML(qid, { limit: expanded ? 0 : 9, more: qid });
    const mb = $('[data-more]', peers); if (mb) mb.onclick = () => { el._expanded = true; refreshActivity(el); };
  }

  /* ---------------- 연수생: 진행 동기화 ---------------- */
  function applyLive() {
    const cur = S.room && S.room.current;
    $$('#channel a').forEach(a => a.classList.toggle('live', !!cur && (a.dataset.sec === cur || a.dataset.sec === sectionOf(cur))));
    const banner = $('#live-banner');
    if (!cur || S.role !== 'student') { banner.hidden = true; }
    else { $('#live-name').textContent = stepName(cur); updateBannerVisibility(); }
    if (cur !== S.lastCurrent) {
      const first = S.lastCurrent === undefined;
      S.lastCurrent = cur;
      if (cur && S.role === 'student' && S.room.follow !== false && !(first && location.hash)) {
        const anyFocus = document.activeElement && /TEXTAREA|INPUT/.test(document.activeElement.tagName) && document.activeElement.closest('.act');
        if (!anyFocus) scrollToStep(cur);
      }
    }
  }
  function sectionOf(id) { const el = document.getElementById(id); const s = el && el.closest('.sec'); return s ? s.id : null; }
  function scrollToStep(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  function updateBannerVisibility() {
    const cur = S.room && S.room.current, banner = $('#live-banner');
    if (!cur || S.role !== 'student') { banner.hidden = true; return; }
    const el = document.getElementById(cur);
    if (!el) { banner.hidden = true; return; }
    const r = el.getBoundingClientRect();
    const visible = r.top < innerHeight * 0.7 && r.bottom > 130;
    banner.hidden = visible;
  }

  /* ---------------- 강사 화면 ---------------- */
  function renderSteps() {
    const ul = $('#steps');
    const cur = S.room && S.room.current;
    ul.innerHTML = STEPS.map(s => {
      const a = ACTS[s.id];
      const nm = a ? `의견 ${a.n} · ${a.short}<small>${esc(a.title)}</small>` : esc(s.name);
      const ctl = a ? `<div class="ctl"><span class="cnt" title="응답 수">${byQ(s.id).length}</span><input type="checkbox" class="mini-switch" data-open="${s.id}" ${isOpen(s.id) ? 'checked' : ''} aria-label="의견 ${a.n} 열기/마감" title="${isOpen(s.id) ? '열림 (누르면 마감)' : '마감 (누르면 열기)'}"></div>` : '<span></span>';
      return `<li class="${s.sec ? 'sec-row' : ''} ${cur === s.id ? 'cur' : ''}"><button class="go" data-go="${s.id}" title="연수생 화면을 여기로 이동" aria-label="${esc(stepName(s.id))}로 진행">${cur === s.id ? '●' : '○'}</button><div class="nm" data-tabto="${a ? s.id : ''}">${nm}</div>${ctl}</li>`;
    }).join('');
    $$('[data-go]', ul).forEach(b => b.onclick = async () => {
      const id = b.dataset.go;
      const next = S.room.current === id ? null : id;
      await guard(S.store.setRoom(ROOM, { current: next }));
      if (ACTS[id] && next) { S.resTab = id; renderResults(); }
    });
    $$('[data-open]', ul).forEach(c => c.onchange = () => guard(S.store.setRoom(ROOM, { open: { [c.dataset.open]: c.checked } })));
    $$('[data-tabto]', ul).forEach(d => d.dataset.tabto && (d.onclick = () => { S.resTab = d.dataset.tabto; renderResults(); }));
    $('#sw-follow').checked = S.room.follow !== false;
    $('#sw-peers').checked = S.room.showPeers !== false;
    $('#kpi-people').textContent = Object.keys(participantIndex()).length;
  }
  function renderResults() {
    $('#res-tabs').innerHTML = QIDS.map(q => `<button role="tab" aria-selected="${q === S.resTab}" data-tab="${q}">의견 ${ACTS[q].n} · ${ACTS[q].short} <span style="opacity:.7">(${byQ(q).length})</span></button>`).join('');
    $$('#res-tabs [data-tab]').forEach(b => b.onclick = () => { S.resTab = b.dataset.tab; renderResults(); });
    const q = S.resTab, a = ACTS[q];
    $('#res-body').innerHTML = `<div class="res-title"><div><div class="kicker">의견 ${a.n} ${isOpen(q) ? '· 열림' : '· 마감'}</div><h3>${esc(a.title)}</h3></div><div class="sp"></div><button class="btn sm primary" data-present="${q}">🖥 크게 보기</button></div>${resultsHTML(q, { admin: true })}`;
    bindDeletes($('#res-body'));
    $('[data-present]', $('#res-body')).onclick = () => openPresent(q);
  }
  function bindDeletes(root) {
    $$('[data-del]', root).forEach(b => b.onclick = async () => {
      if (!confirm('이 의견을 삭제할까요? 되돌릴 수 없어요.')) return;
      await guard(S.store.deleteResponse(ROOM, b.dataset.del));
    });
  }
  async function guard(p) { try { await p; } catch (e) { console.error(e); toast('처리하지 못했어요: ' + (e.code || e.message)); } }

  function openPresent(q) { S.present = q; renderPresent(); }
  function renderPresent() {
    let ov = $('#present-ov');
    if (!S.present) { if (ov) ov.remove(); return; }
    if (!ov) {
      ov = document.createElement('div'); ov.className = 'overlay'; ov.id = 'present-ov';
      ov.innerHTML = `<div class="ov-card present" role="dialog" aria-modal="true" aria-label="결과 크게 보기"><button class="ov-close" aria-label="닫기">✕</button><div data-body></div></div>`;
      document.body.appendChild(ov);
      $('.ov-close', ov).onclick = () => { S.present = null; renderPresent(); };
      ov.addEventListener('click', e => { if (e.target === ov) { S.present = null; renderPresent(); } });
    }
    const q = S.present, a = ACTS[q], i = QIDS.indexOf(q);
    const scroll = $('.ov-card', ov).scrollTop;
    $('[data-body]', ov).innerHTML = `<div class="res-title"><div><div class="kicker">의견 ${a.n} · ${byQ(q).length}명 응답</div><h3>${esc(a.title)}</h3></div></div>${resultsHTML(q, { admin: true, big: true })}
      <div class="present-nav"><button class="btn" data-pv ${i === 0 ? 'disabled' : ''}>← 이전 의견</button><button class="btn" data-nx ${i === QIDS.length - 1 ? 'disabled' : ''}>다음 의견 →</button></div>`;
    $('.ov-card', ov).scrollTop = scroll;
    bindDeletes(ov);
    $('[data-pv]', ov).onclick = () => { S.present = QIDS[i - 1]; renderPresent(); };
    $('[data-nx]', ov).onclick = () => { S.present = QIDS[i + 1]; renderPresent(); };
  }
  function joinUrl() { const u = new URL(location.href); u.hash = ''; u.search = ''; u.searchParams.set('room', ROOM); return u.toString(); }
  function openQR() {
    const url = joinUrl();
    const ov = document.createElement('div'); ov.className = 'overlay';
    let svg = '';
    try { const qr = qrcode(0, 'M'); qr.addData(unescape(encodeURIComponent(url))); qr.make(); svg = qr.createSvgTag({ cellSize: 8, margin: 2, scalable: true }); } catch (e) { svg = '<p>QR을 만들지 못했어요.</p>'; }
    ov.innerHTML = `<div class="ov-card qr-ov" role="dialog" aria-modal="true" aria-label="참여 QR"><button class="ov-close" aria-label="닫기">✕</button>
      <img src="assets/logo-aiedap.png" alt="AIEDAP" style="height:30px;width:auto;margin:0 auto"><h2 style="margin:12px 0 0;color:var(--navy-ink)">QR을 찍고 연수에 참여하세요</h2>
      ${svg}<div class="url">${esc(url.replace(/^https?:\/\//, ''))}</div><span class="roomc">차수 코드 ${esc(ROOM)}</span>
      <div style="margin-top:14px"><button class="btn sm" data-copy>링크 복사</button></div></div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    $('.ov-close', ov).onclick = close; ov.addEventListener('click', e => { if (e.target === ov) close(); });
    $('[data-copy]', ov).onclick = () => copyText(url, '참여 링크를 복사했어요');
  }
  function copyText(t, msg) {
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(msg)).catch(() => {
      const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(msg); } catch (e) { prompt('복사해 주세요', t); } ta.remove();
    });
  }
  function downloadCSV() {
    const idx = participantIndex();
    const rows = [['참여자', '별명', '첫 응답 시각', '의견1 전문성 개발이 필요한 이유', '의견2 현재 레벨', '의견2 강점 역량', '의견2 보완이 필요한 역량', '의견3 목표 레벨', '의견4 단기 계획(6개월 이내)', '의견5 장기 계획(1년 이상)', '의견6 AX 시대의 교사 전문성은 ___이다']];
    const fmt = ts => { const d = new Date(ts); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
    Object.keys(idx).sort((a, b) => idx[a] - idx[b]).forEach(uid => {
      const get = q => { const r = S.responses.find(x => x.uid === uid && x.qid === q); return r ? r.value : null; };
      const first = Math.min(...S.responses.filter(r => r.uid === uid).map(r => r.ts));
      const q2 = get('q2') || {}, q3 = get('q3') || {};
      const comp = arr => (arr || []).map(k => `${k} ${COMP_NAME[k]}`).join(' / ');
      rows.push(['참여자 ' + idx[uid], S.people[uid] || '', fmt(first), get('q1') || '', q2.level ? 'Lv.' + q2.level : '', comp(q2.strong), comp(q2.weak), q3.level ? 'Lv.' + q3.level : '', get('q4') || '', get('q5') || '', get('q6') || '']);
    });
    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const d = new Date(), p = n => String(n).padStart(2, '0');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `AIEDAP-module5_${ROOM}_${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------------- 별명 ---------------- */
  let nameAsked = false;
  function renderNameChip() {
    const b = $('#my-name'); if (!b || !S.store) return;
    const n = myName();
    b.textContent = n ? `🙂 ${n}` : '🙂 별명 정하기';
    b.title = n ? '눌러서 별명 바꾸기' : '별명을 정해 주세요';
  }
  function maybeAskName() {
    if (nameAsked || !S.peopleLoaded || S.role !== 'student' || location.hash === '#instructor' || myName() || S.offline) return;
    nameAsked = true; askName();
  }
  function askName() {
    return new Promise(resolve => {
      const cur = myName();
      const ov = document.createElement('div'); ov.className = 'overlay';
      ov.innerHTML = `<div class="ov-card name-ov" role="dialog" aria-modal="true" aria-labelledby="name-h">
        <img src="assets/mascot-dabi.png" alt="" width="500" height="616">
        <h2 id="name-h">${cur ? '별명 바꾸기' : '별명을 정해 주세요'}</h2>
        <p>실명 대신 <b>별명</b>으로 참여해요. 다른 선생님들과 겹치지 않게 지어 주세요.</p>
        <form><label class="sr-only" for="name-in">별명</label>
          <input id="name-in" type="text" maxlength="12" placeholder="예: 물길지기, 코딩고래" autocomplete="off" value="${esc(cur)}">
          <p class="err" data-err hidden></p>
          <div class="name-btns">${cur ? '<button type="button" class="btn" data-cancel>취소</button>' : ''}<button class="btn primary" type="submit">${cur ? '바꾸기' : '시작하기'}</button></div>
        </form></div>`;
      document.body.appendChild(ov);
      const inp = $('#name-in', ov), err = $('[data-err]', ov);
      setTimeout(() => inp.focus(), 50);
      const done = ok => { ov.remove(); resolve(ok); };
      const c = $('[data-cancel]', ov); if (c) c.onclick = () => done(false);
      $('form', ov).onsubmit = async e => {
        e.preventDefault();
        const v = inp.value.replace(/\s+/g, ' ').trim();
        if (v.length < 1) { err.textContent = '별명을 입력해 주세요.'; err.hidden = false; return; }
        const taken = Object.entries(S.people).some(([u, n]) => u !== S.store.uid() && String(n).toLowerCase() === v.toLowerCase());
        if (taken) { err.textContent = '이미 다른 선생님이 쓰는 별명이에요. 다른 별명을 지어 주세요.'; err.hidden = false; return; }
        try { await S.store.setName(ROOM, v); S.people[S.store.uid()] = v; renderNameChip(); renderAll(); toast(`${v} 님, 반가워요!`); done(true); }
        catch (ex) { console.error(ex); err.textContent = '저장하지 못했어요: ' + (ex.code || ex.message); err.hidden = false; }
      };
    });
  }

  /* ---------------- 화면 전환 ---------------- */
  function setRole(role) {
    if (!S.store) return;
    S.role = role;
    $('#tab-student').setAttribute('aria-selected', String(role === 'student'));
    $('#tab-instructor').setAttribute('aria-selected', String(role === 'instructor'));
    $('#student-view').hidden = role !== 'student';
    $('#instructor-view').hidden = role !== 'instructor';
    $('#my-progress').hidden = role !== 'student';
    $('#my-name').hidden = role !== 'student';
    if (role === 'student') maybeAskName();
    if (role === 'instructor') { history.replaceState(null, '', location.pathname + location.search + '#instructor'); renderInstructor(); window.scrollTo(0, 0); }
    else { if (location.hash === '#instructor') history.replaceState(null, '', location.pathname + location.search); }
    applyLive();
  }
  function renderInstructor() {
    S.admin = S.store.isAdmin();
    $('#gate').hidden = S.admin; $('#dash').hidden = !S.admin;
    if (!S.admin) return;
    $('#room-input').value = ROOM;
    $('#btn-sample').hidden = !S.store.demo;
    renderSteps(); renderResults(); if (S.present) renderPresent();
  }
  function renderAll() {
    $$('.act[data-q]').forEach(refreshActivity);
    const done = QIDS.filter(q => mine(q)).length;
    $('#my-progress').textContent = `✍️ 내 의견 ${done}/${QIDS.length}개 제출`;
    applyLive();
    if (S.role === 'instructor' && S.admin) { renderSteps(); renderResults(); if (S.present) renderPresent(); }
  }

  /* ---------------- 이벤트 ---------------- */
  function bindUI() {
    $('#tab-student').onclick = () => setRole('student');
    $('#tab-instructor').onclick = () => setRole('instructor');
    $('#gate-form').onsubmit = async e => {
      e.preventDefault();
      const err = $('#gate-err'); err.hidden = true;
      try { await S.store.loginAdmin($('#gate-pw').value, $('#gate-email').value); $('#gate-pw').value = ''; await ensureRoom(); renderInstructor(); renderAll(); }
      catch (ex) { err.textContent = ex.message; err.hidden = false; }
    };
    $('#btn-logout').onclick = async () => { await guard(S.store.logoutAdmin()); renderInstructor(); renderAll(); };
    $('#btn-qr').onclick = openQR;
    $('#my-name').onclick = () => askName();
    $('#btn-csv').onclick = downloadCSV;
    $('#btn-sample').onclick = async () => { await guard(S.store.seed(ROOM)); toast('예시 데이터를 넣었어요'); };
    $('#btn-reset').onclick = async () => {
      const ans = prompt(`차수 "${ROOM}"의 모든 응답(${S.responses.length}개)을 지웁니다.\n되돌릴 수 없어요. 계속하려면 차수 코드를 그대로 입력하세요.`);
      if (ans === null) return;
      if (ans.trim() !== ROOM) { toast('차수 코드가 달라서 지우지 않았어요'); return; }
      await guard(S.store.clearRoom(ROOM)); await guard(S.store.setRoom(ROOM, { current: null })); toast('응답을 모두 지웠어요');
    };
    const applyRoom = () => { const r = sanitizeRoom($('#room-input').value); if (r === ROOM) return; location.href = location.pathname + '?room=' + encodeURIComponent(r) + '#instructor'; };
    $('#room-apply').onclick = applyRoom;
    $('#room-input').addEventListener('keydown', e => { if (e.key === 'Enter') applyRoom(); });
    $('#sw-follow').onchange = e => guard(S.store.setRoom(ROOM, { follow: e.target.checked }));
    $('#sw-peers').onchange = e => guard(S.store.setRoom(ROOM, { showPeers: e.target.checked }));
    $('#live-go').onclick = () => S.room.current && scrollToStep(S.room.current);
    $('#copy-code').onclick = () => copyText(CFG.postSurvey && CFG.postSurvey.code || '58SMRVK', '역량코드를 복사했어요');
    addEventListener('scroll', () => { updateBannerVisibility(); }, { passive: true });
    addEventListener('keydown', e => {
      if (S.present && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const i = QIDS.indexOf(S.present) + (e.key === 'ArrowRight' ? 1 : -1);
        if (i >= 0 && i < QIDS.length) { S.present = QIDS[i]; renderPresent(); }
      }
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') { const ovs = $$('.overlay'); const last = ovs[ovs.length - 1]; if (last) { if (last.id === 'present-ov') S.present = null; last.remove(); } } });

    // 이미지 확대
    document.addEventListener('click', e => {
      const img = e.target.closest('img[data-zoom]'); if (!img) return;
      const ov = document.createElement('div'); ov.className = 'overlay lightbox';
      ov.innerHTML = `<div class="ov-card"><button class="ov-close" aria-label="닫기">✕</button><img src="${img.src}" alt="${esc(img.alt)}"></div>`;
      document.body.appendChild(ov); ov.onclick = () => ov.remove();
    });
    // 툴팁
    const tip = $('#tip');
    document.addEventListener('pointerover', e => { const t = e.target.closest('[data-tip]'); if (!t) return; tip.textContent = t.dataset.tip; tip.hidden = false; });
    document.addEventListener('pointermove', e => { if (!tip.hidden) { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; } });
    document.addEventListener('pointerout', e => { if (e.target.closest('[data-tip]')) tip.hidden = true; });
    // 스크롤 위치에 따라 물길 메뉴 강조
    const io = new IntersectionObserver(ents => {
      ents.forEach(en => { if (en.isIntersecting) { $$('#channel a').forEach(a => a.classList.toggle('active', a.dataset.sec === en.target.id)); const act = $(`#channel a[data-sec="${en.target.id}"]`); const ch = $('#channel'); if (act && ch.scrollWidth > ch.clientWidth) ch.scrollTo({ left: act.offsetLeft - (ch.clientWidth - act.offsetWidth) / 2 }); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('.sec').forEach(s => io.observe(s));
  }
  function renderStatic() {
    $('#ladder').innerHTML = LEVELS.slice().reverse().map(L => `<div class="lv ${L.n === 3 ? 'focus' : ''} ${L.n === 6 ? 'top' : ''}"><img src="assets/badge-lv${L.n}.png" alt="Lv.${L.n} ${L.ko} 배지"><div class="nm"><b>Level ${L.n}</b><span>${L.ko}</span><small>${L.en}</small></div><p>${L.d}</p></div>`).join('');
    if (CFG.courseTitle) { $('#course-title').textContent = CFG.courseTitle; $('#foot-course').textContent = CFG.courseTitle; }
    if (CFG.instructor) $('#hero-instructor').textContent = `강사 ${CFG.instructor.name} · ${CFG.instructor.org}`;
    if (CFG.postSurvey) { $('#post-code').textContent = CFG.postSurvey.code; $('#post-link').href = CFG.postSurvey.url; }
    if (CFG.satisfaction) { $('#sat-link').href = CFG.satisfaction.url; $('#sat-link').textContent = CFG.satisfaction.label + ' ↗'; }
    $$('.act[data-q]').forEach(buildActivity);
  }
  async function ensureRoom() {
    if (!S.store.isAdmin()) return;
    const r = S.room || {};
    const patch = {};
    if (r.follow === undefined) patch.follow = true;
    if (r.showPeers === undefined) patch.showPeers = true;
    if (!r.open) patch.open = Object.fromEntries(QIDS.map(q => [q, true]));
    if (Object.keys(patch).length) await guard(S.store.setRoom(ROOM, patch));
  }

  /* ---------------- 예시 데이터 (체험 모드 전용) ---------------- */
  function sampleData() {
    const q1 = ['AI가 바꾸는 수업 환경 속에서 학생에게 의미 있는 배움을 설계하는 건 결국 교사의 몫이라서요.', '기술은 계속 바뀌는데 한 번 배운 걸로는 금방 뒤처져요. 꾸준히 배워야 학생 앞에 자신 있게 설 수 있어요.', '학생들은 이미 AI를 쓰고 있어요. 올바르게 쓰는 법과 윤리를 가르치려면 교사가 먼저 알아야 합니다.', '데이터로 학생을 더 깊이 이해하고 맞춤형으로 지원하기 위해서', 'AI 도구를 그냥 쓰는 것과 교육적으로 쓰는 것은 다르니까요.', '교사가 AI를 이해하지 못하면 교실의 변화가 기술에 끌려가게 됩니다.', '동료 선생님들과 함께 성장하는 문화를 만들기 위해 먼저 제가 배워야 한다고 생각해요.', '평가 방식이 바뀌고 있어서 과정중심평가에 AI를 어떻게 녹일지 고민이 필요해요.', '디지털 격차를 줄이려면 교사의 역량이 기준이 됩니다.', '학생의 질문이 달라졌어요. 그 질문에 답하려면 계속 공부해야 해요.'];
    const q4 = ['학년 협의회에서 AI 활용 수업 사례 3개 공유하기', '권역 AI·디지털 융합 수업 선도교사 활동 참여', '교내 AI 융합 연구모임 만들어 월 1회 운영', 'aiedap.or.kr 역량 진단 후 추천 연수 2개 이수', '과정중심평가에 AI 피드백 도구 적용해 보기', '수업 공개 1회 + 동료장학으로 성찰 기록 남기기', '학생 데이터 리터러시 수업 프로젝트 1건 실행', '우수 AI 융합 수업 사례 콘텐츠 매주 1개씩 분석'];
    const q5 = ['마스터교원 연수 강사로 활동하기', '우리 지역 실정에 맞는 AI 융합수업 모형 개발', '전문적 학습공동체를 지역 단위로 확산', 'AI 융합 교육 석사 과정 진학', '수업 자료를 콘텐츠로 만들어 교사 커뮤니티에 공유', 'e-Portfolio로 3년 성장 기록 쌓아 Lv.5 도전', '교육청 AI 교육 정책 자문단 참여', '신규 교사 대상 AI 활용 멘토링 운영'];
    const q6 = ['함께 성장하는 힘', '끊임없는 배움', '학생을 이해하는 눈', '함께 성장하는 힘', '질문하는 용기', '끊임없는 배움', '기술을 다루는 교육철학', '함께 성장하는 힘', '연결하는 능력', '학생을 이해하는 눈', '나침반', '끊임없는 배움', '변화를 설계하는 힘', '공유와 확산', '사람을 향한 기술'];
    const out = {}, people = {}; const now = Date.now();
    const NICK = ['바다거북', '물길지기', '해운대파도', '다비친구', '등대', '새벽산책', '돌고래쌤', '코딩고래', '푸른물결', '느린달팽이', '수평선', '갈매기', '모래성', '해녀쌤', '윤슬', '파랑새', '부표', '조약돌'];
    for (let i = 0; i < 18; i++) {
      const uid = 'sample-' + i; const t0 = now - (18 - i) * 47000; people[uid] = { name: NICK[i], ts: t0 };
      const lv = [2, 3, 3, 2, 3, 4, 3, 2, 1, 3, 4, 3, 2, 3, 5, 3, 2, 4][i];
      const pick2 = (seed) => { const ks = 'ABCDEFG'.split(''); const a = ks[(seed * 3 + i) % 7]; let b = ks[(seed * 5 + i * 2 + 1) % 7]; if (b === a) b = ks[(ks.indexOf(a) + 1) % 7]; return [a, b]; };
      const strong = pick2(1); const weak = pick2(4).filter(k => !strong.includes(k)); if (!weak.length) weak.push(strong.includes('F') ? 'G' : 'F');
      out[uid + '_q1'] = { uid, qid: 'q1', value: q1[i % q1.length], ts: t0 };
      if (i < 16) out[uid + '_q2'] = { uid, qid: 'q2', value: { level: lv, strong, weak }, ts: t0 + 600000 };
      if (i < 15) out[uid + '_q3'] = { uid, qid: 'q3', value: { level: Math.min(6, lv + 1 + (i % 3 === 0 ? 1 : 0)) }, ts: t0 + 1200000 };
      if (i < 13) out[uid + '_q4'] = { uid, qid: 'q4', value: q4[i % q4.length], ts: t0 + 1500000 };
      if (i < 12) out[uid + '_q5'] = { uid, qid: 'q5', value: q5[i % q5.length], ts: t0 + 1700000 };
      if (i < 15) out[uid + '_q6'] = { uid, qid: 'q6', value: q6[i % q6.length], ts: t0 + 1900000 };
    }
    return { responses: out, people };
  }

  /* ---------------- 시작 ---------------- */
  async function init() {
    renderStatic();
    bindUI();
    try {
      S.store = CFG.firebase ? await makeFirebaseStore(CFG.firebase) : makeDemoStore();
    } catch (e) {
      console.error(e);
      S.store = makeDemoStore();
      S.offline = true;
      // 서버 연결 실패 시 이 기기에만 저장되는 일이 없도록 저장을 막는다
      S.store.saveResponse = async () => { throw new Error('서버에 연결되지 않아 저장할 수 없어요. 인터넷을 확인하고 새로고침해 주세요.'); };
      S.store.loginAdmin = async () => { throw new Error('서버(Firebase)에 연결되지 않았어요. config.js 설정과 인터넷 연결을 확인해 주세요.'); };
      const pill = $('#mode-pill'); pill.hidden = false; pill.textContent = '⚠ 서버 연결 안 됨';
      pill.style.background = '#FDECEA'; pill.style.color = '#B42318'; pill.style.cursor = 'pointer';
      pill.title = '눌러서 새로고침'; pill.onclick = () => location.reload();
      toast('서버에 연결하지 못했어요. 새로고침해 주세요.');
    }
    if (!window.APP_CONFIG) {
      // config.js를 읽지 못함(파일 없음 또는 붙여넣기 문법 오류) → 강사가 알아챌 수 있게 표시
      const pill = $('#mode-pill'); pill.hidden = false; pill.textContent = '⚠ config.js 오류';
      pill.style.background = '#FDECEA'; pill.style.color = '#B42318';
      pill.title = 'config.js를 읽지 못해 체험 모드로 열렸어요. F12 > Console에서 오류 줄을 확인하세요.';
      $('#gate-desc').innerHTML = '<b style="color:#B42318">config.js를 읽지 못했어요.</b> 붙여 넣은 Firebase 설정의 문법(쉼표, 중괄호, <code>const firebaseConfig =</code> 같은 줄)이 맞는지 확인하세요.';
      console.error('[AIEDAP] window.APP_CONFIG가 없습니다. config.js에 문법 오류가 있거나 파일이 배포되지 않았습니다.');
    } else if (S.store.demo && !S.offline) {
      $('#mode-pill').hidden = false;
      $('#mode-pill').title = 'config.js에 Firebase 설정을 넣기 전까지는 이 브라우저 안에서만 저장돼요.';
      $('#gate-desc').innerHTML = `체험 모드 비밀번호는 config.js의 <b>demoPassword</b>예요 (기본값 ${esc(CFG.demoPassword || '1234')}).`;
      $('#gate-email').hidden = true;
    }
    if (!S.store.demo) { const em = String(CFG.instructorEmail || '').trim(); if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) && !/[^\x00-\x7f]/.test(em)) $('#gate-email').value = em; }
    S.store.onRoom(ROOM, d => { S.room = Object.assign({ current: null, follow: true, showPeers: true, open: {} }, d || {}); renderAll(); });
    S.store.onResponses(ROOM, list => { S.responses = list; renderAll(); });
    S.store.onPeople(ROOM, map => { S.people = map || {}; S.peopleLoaded = true; renderAll(); renderNameChip(); maybeAskName(); });
    setRole(location.hash === '#instructor' ? 'instructor' : 'student');
    if (S.store.isAdmin()) ensureRoom();
    setInterval(() => { if (S.role === 'instructor' && S.admin) renderResults(); }, 60000);
  }
  init();
})();
