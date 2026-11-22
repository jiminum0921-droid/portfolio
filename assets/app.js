/* 카드 렌더링 · 필터 · 상세 모달 (두 페이지 공용) */
(function () {
  const P = window.PROJECTS;
  const LINK = {
    demo: ['fa-solid fa-arrow-up-right-from-square', '라이브 데모'],
    github: ['fa-brands fa-github', 'GitHub'],
    slides: ['fa-solid fa-file-powerpoint', '발표자료']
  };
  const linksHTML = (p, cls) => p.links && p.links.length
    ? `<div class="${cls}">${p.links.map((l) => `<a href="${l.u}" target="_blank" rel="noopener"><i class="${LINK[l.t][0]}" aria-hidden="true"></i>${LINK[l.t][1]}</a>`).join('')}</div>` : '';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function cardHTML(id, company) {
    const p = P[id];
    const media = p.image
      ? `<img src="${p.image}" alt="" loading="lazy">`
      : `<i class="${p.icon || 'fa-solid fa-folder'}" aria-hidden="true"></i>`;
    const tags = [
      p.status ? `<span class="tag status">${esc(p.status)}</span>` : '',
      p.award ? `<span class="tag award">${esc(p.award)}</span>` : '',
      ...p.tags.map((t) => `<span class="tag">${esc(t)}</span>`)
    ].join('');
    const fit = company && p.fit && p.fit[company]
      ? `<p class="why"><b>연결점</b> ${esc(p.fit[company])}</p>` : '';
    const shows = p.shows && p.shows.length
      ? `<div class="shows"><span class="lbl">보여주는 역량</span>${p.shows.map((s) => `<span class="cap">${esc(s.k)}</span>`).join('')}</div>` : '';
    const learned = p.learned && p.learned.length
      ? `<p class="learned"><span class="lbl">배운 점</span>${esc(p.learned[0])}</p>` : '';
    return `<article class="card" tabindex="0" role="button" aria-label="${esc(p.title)} 자세히 보기" data-id="${id}" data-cat="${p.cat.join(' ')}">
      <div class="card-media">${media}</div>
      <div class="card-body">
        <div class="tags">${tags}</div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.card)}</p>
        <div class="growth">${shows}${learned}</div>
        ${fit}
        ${linksHTML(p, 'card-links')}
      </div>
    </article>`;
  }

  function render(el) {
    const ids = el.dataset.ids.split(',').map((s) => s.trim()).filter((id) => P[id]);
    const company = el.dataset.company || '';
    el.innerHTML = ids.map((id) => cardHTML(id, company)).join('');
    el.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const card = e.target.closest('.card');
      if (card) openProject(card.dataset.id, company);
    });
    el.addEventListener('keydown', (e) => {
      const card = e.target.closest('.card');
      if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openProject(card.dataset.id, company); }
    });
  }

  const fig = (src, alt, cap, lazy) => `<figure class="m-fig"><img src="${src}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''}>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`;
  const figs2 = (o, alt) => o.image2.map((src, i) => fig(src, alt, (o.caption2 || [])[i], true)).join('');
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const ul = (items) => `<ul>${items.map((x) => `<li>${md(x)}</li>`).join('')}</ul>`;

  function renderDetail(d) {
    let h = '';
    if (d.eyebrow) h += `<p class="m-eyebrow">${esc(d.eyebrow)}</p>`;
    if (d.award) h += `<div class="m-award">${esc(d.award)}</div>`;
    h += `<h2>${esc(d.title)}</h2><p class="m-meta">${esc(d.meta)}</p>`;
    h += linksHTML({ links: d.links }, 'm-links');
    if (d.image) h += fig(d.image, d.title, d.caption);
    d.sections.forEach((s) => {
      h += `<h3>${esc(s.h)}</h3>`;
      if (s.kpis) h += `<div class="kpis m-kpis">${s.kpis.map((k) => `<div class="kpi"><b>${esc(k.n)}</b><span>${esc(k.l)}</span></div>`).join('')}</div>`;
      if (s.items) h += ul(s.items);
      if (s.steps) h += s.steps.map((st) => `<div class="m-step"><h4>${esc(st.t)}</h4>${ul(st.items)}</div>`).join('');
    });
    if (d.image2) h += figs2(d, `${d.title} 상세`);
    if (d.stack && d.stack.length) h += `<h3>Tools</h3><div class="m-chips">${d.stack.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;
    return h;
  }

  function openProject(id, company) {
    const D = window.DETAIL || {};
    const p = P[id];
    if (!p && !D[id]) return;
    let h = '';
    if (D[id]) { showModal(renderDetail(D[id])); return; }
    if (p.awardFull || p.award) h += `<div class="m-award">${esc(p.awardFull || p.award)}</div>`;
    h += `<h2>${esc(p.title)}</h2><p class="m-meta">${esc(p.meta)}</p>`;
    h += linksHTML(p, 'm-links');
    if (p.note) h += `<p class="m-anon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i>${esc(p.note)}</p>`;
    if (p.image) h += fig(p.image, p.title, p.caption);
    if (p.stats) h += `<div class="m-stats">${p.stats.map((s) => `<span>${esc(s)}</span>`).join('')}</div>`;
    if (company && p.fit && p.fit[company]) h += `<div class="callout m-fit"><b>이 회사와 맞닿은 점</b><br>${esc(p.fit[company])}</div>`;
    h += `<h3>My Role</h3><p>${esc(p.role)}</p>`;
    h += `<h3>Problem</h3><p>${esc(p.problem)}</p>`;
    if (p.flow) {
      h += `<h3>System</h3><div class="m-flow">` +
        p.flow.map((f, i) => (i ? '<i>→</i>' : '') + `<span class="${f.k}">${esc(f.t)}</span>`).join('') +
        `</div><p class="m-note">보라색은 AI가, 초록색은 사람이 맡는 단계입니다.</p>`;
    }
    h += `<h3>Approach</h3><ul>${p.approach.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`;
    if (p.trouble && p.trouble.length) {
      h += `<h3>트러블슈팅</h3>` + p.trouble.map((t) => `<div class="trouble">
        <p class="t-p"><span class="t-lbl">문제</span>${esc(t.p)}</p>
        <div class="t-try"><span class="t-lbl">시도</span><ul>${t.tried.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <p class="t-got"><span class="t-lbl">알게 된 점</span>${esc(t.got)}</p>
      </div>`).join('');
    }
    h += `<h3>Result</h3><p>${esc(p.result)}</p>`;
    if (p.limits) h += `<h3>Limits</h3><p>${esc(p.limits)}</p>`;
    if (p.shows && p.shows.length) {
      h += `<h3>이 프로젝트로 보여주는 역량</h3><ul class="m-shows">` +
        p.shows.map((s) => `<li><b>${esc(s.k)}</b>${esc(s.v)}</li>`).join('') + `</ul>`;
    }
    if (p.learned && p.learned.length) {
      h += `<div class="m-box learn"><h4>배운 점</h4>${p.learned.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
    }
    if (p.image2) h += figs2(p, `${p.title} 상세`);
    if (p.stack && p.stack.length) h += `<h3>Tools</h3><div class="m-chips">${p.stack.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;

    showModal(h);
  }

  function showModal(h) {
    document.getElementById('modal-content').innerHTML = h;
    const m = document.getElementById('modal');
    m.classList.add('show');
    m.querySelector('.modal-box').scrollTop = 0;
    document.body.style.overflow = 'hidden';
    m.querySelector('.modal-close').focus();
  }

  function renderJourney() {
    const el = document.getElementById('journey-list');
    const J = window.JOURNEY;
    if (!el || !J) return;
    el.innerHTML = J.map((c, i) => `<li class="step${c.bridge ? '' : ' now'}">
      <div class="step-rail"><span class="step-no">${i + 1}</span></div>
      <div class="step-body">
        <p class="step-when">${esc(c.when)}${c.bridge ? '' : ' · 진행 중'}</p>
        <h3>${esc(c.q)}</h3>
        <p class="step-why">${esc(c.why)}</p>
        <div class="step-projects">${c.ids.map((id) => `<button type="button" data-open="${id}">${esc(P[id].title)}<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></button>`).join('')}</div>
        <p class="step-learned"><span class="lbl">배운 것</span>${esc(c.learned)}</p>
        ${c.bridge ? `<p class="step-bridge"><i class="fa-solid fa-arrow-turn-down" aria-hidden="true"></i>${esc(c.bridge)}</p>` : ''}
      </div>
    </li>`).join('');
  }

  /* 대표 프로젝트: 케이스 스터디처럼 크게 */
  function renderFeature(el) {
    const id = el.dataset.feature;
    const p = P[id];
    if (!p) return;
    const company = el.dataset.company || '';
    const media = p.image
      ? `<img src="${p.image}" alt="" loading="lazy">`
      : `<i class="${p.icon || 'fa-solid fa-folder'}" aria-hidden="true"></i>`;
    const fit = company && p.fit && p.fit[company]
      ? `<p class="why"><b>연결점</b> ${esc(p.fit[company])}</p>` : '';
    el.innerHTML = `<div class="feature-media">${media}<span class="feature-badge">대표 프로젝트</span></div>
      <div class="feature-body">
        <div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <h3>${esc(p.title)}</h3>
        <p class="m-meta">${esc(p.meta)}</p>
        <p class="feature-problem"><span class="lbl">문제</span>${esc(p.problem)}</p>
        ${p.stats ? `<div class="m-stats">${p.stats.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
        <p class="lbl">어떻게 풀었나</p>
        <ol class="feature-steps">${p.approach.slice(0, 3).map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
        ${fit}
        ${p.note ? `<p class="m-anon"><i class="fa-solid fa-user-shield" aria-hidden="true"></i>${esc(p.note)}</p>` : ''}
        <button type="button" class="feature-cta" data-open="${id}">케이스 스터디 자세히 보기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
      </div>`;
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.body.style.overflow = '';
  }

  function setupFilters() {
    const bar = document.querySelector('.filters');
    if (!bar) return;
    const grid = document.getElementById(bar.dataset.target);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.chip-btn');
      if (!b) return;
      bar.querySelectorAll('.chip-btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.filter;
      grid.querySelectorAll('.card').forEach((c) => {
        c.classList.toggle('hidden', f !== 'all' && !c.dataset.cat.split(' ').includes(f));
      });
    });
  }

  window.openProject = openProject;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ids]').forEach(render);
    document.querySelectorAll('[data-feature]').forEach(renderFeature);
    renderJourney();
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-open]');
      if (b) openProject(b.dataset.open, document.querySelector('[data-company]') ? document.querySelector('[data-company]').dataset.company : '');
    });
    setupFilters();
    const m = document.getElementById('modal');
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
    m.querySelector('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  });
})();
