class FloatingBall {
  constructor(containerWidth, containerHeight, options = {}) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;

    this.element = document.createElement('div');
    this.element.className = 'floating-ball';

    const size = Math.random() * ((options.maxSize ?? 300) - (options.minSize ?? 150)) + (options.minSize ?? 150);
    this.element.style.width = `${size}px`;
    this.element.style.height = `${size}px`;

    this.x = Math.random() * (containerWidth - size);
    this.y = Math.random() * (containerHeight - size);

    this.speedX = (Math.random() - 0.5) * 1.5;
    this.speedY = (Math.random() - 0.5) * 1.5;

    const colors = [
      'rgba(200,100,255,0.5)',
      'rgba(255,100,100,0.5)',
      'rgba(100,255,180,0.5)'
    ];
    this.element.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    this.element.style.filter = `blur(${options.blur ?? '30px'})`;

    this.updatePosition();
  }

  updatePosition() {
    this.x += this.speedX;
    this.y += this.speedY;

    const ballWidth = this.element.offsetWidth;
    const ballHeight = this.element.offsetHeight;

    if (this.x < 0 || this.x + ballWidth > this.containerWidth) this.speedX *= -1;
    if (this.y < 0 || this.y + ballHeight > this.containerHeight) this.speedY *= -1;

    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }
}

class BallsBackground {
  constructor(container, options = {}) {
    this.container = container;
    this.balls = [];
    this.options = options;
    this.animate = this.animate.bind(this);
    this.init();
  }

  init() {
    if (!this.container) return;

    const style = this.container.style;
    style.position = style.position || 'relative';
    style.overflow = 'hidden';

    this.ballsWrapper = document.createElement('div');
    this.ballsWrapper.className = 'balls-wrapper';
    Object.assign(this.ballsWrapper.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1920px',
      height: '100%',
      pointerEvents: 'none'
    });
    this.container.appendChild(this.ballsWrapper);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    for (let i = 0; i < (this.options.numBalls ?? 7); i++) {
      const ball = new FloatingBall(width, height, this.options);
      this.ballsWrapper.appendChild(ball.element);
      this.balls.push(ball);
    }

    this.animate();
  }

  animate() {
    this.balls.forEach(ball => ball.updatePosition());
    requestAnimationFrame(this.animate);
  }

  removeBall(ball) {
    this.ballsWrapper.removeChild(ball.element);
    this.balls = this.balls.filter(b => b !== ball);
  }

  addBall(ball) {
    this.ballsWrapper.appendChild(ball.element);
    this.balls.push(ball);
  }

  reset() {
    if (!this.ballsWrapper) return;
    this.ballsWrapper.innerHTML = '';
    this.balls = [];
    this.init();
  }
}

class MultiContainerBalls {
  constructor(containers, options = {}) {
    this.containers = containers;
    this.instances = containers.map(container => new BallsBackground(container, options));
    this.transferInterval = options.transferInterval ?? 5000;
    this.startTransferLoop();
  }

  startTransferLoop() {
    setInterval(() => {
      const fromIndex = Math.floor(Math.random() * this.instances.length);
      let toIndex = Math.floor(Math.random() * this.instances.length);
      while (toIndex === fromIndex) {
        toIndex = Math.floor(Math.random() * this.instances.length);
      }

      const fromInstance = this.instances[fromIndex];
      const toInstance = this.instances[toIndex];
      const ball = fromInstance.balls[Math.floor(Math.random() * fromInstance.balls.length)];

      if (ball) {
        fromInstance.removeBall(ball);
        toInstance.addBall(ball);
      }
    }, this.transferInterval);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const containers = [
    document.querySelector('.balls-container-hero'),
    document.querySelector('.balls-container-skills')
  ].filter(Boolean);

  new MultiContainerBalls(containers, {
    numBalls: 20,
    blur: '30px',
    maxSize: 250,
    minSize: 100,
    transferInterval: 7000
  });
});

window.addEventListener('resize', () => {
  // Tu peux ajouter une logique ici si tu veux réinitialiser les instances
});

function initializeFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Retirer la classe active de tous les boutons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Ajouter la classe active au bouton cliqué
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      // Filtrer les cartes
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        // Ajouter/retirer la classe hidden avec un délai pour l'animation
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// Ajouter l'initialisation du filtre au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  // ... code existant ...
  initializeFilter();
});

