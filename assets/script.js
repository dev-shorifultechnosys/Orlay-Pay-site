(function(){
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('[data-nav]');
  const progress = document.querySelector('.scroll-progress');
  const orb = document.querySelector('.cursor-orb');
  const sequenceItems = Array.from(document.querySelectorAll('.mouse-sequence'));
  let sequenceIndex = 0;
  let lastMove = 0;

  function splitWords(){
    document.querySelectorAll('[data-word-reveal]').forEach(el=>{
      if(el.dataset.splitDone) return;
      const text = el.textContent.trim().replace(/\s+/g,' ');
      el.setAttribute('aria-label', text);
      el.innerHTML = text.split(' ').map((word,i)=>`<span class="word" style="--i:${i}">${word}&nbsp;</span>`).join('');
      el.dataset.splitDone = 'true';
    });
  }
  splitWords();

  function onScroll(){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? (window.scrollY / max) * 100 : 0;
    if(progress) progress.style.width = ratio + '%';
    if(nav) nav.classList.toggle('is-scrolled', window.scrollY > 18);

    document.querySelectorAll('[data-map-stage]').forEach(stage=>{
      const r = stage.getBoundingClientRect();
      const active = r.top < window.innerHeight * .74 && r.bottom > window.innerHeight * .2;
      if(active && !stage.classList.contains('route-active')) stage.classList.add('zoom-in');
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  if(!prefersReduced && orb){
    window.addEventListener('pointermove', e=>{
      orb.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      const now = Date.now();
      if(now - lastMove > 280 && sequenceIndex < sequenceItems.length){
        sequenceItems[sequenceIndex].classList.add('mouse-in');
        sequenceIndex += 1;
        lastMove = now;
      }
    }, {passive:true});
  } else {
    sequenceItems.forEach(el=>el.classList.add('mouse-in'));
  }

  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        if(entry.target.matches('[data-count]')) countUp(entry.target);
      }
    });
  }, {threshold:.16, rootMargin:'0px 0px -8% 0px'});

  document.querySelectorAll('section,.motion-text,.reveal-up,.reveal-left,.reveal-device,.reveal-pop,.analytics-panel,.browser-console,.map-workspace').forEach(el=>observer.observe(el));

  function countUp(el){
    if(el.dataset.done) return;
    el.dataset.done = 'true';
    const target = Number(el.dataset.count || 0);
    const prefix = el.dataset.prefix || '';
    const start = performance.now();
    const duration = 1650;
    function step(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString('it-IT');
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if(!prefersReduced){
    document.querySelectorAll('[data-parallax-wrap]').forEach(wrap=>{
      wrap.addEventListener('pointermove', e=>{
        const r = wrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        wrap.querySelectorAll('[data-parallax]').forEach(el=>{
          const depth = Number(el.dataset.parallax || 8);
          el.style.transform = `translate3d(${x*depth}px, ${y*depth}px, 0) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;
        });
      });
      wrap.addEventListener('pointerleave', ()=>{
        wrap.querySelectorAll('[data-parallax]').forEach(el=>el.style.transform='');
      });
    });

    document.querySelectorAll('.magnetic').forEach(btn=>{
      btn.addEventListener('pointermove', e=>{
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * .14;
        const y = (e.clientY - r.top - r.height/2) * .14;
        btn.style.transform = `translate(${x}px,${y}px)`;
      });
      btn.addEventListener('pointerleave', ()=>btn.style.transform='');
    });
  }

  const mapStage = document.querySelector('[data-map-stage]');
  const heroMap = document.querySelector('[data-hero-map]');
  document.querySelectorAll('[data-map-control]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!mapStage) return;
      const action = btn.dataset.mapControl;
      const label = mapStage.querySelector('[data-zoom-label]');
      mapStage.classList.remove('zoom-in','zoom-out','route-active');
      void mapStage.offsetWidth;
      if(action === 'in'){
        mapStage.classList.add('zoom-in');
        if(label) label.textContent = '100%';
      }
      if(action === 'out'){
        mapStage.classList.add('zoom-out');
        if(label) label.textContent = '48%';
      }
      if(action === 'route'){
        mapStage.classList.add('route-active');
        if(label) label.textContent = '82%';
      }
    });
  });

  if(heroMap && !prefersReduced){
    setInterval(()=>{
      heroMap.classList.toggle('hero-map-zoomed');
    }, 4200);
  }

  document.querySelectorAll('form').forEach(form=>{
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if(!btn) return;
      const old = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Demo request ready';
      setTimeout(()=>{
        btn.textContent = old;
        btn.disabled = false;
      }, 2200);
    });
  });
})();
