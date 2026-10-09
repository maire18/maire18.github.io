// Mary Rose Obsuna portfolio: menu, header shadow, reveal on scroll, contact form.
(function () {
  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // The name, the back-to-top button and the footer link always return to the very top of the page
  // (the header is sticky, so the plain #top anchor would not scroll anywhere).
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (links) links.classList.remove('open');
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  // Header border, reading progress bar and back-to-top button follow the scroll
  var header = document.querySelector('.site-header');
  var progress = document.querySelector('.scroll-progress');
  var toTop = document.querySelector('.to-top');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Gentle fade-in for sections; grids reveal their items one after another
  var GROUPS = '.cards, .folder-grid, .jobs, .tool-cards, .project-grid';
  var items = [];
  document.querySelectorAll('.section .container > *').forEach(function (el) {
    if (!el.matches(GROUPS)) items.push(el);
  });
  document.querySelectorAll(GROUPS).forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.classList.contains('folder-panel')) return; // opened on click, not on scroll
      child.style.transitionDelay = (i % 3) * 110 + 'ms';
      // Once shown, drop the reveal styles so hover effects are not delayed.
      child.addEventListener('transitionend', function done(e) {
        if (e.target !== child || !child.classList.contains('visible')) return;
        child.style.transitionDelay = '';
        child.classList.remove('reveal', 'visible');
        child.removeEventListener('transitionend', done);
      });
      items.push(child);
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // "in" stays after the reveal styles are cleaned up, so nested animations can key off it.
          entry.target.classList.add('visible', 'in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });

    // Work history line draws down when it comes into view
    document.querySelectorAll('.timeline').forEach(function (t) { t.classList.add('will-draw'); io.observe(t); });

    // Stagger index for list items that cascade in
    document.querySelectorAll('.chips, .facts dl').forEach(function (list) {
      Array.prototype.forEach.call(list.children, function (child, i) { child.style.setProperty('--i', i); });
    });

    // Highlight the menu link for the section being read
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section').forEach(function (s) { spy.observe(s); });
  }

  // Folders (Services, Skills and Projects): click a folder to open it in a window under that row.
  // Each .folder-grid works on its own; a folder holds either a list (skills) or a paragraph (services).
  var FILE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';
  var ARROW_ICON = '<svg class="folder-link-go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var folderGrids = [];

  document.querySelectorAll('.folder-grid').forEach(function (grid) {
    var panel = grid.querySelector('.folder-panel');
    if (!panel) return;
    var folders = Array.prototype.slice.call(grid.querySelectorAll('.folder'));
    var panelTitle = panel.querySelector('.folder-panel-title');
    var panelCount = panel.querySelector('.folder-panel-count');
    var panelBody = panel.querySelector('.folder-body');
    var section = grid.closest('section');
    var state = { open: null };
    grid.classList.add('folders-ready');

    // Put the window right after the last folder in the clicked folder's row
    function placePanel() {
      if (!state.open) return;
      var top = state.open.offsetTop;
      var last = state.open;
      folders.forEach(function (f) { if (f.offsetTop === top) last = f; });
      if (last.nextElementSibling !== panel) last.after(panel);
      var gridBox = grid.getBoundingClientRect();
      var iconBox = state.open.querySelector('.folder-icon').getBoundingClientRect();
      panel.style.setProperty('--caret-x', (iconBox.left + iconBox.width / 2 - gridBox.left) + 'px');
    }

    function closeFolder(returnFocus) {
      if (!state.open) return;
      var btn = state.open.querySelector('.folder-btn');
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      if (returnFocus) btn.focus();
      state.open = null;
    }

    function fillBody(folder) {
      var content = folder.querySelector('.folder-content');
      panelBody.innerHTML = '';
      if (content.tagName === 'UL') {
        var ul = document.createElement('ul');
        ul.className = 'folder-files';
        content.querySelectorAll('li').forEach(function (item, i) {
          var li = document.createElement('li');
          li.style.setProperty('--i', i);
          var link = item.querySelector('a');
          if (link) {
            // Projects: the whole row links to the sample page
            var desc = item.querySelector('.folder-desc');
            var a = document.createElement('a');
            a.className = 'folder-link';
            a.href = link.getAttribute('href');
            a.innerHTML = FILE_ICON + '<span class="folder-link-text"><span class="folder-link-title"></span><span class="folder-link-desc"></span></span>' + ARROW_ICON;
            a.querySelector('.folder-link-title').textContent = link.textContent;
            a.querySelector('.folder-link-desc').textContent = desc ? desc.textContent : '';
            li.className = 'is-link';
            li.appendChild(a);
          } else {
            li.innerHTML = FILE_ICON;
            li.appendChild(document.createTextNode(item.textContent));
          }
          ul.appendChild(li);
        });
        panelBody.appendChild(ul);
      } else {
        var p = document.createElement('p');
        p.className = 'folder-text';
        p.textContent = content.textContent;
        panelBody.appendChild(p);
      }
    }

    function showFolder(folder) {
      var wasOpen = !panel.hidden;
      if (state.open) state.open.querySelector('.folder-btn').setAttribute('aria-expanded', 'false');
      state.open = folder;
      folder.querySelector('.folder-btn').setAttribute('aria-expanded', 'true');
      panelTitle.textContent = folder.querySelector('.folder-name').textContent;
      panelCount.textContent = folder.querySelector('.folder-count').textContent;
      fillBody(folder);
      panel.hidden = false;
      // Replay the opening animation when switching between folders
      if (wasOpen) { panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = ''; }
      placePanel();
      track('folder_open', { section: section ? section.id : '', folder: panelTitle.textContent });
    }

    folders.forEach(function (folder) {
      folder.querySelector('.folder-btn').addEventListener('click', function () {
        if (state.open === folder) closeFolder(false);
        else showFolder(folder);
      });
    });
    panel.querySelector('.folder-close').addEventListener('click', function () { closeFolder(true); });
    folderGrids.push({ state: state, place: placePanel, close: closeFolder });
  });

  if (folderGrids.length) {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      // Close any open folder; send focus back to it if the keyboard was inside that grid
      var active = document.activeElement;
      folderGrids.forEach(function (g) {
        if (g.state.open) g.close(g.state.open.parentNode.contains(active));
      });
    });
    window.addEventListener('resize', function () { folderGrids.forEach(function (g) { g.place(); }); });
  }

  // Portfolio filters
  var filterBtns = document.querySelectorAll('.filters button');
  var projects = document.querySelectorAll('.project');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      projects.forEach(function (p) { p.hidden = f !== 'all' && p.dataset.cat !== f; });
      track('portfolio_filter', { filter: f });
    });
  });

  // Contact form: GitHub Pages has no server, so messages are delivered
  // by FormSubmit (formsubmit.co) straight to the inbox below. If that
  // service can't be reached, the visitor's email app opens instead.
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var TO = 'mairrmdd@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;

  function track(event, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, params || {}));
  }

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = form.elements;
      var name = el.name.value.trim();
      var email = el.email.value.trim();
      var topic = el.topic.value;
      var message = el.message.value.trim();
      var fields = [el.name, el.email, el.message];
      fields.forEach(function (f) { f.classList.remove('invalid'); });

      var bad = [];
      if (!name) bad.push(el.name);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(el.email);
      if (!message) bad.push(el.message);
      if (bad.length) {
        bad.forEach(function (f) { f.classList.add('invalid'); });
        bad[0].focus();
        setStatus('Please fill in your name, a valid email and a message.', 'error');
        return;
      }

      // Bots fill the hidden field; quietly pretend it worked.
      if (el._honey && el._honey.value) {
        form.reset();
        setStatus('Thank you! Your message has been sent.', 'success');
        return;
      }

      var subject = topic + ' | Inquiry from ' + name;
      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Sending...';
      setStatus('');

      function openMailApp() {
        var body = message + '\n\n' + name + '\n' + email;
        window.location.href = 'mailto:' + TO +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        setStatus('We could not send the form just now, so your email app should open with the message ready. You can also email ' + TO + ' directly.', 'error');
      }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          topic: topic,
          message: message,
          _subject: 'Portfolio: ' + subject,
          _replyto: email,
          _template: 'table',
          _captcha: 'false'
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (String(data.success) === 'true') {
            form.reset();
            setStatus('Thank you, ' + name + '! Your message has been sent. I will reply to ' + email + ' soon.', 'success');
            track('generate_lead', { form_id: 'contact-form', lead_topic: topic });
          } else if (/activat/i.test(data.message || '')) {
            // First-ever submission: FormSubmit emails TO an "Activate Form" link.
            setStatus('Almost ready: check ' + TO + ' for the FormSubmit "Activate Form" email, click it, then send again.', 'error');
          } else {
            openMailApp();
          }
        })
        .catch(openMailApp)
        .then(function () {
          button.disabled = false;
          button.textContent = 'Send message';
        });
    });
  }

  // Analytics events (picked up by Google Tag Manager)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('mailto:') === 0) track('contact_click', { method: 'email' });
    else if (href.indexOf('tel:') === 0) track('contact_click', { method: 'phone' });
    else if (a.dataset.profile) track('profile_click', { platform: a.dataset.profile });
    else if (href.indexOf('samples/') === 0) track('sample_view', { sample_name: href.split('/').pop().replace('.html', '') });
    else if (/\.pdf$/i.test(href)) track('file_download', { file_name: href.split('/').pop() });
  });
})();
