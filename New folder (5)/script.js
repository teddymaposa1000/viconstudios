(() => {
  'use strict';

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Loading sequence
  const loader = $('#loader');
  const loaderCount = $('#loaderCount');
  const loadStart = performance.now();
  const countLoad = now => {
    const progress = clamp((now - loadStart) / 1250);
    loaderCount.textContent = String(Math.round(progress * 100)).padStart(2, '0');
    if (progress < 1) requestAnimationFrame(countLoad);
  };
  requestAnimationFrame(countLoad);
  window.addEventListener('load', () => {
    const wait = Math.max(0, 1450 - (performance.now() - loadStart));
    setTimeout(() => {
      loaderCount.textContent = '100';
      loader.classList.add('is-done');
      setTimeout(() => loader.remove(), 1000);
    }, wait);
  });

  // Current year
  $('#year').textContent = new Date().getFullYear();

  // Reveal on view
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .reveal-lines').forEach(el => revealObserver.observe(el));

  // Mobile navigation
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  const setMenu = open => {
    menuToggle.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.style.display = open ? 'flex' : 'none';
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };
  menuToggle.addEventListener('click', () => setMenu(!menuToggle.classList.contains('active')));
  $$('.mobile-menu a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  // Hide nav while moving down, show while moving up
  let previousScroll = 0;
  const nav = $('.site-nav');
  let navTicking = false;
  const updateNav = () => {
    const current = window.scrollY;
    if (!document.body.classList.contains('overlay-open')) {
      nav.classList.toggle('nav-hidden', current > previousScroll && current > 240 && Math.abs(current - previousScroll) > 5);
    }
    previousScroll = current;
    navTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!navTicking) { requestAnimationFrame(updateNav); navTicking = true; }
  }, { passive: true });

  // Smooth parallax without dependencies
  const parallaxItems = $$('.parallax');
  let parallaxTicking = false;
  const updateParallax = () => {
    const viewportMiddle = window.innerHeight / 2;
    parallaxItems.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
        const speed = Number(el.dataset.speed || 0.04);
        const y = (rect.top + rect.height / 2 - viewportMiddle) * speed;
        el.style.translate = `0 ${y.toFixed(2)}px`;
      }
    });
    parallaxTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) { requestAnimationFrame(updateParallax); parallaxTicking = true; }
  }, { passive: true });
  updateParallax();

  // Horizontal scroll projects
  const featured = $('.featured');
  const track = $('#projectTrack');
  const progressBar = $('#projectProgress');
  let projectTicking = false;
  const updateProjects = () => {
    if (window.innerWidth <= 760) {
      track.style.transform = '';
      projectTicking = false;
      return;
    }
    const start = featured.offsetTop;
    const distance = featured.offsetHeight - window.innerHeight;
    const progress = clamp((window.scrollY - start) / distance);
    const maxShift = Math.max(0, track.scrollWidth - window.innerWidth + 20);
    track.style.transform = `translate3d(${-progress * maxShift}px,0,0)`;
    progressBar.style.width = `${progress * 100}%`;
    projectTicking = false;
  };
  const requestProjectUpdate = () => {
    if (!projectTicking) { requestAnimationFrame(updateProjects); projectTicking = true; }
  };
  window.addEventListener('scroll', requestProjectUpdate, { passive: true });
  window.addEventListener('resize', requestProjectUpdate);
  updateProjects();

  // Custom cursor
  const cursor = $('.cursor');
  const cursorLabel = $('.cursor span');
  let pointerX = -100, pointerY = -100, cursorX = -100, cursorY = -100;
  document.addEventListener('pointermove', event => { pointerX = event.clientX; pointerY = event.clientY; });
  const animateCursor = () => {
    cursorX += (pointerX - cursorX) * 0.18;
    cursorY += (pointerY - cursorY) * 0.18;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);
  $$('[data-cursor], a, button').forEach(el => {
    el.addEventListener('pointerenter', () => {
      cursor.classList.add('is-active');
      cursorLabel.textContent = el.dataset.cursor || (el.tagName === 'A' ? 'GO' : 'CLICK');
    });
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  });

  // Magnetic buttons
  const setupMagnetic = el => {
    el.addEventListener('pointermove', event => {
      if (matchMedia('(pointer: coarse)').matches) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      el.style.transform = `translate(${x}px,${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  };
  $$('.magnetic').forEach(setupMagnetic);

  // Card tilt
  $$('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (matchMedia('(pointer: coarse)').matches) return;
      const rect = card.getBoundingClientRect();
      const rx = -((event.clientY - rect.top) / rect.height - .5) * 5;
      const ry = ((event.clientX - rect.left) / rect.width - .5) * 5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  // Magazine follows the pointer very gently
  const hero = $('.hero');
  const magazine = $('.magazine');
  hero.addEventListener('pointermove', event => {
    if (matchMedia('(pointer: coarse)').matches) return;
    const x = event.clientX / window.innerWidth - .5;
    const y = event.clientY / window.innerHeight - .5;
    magazine.style.rotate = `${4 + x * 2}deg`;
    magazine.style.translate = `${x * 8}px ${y * 8}px`;
  });
  hero.addEventListener('pointerleave', () => { magazine.style.rotate = ''; magazine.style.translate = ''; });

  // Rotating VICON art archive in the hero
  const magazineSlides = $$('.magazine-slide', magazine);
  const magazineDots = $$('.magazine-dots i', magazine);
  const magazineEdition = $('#magazineEdition');
  const magazineCaption = $('#magazineCaption');
  let magazineIndex = 0;
  let magazineTimer;
  const showMagazineSlide = nextIndex => {
    magazineIndex = (nextIndex + magazineSlides.length) % magazineSlides.length;
    magazineSlides.forEach((slide, index) => slide.classList.toggle('active', index === magazineIndex));
    magazineDots.forEach((dot, index) => dot.classList.toggle('active', index === magazineIndex));
    const activeSlide = magazineSlides[magazineIndex];
    magazineEdition.textContent = activeSlide.dataset.edition;
    magazineCaption.textContent = activeSlide.dataset.caption;
  };
  const startMagazineRotation = () => {
    clearInterval(magazineTimer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      magazineTimer = setInterval(() => showMagazineSlide(magazineIndex + 1), 4200);
    }
  };
  magazine.addEventListener('click', () => { showMagazineSlide(magazineIndex + 1); startMagazineRotation(); });
  magazine.addEventListener('pointerenter', () => clearInterval(magazineTimer));
  magazine.addEventListener('pointerleave', startMagazineRotation);
  startMagazineRotation();

  const worlds = {
    brand: {
      color: '#AEE8FF', index: '01 / BRAND WORLD', title: 'Brand World',
      lead: 'We turn your point of view into a world people can recognize with their eyes closed.',
      body: 'From positioning and naming to identity systems and brand toolkits, we build the strategic and visual rules that make every touchpoint feel unmistakably yours.',
      services: ['Brand Strategy', 'Visual Identity', 'Naming & Voice', 'Guidelines', 'Packaging', 'Digital Systems'], next: 'Motion World'
    },
    motion: {
      color: '#F7A3C5', index: '02 / MOTION WORLD', title: 'Motion World',
      lead: 'Movement makes identity feel alive—and gives every idea a rhythm of its own.',
      body: 'We create motion languages, campaign films, social loops, reels, title sequences and animated systems that stop thumbs and hold attention.',
      services: ['Motion Identity', '2D Animation', '3D & CGI', 'Title Design', 'Reels & Loops', 'Film Direction'], next: 'Visual World'
    },
    visual: {
      color: '#FFD800', index: '03 / VISUAL WORLD', title: 'Visual World',
      lead: 'We create images with atmosphere, point of view and a little bit of beautiful tension.',
      body: 'From concept to final retouch, our photography and art direction turn products, people and places into imagery made to live beyond a single post.',
      services: ['Photography', 'Art Direction', 'Set Design', 'Styling', 'Retouching', 'Content Libraries'], next: 'Campaign World'
    },
    campaign: {
      color: '#13D8C4', index: '04 / CAMPAIGN WORLD', title: 'Campaign World',
      lead: 'Big ideas become connected stories, built to move through culture instead of interrupting it.',
      body: 'We shape launch concepts, visual territories and cross-channel content—then make the toolkit that keeps every message focused and fresh.',
      services: ['Campaign Concepts', 'Launch Strategy', 'Creative Direction', 'Digital Campaigns', 'OOH', 'Social Toolkits'], next: 'Music World'
    },
    music: {
      color: '#F8F7F3', index: '05 / MUSIC WORLD', title: 'Music World',
      lead: 'Sound deserves a universe you can see, touch and step inside.',
      body: 'We partner with artists, labels and festivals on visual eras that move from cover art to screens, stages, merch and memorable live moments.',
      services: ['Cover Art', 'Artist Identity', 'Music Visuals', 'Stage Content', 'Merchandise', 'Live Experiences'], next: 'Brand World'
    }
  };

  const worldOverlay = $('#worldOverlay');
  const worldContent = $('#worldOverlayContent');
  const closeWorldButton = $('.overlay-close', worldOverlay);
  const openWorld = key => {
    const world = worlds[key];
    if (!world) return;
    worldOverlay.style.setProperty('--world-color', world.color);
    worldContent.innerHTML = `
      <article class="world-page">
        <header class="world-page-head">
          <span class="world-page-kicker">${world.index}</span>
          <h2 id="worldOverlayTitle">${world.title.replace(' ', '<br>')}</h2>
        </header>
        <div class="world-page-lead"><p>${world.lead}</p><p>${world.body}</p></div>
        <div class="world-services">${world.services.map((service, i) => `<div><span>0${i + 1}</span><strong>${service}</strong></div>`).join('')}</div>
        <div class="world-next"><span>Next portal</span><a href="#contact" data-overlay-contact>${world.next} ↗</a></div>
      </article>`;
    worldOverlay.classList.add('open');
    worldOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
    closeWorldButton.focus({ preventScroll: true });
    $('[data-overlay-contact]', worldOverlay).addEventListener('click', () => closeOverlay(worldOverlay));
  };

  const closeOverlay = overlay => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');
  };
  $$('.world-card').forEach(card => card.addEventListener('click', () => openWorld(card.dataset.world)));
  closeWorldButton.addEventListener('click', () => closeOverlay(worldOverlay));

  const projects = {
    voltora: {
      index: '01 / 05', title: 'Voltora Universe', image: 'public/images/voltora.webp', alt: 'Voltora Universe campaign artwork',
      category: 'Brand universe · Motion · CGI', year: '2026', sector: 'Energy & lifestyle', duration: '12 weeks',
      challenge: 'Turn an ambitious challenger drink into a culture brand with enough energy to compete beyond the shelf.',
      process: 'We built a cosmic visual language around orbit, charge and collective momentum. The identity expanded into CGI product worlds, kinetic type and launch films.',
      results: ['4.2M organic launch views', '38% uplift in brand recall', 'Sold out first capsule drop']
    },
    urban: {
      index: '02 / 05', title: 'Urban Culture', image: 'public/images/urban-culture.webp', alt: 'Urban Culture Lusaka editorial campaign',
      category: 'Photography · Campaign', year: '2025', sector: 'Fashion & culture', duration: '8 weeks',
      challenge: 'Capture Lusaka as lived by its next generation—not as a backdrop, but as a character in the story.',
      process: 'A documentary rhythm met projected graphics, saturated styling and spontaneous street casting. Every frame was designed to feel found and composed at once.',
      results: ['18 hero assets', '72-piece social library', 'Featured in 6 culture titles']
    },
    galaxy: {
      index: '03 / 05', title: 'Galaxy Visuals', image: 'public/images/galaxy-visuals.webp', alt: 'Galaxy Visuals surreal motion world',
      category: 'Visual identity · CGI', year: '2025', sector: 'Digital entertainment', duration: '10 weeks',
      challenge: 'Give an emerging digital platform a visual signature that could stretch from an app icon into an infinite entertainment world.',
      process: 'We combined liquid chrome forms, alien landscapes and a modular orbit system. Motion principles gave the identity a hypnotic, elastic behavior.',
      results: ['2.7× longer dwell time', '60+ modular scenes', 'One endlessly flexible world']
    },
    kicks: {
      index: '04 / 05', title: 'Kicks Lab', image: '', alt: 'Kicks Lab identity artwork',
      category: 'Identity · Digital · Campaign', year: '2024', sector: 'Streetwear', duration: '9 weeks',
      challenge: 'Make every sneaker drop feel like a live experiment—and every community member feel like an insider.',
      process: 'A coded type system, bright lab colors and engineered editorial layouts transformed product data into a cult graphic language.',
      results: ['3 sold-out drops', '19k waitlist sign-ups', '2.1× social engagement']
    },
    zed: {
      index: '05 / 05', title: 'Zed Hype Campaign', image: 'public/images/vicon-editorial.webp', alt: 'Zed Hype editorial campaign cover',
      category: 'Campaign · Editorial · Motion', year: '2024', sector: 'Media & music', duration: '7 weeks',
      challenge: 'Translate a fast-moving local media voice into a campaign that could own both street-level spaces and digital feeds.',
      process: 'We treated every touchpoint like a front cover: loud hierarchy, collectible graphics, local language and motion that hits on the beat.',
      results: ['8.6M campaign impressions', '46% audience growth', '12 creative collaborations']
    }
  };

  const caseOverlay = $('#caseOverlay');
  const caseContent = $('#caseContent');
  const openCase = key => {
    const project = projects[key];
    if (!project) return;
    const media = project.image
      ? `<img src="${project.image}" alt="${project.alt}">`
      : `<div class="case-art kicks-art"><div class="kicks-type">KICKS<br>LAB</div><div class="shoe-shape"></div><div class="kicks-code">DROP_004 / LSK</div></div>`;
    caseContent.innerHTML = `
      <article>
        <div class="case-eyebrow"><span>${project.index}</span><span>${project.category}</span><span>${project.year}</span></div>
        <h2 class="case-title" id="caseTitle">${project.title}</h2>
        <div class="case-hero">${media}</div>
        <div class="case-statline"><div><span>Sector</span><strong>${project.sector}</strong></div><div><span>Engagement</span><strong>${project.duration}</strong></div><div><span>Creative worlds</span><strong>Strategy → Launch</strong></div></div>
        <section class="case-story"><h3>Challenge<br>& process</h3><div><p>${project.challenge}</p><p>${project.process}</p></div></section>
        <section class="case-results"><h3>World<br>impact.</h3><ul>${project.results.map(result => `<li>${result}</li>`).join('')}</ul></section>
      </article>`;
    caseOverlay.classList.add('open');
    caseOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
    $('.case-close').focus({ preventScroll: true });
  };

  $$('.project-card').forEach(card => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openCase(card.dataset.project));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCase(card.dataset.project); }
    });
  });
  $('.case-close').addEventListener('click', () => closeOverlay(caseOverlay));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (caseOverlay.classList.contains('open')) closeOverlay(caseOverlay);
      if (worldOverlay.classList.contains('open')) closeOverlay(worldOverlay);
      setMenu(false);
    }
  });

  // Functional handoff to the visitor's mail client
  const contactForm = $('#contactForm');
  const formStatus = $('#formStatus');
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const subject = `New VICON project — ${data.get('company') || data.get('name')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Company: ${data.get('company') || '—'}`,
      `Budget: ${data.get('budget')}`,
      '',
      data.get('message')
    ].join('\n');
    formStatus.textContent = 'Brief captured — opening your email client…';
    const button = $('.send-button', contactForm);
    button.querySelector('span').textContent = 'Ready to send';
    setTimeout(() => {
      window.location.href = `mailto:hello@vicon.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 450);
  });
})();