function initTimeline() {
  const timeline = document.querySelector('.timeline');
  const progress = document.querySelector('.timeline-progress');
  const items = document.querySelectorAll('.timeline-item');
  let isScrolling = false;
  
  function updateTimeline() {
    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top;
    const viewportCenter = window.innerHeight / 2;
    
    items.forEach((item, index) => {
      const dot = item.querySelector('.timeline-dot');
      const content = item.querySelector('.timeline-content');
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2;
      const distanceFromCenter = Math.abs(itemCenter - viewportCenter);
      
      // Calculer la progression
      const progress = 1 - Math.min(Math.abs(distanceFromCenter) / (window.innerHeight / 2), 1);
      
      if (progress > 0.8) { // Item est proche du centre
        if (!isScrolling) {
          // Scroll snap vers l'item
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Animer le dot et le contenu
        dot.classList.add('active');
        content.classList.add('active');
        
        // Marquer comme complété si c'est au-dessus
        if (itemRect.top < viewportCenter) {
          dot.classList.add('completed');
          content.classList.add('completed');
          content.classList.remove('active');
        }
      } else {
        // Reset des états si trop loin du centre
        dot.classList.remove('active');
        content.classList.remove('active');
        
        if (itemRect.top > viewportCenter) {
          dot.classList.remove('completed');
          content.classList.remove('completed');
        }
      }
    });
    
    // Mettre à jour la barre de progression
    const progressPercentage = Math.min(
      100,
      Math.max(0, ((window.scrollY - timelineTop + viewportCenter) / timelineRect.height) * 100)
    );
    progress.style.height = `${progressPercentage}%`;
  }
  
  // Gestion du scroll avec debounce
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    requestAnimationFrame(updateTimeline);
    
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150);
  });
  
  // Update initial
  updateTimeline();
}

// Dans ton DOMContentLoaded, appelle initTimeline()
document.addEventListener('DOMContentLoaded', () => {
  initTimeline();
});

// Gestion de l'expansion des cartes de production
function initProductions() {
  document.querySelectorAll('.production-card').forEach(card => {
    const header = card.querySelector('.production-header');
    
    if (header) {
      header.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        card.classList.toggle('expanded');
      });
    }
  });
}

// Gestion du hover sur les balls containers
function initBallsHover() {
  const ballsContainers = document.querySelectorAll('[class*="balls-container"]');
  
  ballsContainers.forEach(container => {
    const ballsWrapper = container.querySelector('.balls-wrapper');
    
    if (ballsWrapper) {
      // Par défaut, les balls sont cachées
      ballsWrapper.style.display = 'none';
      
      // Au hover, afficher les balls
      container.addEventListener('mouseenter', () => {
        ballsWrapper.style.display = 'block';
      });
      
      // Au survol quitté, cacher les balls
      container.addEventListener('mouseleave', () => {
        ballsWrapper.style.display = 'none';
      });
    }
  });
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const containers = [
    document.querySelector('.balls-container-hero'),
    document.querySelector('.balls-container-skills')
  ].filter(Boolean);

  new MultiContainerBalls(containers, {
    numBalls: 20,
    blur: '30px',
    maxSize: 250,
    minSize: 100,
    transferInterval: 7000
  });

  // Initialiser les productions
  initProductions();
  
  // Initialiser le hover des balls
  initBallsHover();
  
  // Initialiser le filtre
  initializeFilter();
  
  // Initialiser la timeline
  initTimeline();
});

