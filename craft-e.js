document.addEventListener('DOMContentLoaded', () => {
  const demo = document.querySelector('[data-demo]');
  const stage = demo?.querySelector('[data-stage]');
  const stageLabel = demo?.querySelector('[data-stage-label]');
  const replay = demo?.querySelector('[data-replay]');
  const sceneTabs = demo?.querySelector('[data-scene-tabs]');
  const queryTabs = demo?.querySelector('[data-query-tabs]');
  const sceneName = demo?.querySelector('[data-scene-name]');
  const sceneImage = demo?.querySelector('[data-scene-image]');
  const sceneObjects = demo?.querySelector('[data-scene-objects]');
  const verbNode = demo?.querySelector('[data-verb]');
  const propertiesNode = demo?.querySelector('[data-properties]');
  const objectPathsNode = demo?.querySelector('[data-object-paths]');
  const candidatesNode = demo?.querySelector('[data-candidates]');
  const decisionObject = demo?.querySelector('[data-decision-object]');
  const decisionNote = demo?.querySelector('[data-decision-note]');
  const roiNodes = [...(demo?.querySelectorAll('[data-roi]') || [])];
  let timers = [];
  let activeScene = 0;
  let activeQuery = 0;

  const scenes = [
    {
      name: 'Scene 1',
      image: 'cut-scene-v2.jpg',
      alt: 'Tabletop scene with scissors, a destapler, and a tape measure',
      objects: [
        { name: 'scissors', box: [49.4, 38.7, 20.4, 12.7] },
        { name: 'destapler', box: [37.8, 52.5, 7.2, 8.3], label: 'below' },
        { name: 'tape measure', box: [52.2, 57, 12.5, 16.6], label: 'below' }
      ],
      queries: [
        {
          text: 'Give me something to cut with.', verb: 'cut', selected: 'scissors',
          properties: [['sharp', '.90'], ['blade', '.90'], ['hinged', '.88'], ['handle', '.82']],
          paths: [
            ['scissors', ['sharp', 'blade', 'hinged'], '.92'],
            ['destapler', ['metallic', 'levered'], '.38'],
            ['tape measure', ['edged', 'handled'], '.24']
          ],
          costs: [['scissors', 16, 22, 12], ['destapler', 78, 62, 18], ['tape measure', 85, 70, 48]],
          note: 'sharp · aligned · graspable'
        },
        {
          text: 'Give me something to extract with.', verb: 'extract', selected: 'destapler',
          properties: [['prying', '.92'], ['gripping', '.87'], ['levered', '.84'], ['controlled', '.78']],
          paths: [
            ['destapler', ['prying', 'gripping', 'levered'], '.94'],
            ['scissors', ['gripping', 'levered', 'controlled'], '.58'],
            ['tape measure', ['gripping'], '.19']
          ],
          costs: [['destapler', 11, 16, 12], ['scissors', 43, 31, 18], ['tape measure', 83, 52, 39]],
          note: 'prying · controlled · graspable'
        },
        {
          text: 'Give me something to measure with.', verb: 'measure', selected: 'tape measure',
          properties: [['graduated', '.95'], ['retractable', '.87'], ['flexible', '.81'], ['portable', '.77']],
          paths: [
            ['tape measure', ['graduated', 'retractable', 'flexible'], '.96'],
            ['scissors', ['portable'], '.17'],
            ['destapler', ['compact'], '.12']
          ],
          costs: [['tape measure', 10, 17, 25], ['scissors', 88, 34, 15], ['destapler', 91, 45, 12]],
          note: 'graduated · aligned · retrievable'
        }
      ]
    },
    {
      name: 'Scene 2',
      image: 'tool-scene.jpg',
      alt: 'Tabletop scene with pliers, a screwdriver, and a red pen',
      objects: [
        { name: 'pliers', box: [34.8, 37.1, 15.2, 20.6], label: 'below' },
        { name: 'screwdriver', box: [53.2, 36.5, 15.6, 22.5], label: 'below' },
        { name: 'pen', box: [44.6, 63.6, 17.1, 4.2], label: 'below' }
      ],
      queries: [
        {
          text: 'Give me something to twist with.', verb: 'twist', selected: 'pliers',
          properties: [['gripping', '.93'], ['rotational', '.89'], ['jawed', '.86'], ['levered', '.80']],
          paths: [
            ['pliers', ['gripping', 'jawed', 'levered'], '.94'],
            ['screwdriver', ['rotational', 'levered'], '.63'],
            ['pen', ['rotational'], '.18']
          ],
          costs: [['pliers', 11, 18, 13], ['screwdriver', 38, 22, 17], ['pen', 86, 31, 22]],
          note: 'jawed · rotational · graspable'
        },
        {
          text: 'Give me something to tighten with.', verb: 'tighten', selected: 'screwdriver',
          properties: [['rotational', '.94'], ['rigid shaft', '.90'], ['fitted tip', '.87'], ['handled', '.80']],
          paths: [
            ['screwdriver', ['rotational', 'rigid shaft', 'fitted tip'], '.96'],
            ['pliers', ['rotational', 'handled'], '.57'],
            ['pen', ['rigid shaft'], '.20']
          ],
          costs: [['screwdriver', 9, 15, 17], ['pliers', 46, 25, 14], ['pen', 84, 28, 21]],
          note: 'rotational · tip-aligned · graspable'
        },
        {
          text: 'Give me something to write with.', verb: 'write', selected: 'pen',
          properties: [['ink-bearing', '.96'], ['pointed', '.88'], ['slender', '.82'], ['handheld', '.79']],
          paths: [
            ['pen', ['ink-bearing', 'pointed', 'slender'], '.97'],
            ['screwdriver', ['pointed', 'handheld'], '.32'],
            ['pliers', ['handheld'], '.16']
          ],
          costs: [['pen', 8, 14, 12], ['screwdriver', 74, 22, 18], ['pliers', 89, 28, 14]],
          note: 'ink-bearing · localized · graspable'
        }
      ]
    },
    {
      name: 'Scene 3',
      image: 'cut-scene.jpg',
      alt: 'Tabletop scene with scissors, a hair tie, and an eraser',
      objects: [
        { name: 'scissors', box: [32.1, 34.8, 15.7, 22] },
        { name: 'hair tie', box: [55.5, 42.5, 14.5, 18.8] },
        { name: 'eraser', box: [44.2, 55.5, 14.2, 18.8], label: 'below' }
      ],
      queries: [
        {
          text: 'Give me something to cut with.', verb: 'cut', selected: 'scissors',
          properties: [['sharp', '.90'], ['blade', '.90'], ['hinged', '.88'], ['handled', '.82']],
          paths: [
            ['scissors', ['sharp', 'blade', 'hinged'], '.93'],
            ['eraser', ['handled'], '.13'],
            ['hair tie', ['flexible'], '.08']
          ],
          costs: [['scissors', 12, 18, 14], ['eraser', 91, 25, 20], ['hair tie', 94, 34, 32]],
          note: 'sharp · aligned · graspable'
        },
        {
          text: 'Give me something to bind with.', verb: 'bind', selected: 'hair tie',
          properties: [['elastic', '.94'], ['looped', '.90'], ['flexible', '.86'], ['reusable', '.73']],
          paths: [
            ['hair tie', ['elastic', 'looped', 'flexible'], '.96'],
            ['eraser', ['rubber'], '.20'],
            ['scissors', ['reusable'], '.14']
          ],
          costs: [['hair tie', 9, 16, 28], ['eraser', 81, 24, 20], ['scissors', 88, 18, 14]],
          note: 'elastic · looped · retrievable'
        },
        {
          text: 'Give me something to clean with.', verb: 'clean', selected: 'eraser',
          properties: [['abrasive', '.91'], ['frictional', '.87'], ['residue-lifting', '.82'], ['handheld', '.74']],
          paths: [
            ['eraser', ['abrasive', 'frictional', 'residue-lifting'], '.94'],
            ['hair tie', ['frictional', 'flexible'], '.35'],
            ['scissors', ['handheld'], '.16']
          ],
          costs: [['eraser', 11, 15, 18], ['hair tie', 65, 29, 31], ['scissors', 89, 22, 15]],
          note: 'abrasive · localized · graspable'
        }
      ]
    }
  ];

  const labels = ['Parsing query', 'Expanding properties', 'Linking objects', 'Grounding candidates', 'Object selected'];

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
      setStage(4);
      return;
    }

    timers.push(window.setTimeout(() => setStage(1), 350));
    timers.push(window.setTimeout(() => setStage(2), 1050));
    timers.push(window.setTimeout(() => setStage(3), 1850));
    timers.push(window.setTimeout(() => setStage(4), 2750));
  };

  const renderSceneTabs = () => {
    if (!sceneTabs) return;
    sceneTabs.innerHTML = scenes.map((scene, index) =>
      `<button type="button" data-scene-index="${index}" aria-pressed="${index === activeScene}">${scene.name}</button>`
    ).join('');
    sceneTabs.querySelectorAll('[data-scene-index]').forEach((button) => {
      button.addEventListener('click', () => {
        activeScene = Number(button.dataset.sceneIndex);
        activeQuery = 0;
        renderDemo();
      });
    });
  };

  const renderQueryTabs = (scene) => {
    if (!queryTabs) return;
    queryTabs.innerHTML = scene.queries.map((query, index) =>
      `<button type="button" data-query-index="${index}" aria-pressed="${index === activeQuery}">“${query.text}”</button>`
    ).join('');
    queryTabs.querySelectorAll('[data-query-index]').forEach((button) => {
      button.addEventListener('click', () => {
        activeQuery = Number(button.dataset.queryIndex);
        renderDemo();
      });
    });
  };

  const renderDemo = () => {
    const scene = scenes[activeScene];
    const query = scene.queries[activeQuery];

    renderSceneTabs();
    renderQueryTabs(scene);

    if (sceneName) sceneName.textContent = scene.name.toUpperCase();
    if (sceneImage) {
      sceneImage.src = scene.image;
      sceneImage.alt = scene.alt;
    }
    if (verbNode) verbNode.textContent = query.verb;
    if (decisionObject) decisionObject.textContent = query.selected;
    if (decisionNote) decisionNote.textContent = query.note;

    if (sceneObjects) {
      sceneObjects.innerHTML = scene.objects.map((object) => `<span>${object.name}</span>`).join('');
    }

    roiNodes.forEach((roi, index) => {
      const object = scene.objects[index];
      if (!object) return;
      const [left, top, width, height] = object.box;
      roi.style.left = `${left}%`;
      roi.style.top = `${top}%`;
      roi.style.width = `${width}%`;
      roi.style.height = `${height}%`;
      roi.classList.toggle('label-below', object.label === 'below');
      roi.classList.toggle('is-selected', object.name === query.selected);
      roi.querySelector('span').textContent = object.name;
    });

    if (propertiesNode) {
      propertiesNode.innerHTML = query.properties.map(([name, weight]) => `<span>${name} <b>${weight}</b></span>`).join('');
    }

    if (objectPathsNode) {
      objectPathsNode.innerHTML = query.paths.map(([name, via, strength]) => `
        <div class="object-path${name === query.selected ? ' is-winner' : ''}">
          <div class="path-properties">${via.map((property) => `<em>${property}</em>`).join('<i>+</i>')}</div>
          <span class="path-arrow">→</span>
          <strong>${name}</strong>
          <b>${strength}</b>
        </div>`).join('');
    }

    if (candidatesNode) {
      candidatesNode.innerHTML = query.costs.map(([name, functional, visual, grasp]) => `
        <div class="candidate-row${name === query.selected ? ' is-winner' : ''}">
          <strong>${name}</strong><i style="--score:${functional}%"></i><i style="--score:${visual}%"></i><i style="--score:${grasp}%"></i>
        </div>`).join('');
    }

    runDemo();
  };

  if (demo && stage) {
    renderDemo();
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
