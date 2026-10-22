document.addEventListener('DOMContentLoaded', () => {
  const demo = document.querySelector('[data-demo]');
  const stage = demo?.querySelector('[data-stage]');
  const stageLabel = demo?.querySelector('[data-stage-label]');
  const replay = demo?.querySelector('[data-replay]');
  let timers = [];

  const labels = ['Parsing query', 'Expanding properties', 'Scoring candidates', 'Scissors selected'];

  const setStage = (value) => {
    if (!stage) return;
    stage.dataset.stage = String(value);
    if (stageLabel) stageLabel.textContent = labels[value];
  };

  const runDemo = () => {
    timers.forEach(window.clearTimeout);
    timers = [];
    setStage(0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(3);
      return;
    }

    timers.push(window.setTimeout(() => setStage(1), 450));
    timers.push(window.setTimeout(() => setStage(2), 1550));
    timers.push(window.setTimeout(() => setStage(3), 2750));
  };

  if (demo && stage) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runDemo();
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(demo);
    replay?.addEventListener('click', runDemo);
  }

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const videoCards = [...document.querySelectorAll('[data-backbone]')];

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      videoCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.backbone === filter;
        card.classList.toggle('is-hidden', !matches);
        if (!matches) card.querySelector('video')?.pause();
      });
    });
  });

  const videos = [...document.querySelectorAll('video')];
  videos.forEach((video) => {
    video.addEventListener('play', () => {
      videos.forEach((other) => {
        if (other !== video) other.pause();
      });
    });
  });

  const copyButton = document.querySelector('[data-copy-bibtex]');
  copyButton?.addEventListener('click', async () => {
    const citation = document.querySelector('#bibtex-code')?.textContent?.trim();
    if (!citation) return;

    try {
      await navigator.clipboard.writeText(citation);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = citation;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    const label = copyButton.querySelector('span');
    copyButton.classList.add('copied');
    if (label) label.textContent = 'Copied!';
    window.setTimeout(() => {
      copyButton.classList.remove('copied');
      if (label) label.textContent = 'Copy';
    }, 1800);
  });

  const scrollButton = document.querySelector('[data-scroll-top]');
  const updateScrollButton = () => {
    scrollButton?.classList.toggle('visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', updateScrollButton, { passive: true });
  updateScrollButton();
  scrollButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
