// Small bits of behaviour for the portfolio. No libraries needed.

// ---------- Hero video: plays on its own; pausing swaps in the still title ----------
const hero = document.querySelector('.hero');
const video = document.querySelector('.hero__video');
const playBtn = document.querySelector('.hero__play');

if (hero && video && playBtn) {
  const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="3" height="14" rx="1" fill="currentColor"/></svg>';
  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>';
  let pausedByUser = false;

  const show = (playing) => {
    hero.classList.toggle('is-paused', !playing);
    playBtn.innerHTML = playing ? pauseIcon : playIcon;
    playBtn.setAttribute('aria-label', playing ? 'Pause title animation' : 'Play title animation');
  };

  const start = () => {
    video.muted = true; // browsers only autoplay muted video
    const p = video.play();
    if (p && p.catch) p.catch(() => show(false)); // if the browser still blocks it, show the still title
  };

  playBtn.addEventListener('click', () => {
    if (video.paused) {
      pausedByUser = false;
      start();
    } else {
      pausedByUser = true;
      video.pause();
    }
  });
  video.addEventListener('playing', () => show(true));
  video.addEventListener('pause', () => show(false));

  // Start straight away, and again whenever the tab comes back into view
  show(true);
  start();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !pausedByUser) start();
  });
}

// ---------- Tools ticker: always scrolling, and you can grab and drag it ----------
document.querySelectorAll('.ticker').forEach((ticker) => {
  const track = ticker.querySelector('.ticker__track');
  const originals = [...track.children];
  const speed = 45; // pixels per second
  let setWidth = 1;
  let offset = 0;
  let dragging = false;
  let hovering = false; // pauses while the mouse is over it
  let lastX = 0;
  let velocity = 0; // extra speed left over after a flick
  let last = performance.now();

  // Repeat the list until it is comfortably wider than the screen, so there are never gaps
  const fill = () => {
    track.querySelectorAll('[data-clone]').forEach((el) => el.remove());
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    setWidth = track.scrollWidth + gap;
    let copies = Math.ceil((ticker.clientWidth * 2) / setWidth) + 1;
    while (copies-- > 0) {
      originals.forEach((item) => {
        const copy = item.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.dataset.clone = '';
        track.appendChild(copy);
      });
    }
  };

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!dragging) {
      offset += ((hovering ? 0 : speed) + velocity) * dt;
      velocity *= 0.94; // a flick slows down gently
    }
    offset = ((offset % setWidth) + setWidth) % setWidth;
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    requestAnimationFrame(frame);
  };

  // Mouse only, so a tap on a phone doesn't leave it stuck paused
  ticker.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
  ticker.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hovering = false; });
  ticker.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    velocity = 0;
    ticker.classList.add('is-dragging');
    ticker.setPointerCapture(e.pointerId);
  });
  ticker.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    offset -= dx;
    velocity = -dx * 30; // remember which way it was flicked
  });
  const stop = () => {
    dragging = false;
    ticker.classList.remove('is-dragging');
    velocity = Math.max(-600, Math.min(600, velocity));
  };
  ticker.addEventListener('pointerup', stop);
  ticker.addEventListener('pointercancel', stop);
  ticker.addEventListener('dragstart', (e) => e.preventDefault());

  fill();
  window.addEventListener('resize', fill);
  if (document.fonts) document.fonts.ready.then(fill); // widths change once Futura loads
  requestAnimationFrame(frame);
});

// ---------- Carousels: arrow buttons scroll one item at a time ----------
const arrow = (dir) =>
  `<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${dir === 'prev' ? 'M22.5 12.5 15 20l7.5 7.5' : 'M17.5 12.5 25 20l-7.5 7.5'}"/></svg>`;

document.querySelectorAll('.carousel').forEach((carousel) => {
  const track = carousel.querySelector('.carousel__track');
  if (!track) return;

  const prev = document.createElement('button');
  const next = document.createElement('button');
  prev.className = 'carousel__btn carousel__btn--prev';
  next.className = 'carousel__btn carousel__btn--next';
  prev.setAttribute('aria-label', 'Previous');
  next.setAttribute('aria-label', 'Next');
  prev.innerHTML = arrow('prev');
  next.innerHTML = arrow('next');
  carousel.append(prev, next);

  const step = () => {
    const first = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    return first ? first.getBoundingClientRect().width + gap : track.clientWidth;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  const refresh = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };
  track.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh);
  track.querySelectorAll('img').forEach((img) => img.addEventListener('load', refresh)); // widths change once images load
  refresh();
});

