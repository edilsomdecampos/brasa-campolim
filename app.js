(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('[data-year]').textContent = new Date().getFullYear();

  const header = $('[data-header]');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 24), { passive: true });

  const glow = $('.cursor-glow');
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }, { passive: true });
  } else glow.hidden = true;

  const emberField = $('[data-embers]');
  for (let i = 0; i < 28; i++) {
    const ember = document.createElement('i');
    ember.className = 'ember';
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.top = `${65 + Math.random() * 35}%`;
    ember.style.opacity = `${.15 + Math.random() * .5}`;
    emberField.append(ember);
    if (!reduced) {
      ember.animate([
        { transform: 'translate3d(0,20px,0) scale(.7)', opacity: 0 },
        { opacity: .7, offset: .25 },
        { transform: `translate3d(${(Math.random()-.5)*90}px,-${160+Math.random()*320}px,0) scale(1.3)`, opacity: 0 }
      ], { duration: 3400 + Math.random()*4400, delay: Math.random()*3000, iterations: Infinity, easing: 'cubic-bezier(.2,.6,.3,1)' });
    }
  }

  const mobileMenu = $('[data-mobile-menu]');
  const menuToggle = $('[data-menu-toggle]');
  const closeMobileMenu = () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  menuToggle.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('a,button', mobileMenu).forEach(el => el.addEventListener('click', () => {
    if (!el.hasAttribute('data-open-reservation')) closeMobileMenu();
  }));

  const menuTabs = $$('[data-menu-tab]');
  const menuPanels = $$('[data-menu-panel]');
  menuTabs.forEach(tab => tab.addEventListener('click', () => {
    const key = tab.dataset.menuTab;
    menuTabs.forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
    menuPanels.forEach(p => {
      const active = p.dataset.menuPanel === key;
      p.hidden = !active;
      p.classList.toggle('is-active', active);
      if (active && !reduced && window.gsap) gsap.fromTo(p, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' });
    });
  }));

  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.hero-photo', { scale: 1.13, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.hero h1 span, .hero h1 em', { yPercent: 100, opacity: 0, duration: 1.15, stagger: .09, ease: 'power4.out', delay: .1 });
    gsap.from('.eyebrow, .hero-bottom', { opacity: 0, y: 18, duration: .9, stagger: .12, delay: .55, ease: 'power3.out' });
    gsap.from('.manifesto-grid > *', { y: 70, opacity: 0, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.manifesto-grid', start: 'top 78%' } });
    const fireTL = gsap.timeline({ scrollTrigger: { trigger: '.fire-story', start: 'top top', end: 'bottom bottom', scrub: 1 } });
    fireTL.to('.fire-photo-a', { scale: 1.16, clipPath: 'inset(0% 0% round 0px)', duration: 1.3 })
      .to('.fire-copy', { y: -70, opacity: .12, duration: .7 }, '<.4')
      .to('.fire-photo-b', { opacity: 1, scale: 1, duration: 1 }, '-=.2')
      .to('.fire-word', { y: -80, opacity: .7, duration: .8 }, '<');
    gsap.to('.table-photo', { scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.table-scene', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.table-copy > *', { opacity: 0, y: 60, stagger: .1, scrollTrigger: { trigger: '.table-copy', start: 'top 75%' } });
    gsap.from('.info-row', { opacity: 0, x: 30, stagger: .08, scrollTrigger: { trigger: '.campolim-info', start: 'top 78%' } });
    gsap.to('.finale-media', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  // Reservation concierge prototype. Replace demo availability with real API / CRM / calendar hooks.
  const dialog = $('[data-reservation]');
  const log = $('[data-conversation-log]');
  const progress = $('[data-progress]');
  const steps = $$('[data-step]', dialog);
  const state = { party: '', date: '', time: '', occasion: '', name: '', phone: '', email: '', notes: '' };
  const order = ['party','date','time','occasion','contact','summary'];

  const showStep = name => {
    steps.forEach(step => step.hidden = step.dataset.step !== name);
    const ix = order.indexOf(name);
    progress.style.width = `${((ix + 1) / order.length) * 100}%`;
  };
  const sayUser = text => {
    const node = document.createElement('div');
    node.className = 'user-bubble';
    node.textContent = text;
    log.append(node);
    node.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  };
  const resetReservation = () => {
    Object.keys(state).forEach(k => state[k] = '');
    log.innerHTML = '';
    showStep('party');
    $('.reservation-form', dialog)?.reset();
  };
  const openReservation = () => {
    closeMobileMenu();
    resetReservation();
    dialog.showModal();
    document.body.classList.add('modal-open');
  };
  const closeReservation = () => {
    dialog.close();
    document.body.classList.remove('modal-open');
  };
  $$('[data-open-reservation]').forEach(b => b.addEventListener('click', openReservation));
  $('[data-close-reservation]').addEventListener('click', closeReservation);
  dialog.addEventListener('click', e => { if (e.target === dialog) closeReservation(); });

  const dateOptions = $('[data-date-options]');
  const fmtDay = new Intl.DateTimeFormat('pt-BR', { weekday:'short' });
  const fmtDate = new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'short' });
  for (let i = 1; i <= 6; i++) {
    const d = new Date(); d.setDate(d.getDate()+i);
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.choice = d.toISOString().slice(0,10);
    b.dataset.label = fmtDate.format(d);
    b.innerHTML = `<strong>${fmtDate.format(d)}</strong><span>${fmtDay.format(d)}</span>`;
    dateOptions.append(b);
  }

  dialog.addEventListener('click', e => {
    const btn = e.target.closest('[data-choice]');
    if (!btn) return;
    const step = btn.closest('[data-step]')?.dataset.step;
    const value = btn.dataset.choice;
    if (step === 'party') { state.party = value; sayUser(value); showStep('date'); }
    if (step === 'date') { state.date = btn.dataset.label || value; sayUser(state.date); showStep('time'); }
    if (step === 'time') { state.time = value; sayUser(value); showStep('occasion'); }
    if (step === 'occasion') { state.occasion = value; sayUser(value); showStep('contact'); }
  });

  $('.reservation-form', dialog).addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.name = data.get('name').trim();
    state.phone = data.get('phone').trim();
    state.email = data.get('email').trim();
    state.notes = data.get('notes').trim();
    sayUser(`${state.name} · ${state.phone}`);
    const summary = $('[data-summary]');
    const rows = [
      ['Pessoas', state.party], ['Data', state.date], ['Horário', state.time], ['Ocasião', state.occasion],
      ['Nome', state.name], ['Telefone', state.phone], ['E-mail', state.email], ['Observação', state.notes || '—']
    ];
    summary.innerHTML = rows.map(([a,b]) => `<div class="summary-row"><span>${a}</span><span>${b}</span></div>`).join('');
    showStep('summary');
  });
  $('[data-finish]').addEventListener('click', closeReservation);
})();