// --- Carousel + panneau de détail pour les preuves ---
function initCarouselAndPanel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const prevBtn = document.querySelector('.carousel-arrow.prev');
  const nextBtn = document.querySelector('.carousel-arrow.next');
  
  if (items.length === 0) return;

  let activeIndex = 0;
  
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const wrap = (v, len) => ((v % len) + len) % len;

  function updateClasses() {
    items.forEach((it, i) => {
      it.classList.remove('active', 'prev', 'next');
      if (i === activeIndex) it.classList.add('active');
      else if (i === activeIndex - 1 || (activeIndex === 0 && i === items.length - 1)) it.classList.add('prev');
      else if (i === activeIndex + 1 || (activeIndex === items.length - 1 && i === 0)) it.classList.add('next');
    });

    const container = document.querySelector('.carousel');
    const activeEl = items[activeIndex];
    const firstItemLeft = items[0].offsetLeft;
    const activeLeft = activeEl.offsetLeft;
    const offsetPosition = activeLeft - firstItemLeft - 150;
    
    track.style.transform = `translateX(${ -offsetPosition }px)`;
  }

  function goTo(index) {
    activeIndex = wrap(index, items.length);
    updateClasses();
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(activeIndex + 1));

  // Click sur une card : ouvrir panel latéral et charger contenu
  const panel = document.getElementById('proof-panel');
  const closeBtn = document.getElementById('proof-close');
  const overlay = document.getElementById('proof-overlay');
  const overlay1 = document.getElementById('proof-overlay-black');
  const overlayKeywords = document.getElementById('overlay-keywords');
  
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  };
  
  const setLink = (href) => {
    const a = document.getElementById('proof-link');
    if (a) {
      if (href) { a.href = href; a.style.display = 'inline-block'; }
      else { a.style.display = 'none'; }
    }
  };

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      goTo(i);

      const title = item.dataset.title || '';
      const demand = item.dataset.demand || '';
      const reflection = item.dataset.reflection || '';
      const constraint = item.dataset.constraint || '';
      const results = item.dataset.results || '';
      const link = item.dataset.link || '';
      const thumbImage = item.querySelector('.thumb');

      setText('proof-title', title);
      setText('proof-demand', demand);
      setText('proof-reflection', reflection);
      setText('proof-constraint', constraint);
      setText('proof-results', results);
      setLink(link);

      // Afficher l'image dans l'overlay
      const overlayImage = document.getElementById('overlay-image');
      if (thumbImage && thumbImage.src) {
        overlayImage.src = thumbImage.src;
        overlayImage.style.display = 'block';
      }

      // Afficher l'image dans le proof-panel pour mobile/tablette
      const proofPanelImage = document.getElementById('proof-panel-image');
      if (thumbImage && thumbImage.src) {
        proofPanelImage.src = thumbImage.src;
        proofPanelImage.style.display = 'block';
      }

      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      
      // Activer overlay et keywords
      overlay.classList.add('active');
      overlay1.classList.add('active');
      overlayKeywords.classList.add('active');
      
      // Cloner et afficher les keywords dans l'overlay
      const originalKeywords = document.querySelector('.keywords');
      if (originalKeywords) {
        const clonedKeywords = originalKeywords.cloneNode(true);
        overlayKeywords.innerHTML = '';
        overlayKeywords.appendChild(clonedKeywords);
      }
    });
  });

  closeBtn && closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
    overlay1.classList.remove('active');
    overlayKeywords.classList.remove('active');
  });

  // Fermer panel au clic en dehors
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !track.contains(e.target)) {
      if (panel.classList.contains('open') && e.target !== closeBtn) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('active');
        overlay1.classList.remove('active');
        overlayKeywords.classList.remove('active');
      }
    }
  });

  window.addEventListener('load', () => updateClasses());
  window.addEventListener('resize', () => updateClasses());
  updateClasses();
}

// Keyframe pour l'animation lettre par lettre
const style = document.createElement('style');
style.textContent = `
  @keyframes letterFlicker {
    0% { opacity: 0; transform: scale(0.8) rotateY(90deg); }
    50% { opacity: 1; transform: scale(1.1) rotateY(0deg); }
    100% { opacity: 1; transform: scale(1) rotateY(0deg); }
  }
`;
document.head.appendChild(style);

// keep existing initialization but ensure initCarouselAndPanel is called
document.addEventListener('DOMContentLoaded', () => {
  const containers = [
    document.querySelector('.balls-container-hero'),
    document.querySelector('.balls-container-skills')
  ].filter(Boolean);

  new MultiContainerBalls(containers, {
    numBalls: 20,
    blur: '30px',
    maxSize: 250,
    minSize: 100,
    transferInterval: 7000
  });

  // Initialiser les productions
  initProductions();
  
  // Initialiser le hover des balls
  initBallsHover();
  
  // Initialiser le filtre
  initializeFilter();
  
  // Initialiser la timeline
  initTimeline();
  
  // Initialiser carousel et panel
  initCarouselAndPanel();
});