// ---------- Section nav (case study pages): one link per heading, highlights where you are ----------
const csHeadings = [...document.querySelectorAll('main.cs > h2')];
if (csHeadings.length > 1) {
  const toc = document.createElement('nav');
  toc.className = 'cs-toc';
  toc.setAttribute('aria-label', 'Sections');
  const list = document.createElement('ol');

  const links = csHeadings.map((h) => {
    if (!h.id) {
      h.id = h.textContent.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent.trim();
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
    return a;
  });
  toc.append(list);
  document.body.append(toc);

  const coverPhoto = document.querySelector('.cs-hero');
  const contact = document.getElementById('contact');

  const onScroll = () => {
    // The section you're in is the last heading that has passed the upper third of the screen
    const line = window.innerHeight * 0.33;
    let current = 0;
    csHeadings.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) current = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = csHeadings.length - 1;
    links.forEach((a, i) => a.setAttribute('aria-current', i === current ? 'true' : 'false'));

    // Only show it once the cover photo has scrolled away, and tuck it away before the footer
    const pastHero = !coverPhoto || coverPhoto.getBoundingClientRect().bottom < 140;
    const beforeFooter = !contact || contact.getBoundingClientRect().top > toc.getBoundingClientRect().bottom + 24;
    toc.classList.toggle('is-visible', pastHero && beforeFooter);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

// ---------- Back-to-top button (case study pages) ----------
const toTop = document.querySelector('.to-top');
if (toTop) {
  const onScroll = () => toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- Home (phone): show the bottom nav once the work covers the title ----------
const pillNav = document.querySelector('.pill-nav[data-hide-on-hero]');
if (pillNav) {
  const onScroll = () => pillNav.classList.toggle('is-hidden', window.scrollY < window.innerHeight * 0.5);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- Home: hover the name in the intro to slide through Ashley, Ash and Anjena ----------
const nameFlip = document.querySelector('.name-flip');

if (nameFlip) {
  const names = ['Ashley', 'Ash', 'Anjena'];
  const box = document.createElement('span');
  box.className = 'name-flip__box';
  box.setAttribute('aria-hidden', 'true');   // screen readers just hear "Ashley"
  const label = document.createElement('span');
  label.className = 'sr-only';
  label.textContent = names[0];

  const makeWord = (text) => {
    const word = document.createElement('span');
    word.className = 'name-flip__word';
    word.textContent = text;
    return word;
  };

  let index = 0;
  let current = makeWord(names[0]);
  box.append(current);
  nameFlip.textContent = '';
  nameFlip.append(label, box);

  let slide = 0;
  const show = (next) => {
    const thisSlide = ++slide;
    index = next;
    const old = current;
    const from = box.offsetWidth;
    current = makeWord(names[index]);
    current.classList.add('is-below');
    old.classList.add('is-above');          // the old name steps out of the flow and slides away
    box.append(current);
    const to = current.offsetWidth;
    if (from && to) {                       // ease the width from the old name to the new one
      box.style.width = from + 'px';
      void box.offsetWidth;
      box.style.width = to + 'px';
    }
    void current.offsetWidth;               // let the browser place it below before sliding it up
    current.classList.remove('is-below');
    setTimeout(() => {
      old.remove();
      if (thisSlide === slide) box.style.width = ''; // back to its natural width
    }, 300);
  };

  let timer = null;
  nameFlip.addEventListener('mouseenter', () => {
    if (timer) return;
    show((index + 1) % names.length);
    timer = setInterval(() => show((index + 1) % names.length), 1100);
  });
  nameFlip.addEventListener('mouseleave', () => {
    clearInterval(timer);                   // stop on whichever name is showing
    timer = null;
  });
}

// ---------- Keep the copyright year current ----------
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
