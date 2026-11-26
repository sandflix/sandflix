// Sandflix Head Init: AdShield, Zero-Cache Page Switcher & Movie Metadata Dictionary
    (function initSandflixAdShield() {
      // 1. Intercept and completely block window.open popup ads
      var _nativeOpen = window.open;
      window.open = function(url, target, features) {
        console.warn('[Sandflix AdShield] Blocked popup window.open attempt:', url);
        return null; // Suppress all popup windows & ad tabs!
      };

      // 2. Prevent Top-level URL hijacking / redirects while player is active
      window.addEventListener('beforeunload', function(e) {
        var modal = document.getElementById('netflixBlackPlayerModal');
        if (modal && modal.classList.contains('is-embed-active')) {
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      });

      // 3. Known ad networks, tracker domains, and keyword patterns
      var adBlockList = [
        'ad.', 'ads.', 'adserver', 'doubleclick', 'googleadservices', 'histats', 
        'propellerads', 'adsterra', 'popads', 'popcash', 'exoclick', 'clickadu',
        'hilltopads', 'juicyads', 'trafficjunky', 'betting', 'casino', 'redirect',
        'syndication', 'gussiessmutchy', 'outbrain', 'taboola', 'asb.html', 'popunder'
      ];

      function isBlockedAdUrl(url) {
        if (!url || typeof url !== 'string') return false;
        var lower = url.toLowerCase();
        for (var i = 0; i < adBlockList.length; i++) {
          if (lower.indexOf(adBlockList[i]) !== -1) return true;
        }
        return false;
      }

      // 4. Universal Ad Link Unlinker & Neutralizer across entire DOM
      function unlinkAllAdLinks() {
        try {
          var links = document.querySelectorAll('a[href], button[data-url], [data-href]');
          for (var i = 0; i < links.length; i++) {
            var el = links[i];
            var href = el.getAttribute('href') || el.getAttribute('data-url') || el.getAttribute('data-href') || '';
            if (!href || href === '#' || href.indexOf('javascript:') === 0) continue;

            if (isBlockedAdUrl(href)) {
              el.setAttribute('data-original-ad-href', href);
              el.setAttribute('href', 'javascript:void(0);');
              el.removeAttribute('target');
              el.setAttribute('data-ad-blocked', 'true');
              el.onclick = function(ev) {
                if (ev) { ev.preventDefault(); ev.stopPropagation(); }
                console.warn('[Sandflix AdShield] Blocked click on ad link:', href);
                return false;
              };
            }
          }
        } catch(err) {}
      }

      // 5. Enforce streaming-friendly permissions on the player iframe
      function enforcePlayerIframeShield() {
        try {
          var iframe = document.getElementById('nbpEmbedIframe');
          if (iframe) {
            var currentSandbox = iframe.getAttribute('sandbox') || '';
            var targetSandbox = 'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox allow-downloads';
            if (currentSandbox !== targetSandbox) {
              iframe.setAttribute('sandbox', targetSandbox);
            }
            if (iframe.getAttribute('referrerpolicy') !== 'strict-origin-when-cross-origin') {
              iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            }
          }
        } catch(err) {}
      }

      window.SandflixAdShield = {
        unlinkAllAdLinks: unlinkAllAdLinks,
        enforcePlayerIframeShield: enforcePlayerIframeShield,
        isBlockedAdUrl: isBlockedAdUrl
      };

      // Run on DOM events and observer
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          unlinkAllAdLinks();
          enforcePlayerIframeShield();
        });
      } else {
        unlinkAllAdLinks();
        enforcePlayerIframeShield();
      }
      window.addEventListener('load', function() {
        unlinkAllAdLinks();
        enforcePlayerIframeShield();
      });

      try {
        var observer = new MutationObserver(function() {
          unlinkAllAdLinks();
          enforcePlayerIframeShield();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      } catch(e) {}
    })();

    function switchPage(pageKey, fromHistory) {
      try {
        var pageMap = {
          'home': 'home-view',
          'movies': 'movies-view',
          'shows': 'shows-view',
          'trailer': 'trailer-view',
          'watch': 'watch-view',
          'gallery': 'gallery-view',
          'search': 'search-view'
        };
        var targetId = pageMap[pageKey] || 'home-view';

        // Pause trailer if active
        var trailerVideo = document.getElementById('trailerVideo');
        if (trailerVideo && pageKey !== 'trailer' && !trailerVideo.paused) {
          try { trailerVideo.pause(); } catch(e){}
        }

        // Deactivate all views
        var views = document.querySelectorAll('.page-view');
        for (var i = 0; i < views.length; i++) {
          views[i].classList.remove('active');
        }

        // Activate target view
        var activeView = document.getElementById(targetId);
        if (activeView) {
          activeView.classList.add('active');
        }

        // Update desktop tabs
        var tabs = document.querySelectorAll('.tab-link');
        for (var j = 0; j < tabs.length; j++) {
          if (tabs[j].getAttribute('data-target') === targetId) {
            tabs[j].classList.add('active');
          } else {
            tabs[j].classList.remove('active');
          }
        }

        // Update mobile bottom nav (Home stays active when browsing Movies or TV Shows via mobile top bar)
        var mobTargetId = (targetId === 'movies-view' || targetId === 'shows-view') ? 'home-view' : targetId;
        var mobItems = document.querySelectorAll('.mobile-nav-item');
        for (var k = 0; k < mobItems.length; k++) {
          if (mobItems[k].getAttribute('data-target') === mobTargetId) {
            mobItems[k].classList.add('active');
          } else {
            mobItems[k].classList.remove('active');
          }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
          if (!fromHistory && window.history && window.history.pushState) {
            window.history.pushState({ type: 'page', page: pageKey }, null, '#' + pageKey);
          }
        } catch(e) {}
      } catch(err) {
        console.error('switchPage error:', err);
      }
    }
    window.switchPage = switchPage;

    // Dynamic CodeSpecters 5-Minute Key Generator (Never Expires)
    function getCodeSpectersKey() {
      try {
        var timeWindow = Math.floor(Date.now() / 300000);
        var hash = 0;
        var str = "NEXSTREAM" + timeWindow;
        for (var i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0;
        }
        return 'DEMO_' + Math.abs(hash).toString(16).padEnd(8, '0');
      } catch(e) {
        return 'DEMO_36da8cb2';
      }
    }
    window.getCodeSpectersKey = getCodeSpectersKey;

    var currentEmbedTmdbId = '';
    var currentEmbedServer = 1;

    function switchEmbedServer(serverNum) {
      var iframe = document.getElementById('nbpEmbedIframe');
      if (!iframe || !currentEmbedTmdbId) return;
      currentEmbedServer = serverNum;

      var pills = [
        document.getElementById('serverPill1'),
        document.getElementById('serverPill2'),
        document.getElementById('serverPill3'),
        document.getElementById('serverPill4')
      ];
      pills.forEach(function(pill, idx) {
        if (pill) {
          if (idx + 1 === serverNum) pill.classList.add('active');
          else pill.classList.remove('active');
        }
      });

      if (serverNum === 1) {
        iframe.src = 'https://peachify.net/movie/' + currentEmbedTmdbId;
      } else if (serverNum === 2) {
        iframe.src = 'https://api.codespecters.com/embed/movie/' + currentEmbedTmdbId + '?apikey=' + getCodeSpectersKey();
      } else if (serverNum === 3) {
        iframe.src = 'https://embedmaster.link/movie/' + currentEmbedTmdbId;
      } else if (serverNum === 4) {
        iframe.src = 'https://autoembed.co/movie/tmdb/' + currentEmbedTmdbId;
      }
    }
    window.switchEmbedServer = switchEmbedServer;

    function openEmbedPlayer(tmdbId, title, defaultServer, historyKey) {
      defaultServer = defaultServer || 1;
      currentEmbedTmdbId = String(tmdbId);
      var modal = document.getElementById('netflixBlackPlayerModal');
      var video = document.getElementById('nbpVideo');
      var embedIframe = document.getElementById('nbpEmbedIframe');
      var titleDisplay = document.getElementById('nbpCenterTitle');
      var spinner = document.getElementById('nbpSpinner');
      var serverBar = document.getElementById('nbpEmbedServerBar');

      if (modal) {
        modal.classList.add('active');
        modal.classList.add('is-embed-active');
        modal.setAttribute('aria-hidden', 'false');
      }
      document.body.style.overflow = 'hidden';
      if (video) {
        try { video.pause(); video.currentTime = 0; } catch(e){}
        video.style.display = 'none';
      }
      if (titleDisplay) titleDisplay.textContent = title;
      if (serverBar) serverBar.style.display = 'none';
      if (embedIframe) embedIframe.style.display = 'block';

      switchEmbedServer(defaultServer);

      if (spinner) spinner.classList.remove('active');
      try {
        if (window.history && window.history.pushState) {
          window.history.pushState({ type: 'netflix-player', targetTime: historyKey || ('embed_' + tmdbId) }, null, '#player');
        }
      } catch(e){}
    }
    window.openEmbedPlayer = openEmbedPlayer;

    function openNetflixBlackPlayer(targetTime, fromHistory) {
      if (typeof window.__realOpenNetflixBlackPlayer === 'function') {
        return window.__realOpenNetflixBlackPlayer(targetTime, fromHistory);
      }
      var isExplicitRamayana = (!targetTime || targetTime === 'part1' || targetTime === 'ramayana' || targetTime === 'act1' || targetTime === 'act2');
      if (isExplicitRamayana) {
        var video = document.getElementById('nbpVideo');
        if (video) video.style.display = 'block';
        return;
      }
      var tmdbMap = (window.SANDFLIX_EMBED_MOVIES && window.SANDFLIX_EMBED_MOVIES[targetTime]) ? window.SANDFLIX_EMBED_MOVIES[targetTime].tmdb : targetTime;
      openEmbedPlayer(tmdbMap, String(targetTime), 1, targetTime);
    }
    window.openNetflixBlackPlayer = openNetflixBlackPlayer;

    function closeNetflixBlackPlayer(fromHistory) {
      try {
        var modal = document.getElementById('netflixBlackPlayerModal');
        var video = document.getElementById('nbpVideo');
        var embedIframe = document.getElementById('nbpEmbedIframe');
        var serverBar = document.getElementById('nbpEmbedServerBar');

        if (serverBar) {
          serverBar.style.display = 'none';
        }
        currentEmbedTmdbId = '';

        if (modal) {
          modal.classList.remove('is-embed-active');
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
        }

        if (embedIframe) {
          embedIframe.style.display = 'none';
          embedIframe.removeAttribute('src');
        }

        if (video) {
          video.style.display = 'block';
          try { if (!video.paused) video.pause(); } catch(e){}
        }

        document.body.style.overflow = '';

        if (document.fullscreenElement) {
          try { document.exitFullscreen(); } catch(e){}
        }

        if (!fromHistory && window.location.hash === '#player') {
          var prevPage = 'home';
          if (typeof getCurrentActivePage === 'function') {
            prevPage = getCurrentActivePage() || 'home';
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState({ type: 'page', page: prevPage }, null, '#' + prevPage);
          }
        }
      } catch(err) {
        console.error('closeNetflixBlackPlayer error:', err);
      }
    }
    window.closeNetflixBlackPlayer = closeNetflixBlackPlayer;

    function playMovieInCinema(actKey) {
      actKey = actKey || 'act1';
      openNetflixBlackPlayer(actKey);
    }
    window.playMovieInCinema = playMovieInCinema;

    function startCinemaStream() {
      openNetflixBlackPlayer('act1');
    }
    window.startCinemaStream = startCinemaStream;

    function closeMovieDetailsModal() {
      var modal = document.getElementById('netflixMoreInfoModal');
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
    }
    window.closeMovieDetailsModal = closeMovieDetailsModal;

    function openMovieDetailsModal(movieKey) {
      movieKey = movieKey || 'part1';
      var modal = document.getElementById('netflixMoreInfoModal');
      if (!modal) return;
      window.currentModalMovieKey = movieKey;

      var movieDetailsMap = {
                                'verity': {
          title: 'VERITY',
          hero: 'assets/images/verity_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/verity_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'A 18+', dur: '1h 57m',
          desc: 'Lowen Ashleigh, hired to ghostwrite for best-selling author Verity Crawford, uncovers Verity\'s autobiographical notes, and becomes involved in what may prove to be a lethal conspiracy. Starring Dakota Johnson, Anne Hathaway, Josh Hartnett, Brady Wagner. Directed by Michael Showalter. Streamed in 4K UHD via Peachify.'
        },
        'devil_wears_prada_2': {
          title: 'THE DEVIL WEARS PRADA 2',
          hero: 'assets/images/devil_wears_prada_2_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/devil_wears_prada_2_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '1h 59m',
          desc: 'Andy Sachs returns to Runway as Miranda Priestly navigates a new media landscape and Runway\'s position within. The duo reconnect with former assistant Emily Charlton, now the head of a luxury brand that possesses funding which could ensure Runway\'s survival. Starring Meryl Streep, Anne Hathaway, Emily Blunt, Stanley Tucci. Directed by David Frankel. Streamed in 4K UHD via Peachify.'
        },
        'minions_monsters': {
          title: 'MINIONS & MONSTERS',
          hero: 'assets/images/minions_monsters_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/minions_monsters_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U', dur: '1h 30m',
          desc: 'This is the rambunctious, ridiculous and totally true story of how the Minions conquered Hollywood, became movie stars, lost everything, unleashed monsters onto the world and then banded together to try and save the planet from the mayhem they had just created. Starring Pierre Coffin, Trey Parker, Christoph Waltz, Allison Janney. Directed by Pierre Coffin. Streamed in 4K UHD via Peachify.'
        },
        'obsession': {
          title: 'OBSESSION',
          hero: 'assets/images/obsession_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/obsession_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'A 18+', dur: '1h 49m',
          desc: 'After breaking the mysterious "One Wish Willow" to win his crush\'s heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price. Starring Michael Johnston, Inde Navarrette, Cooper Tomlinson, Megan Lawless. Directed by Curry Barker. Streamed in 4K UHD via Peachify.'
        },
        'backrooms': {
          title: 'BACKROOMS',
          hero: 'assets/images/backrooms_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/backrooms_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'A 18+', dur: '1h 51m',
          desc: 'A strange doorway appears in the basement of a furniture showroom. Starring Chiwetel Ejiofor, Renate Reinsve, Finn Bennett, Lukita Maxwell. Directed by Kane Parsons. Streamed in 4K UHD via Peachify.'
        },
        'moana': {
          title: 'MOANA',
          hero: 'assets/images/moana_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/moana_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 7+', dur: '1h 55m',
          desc: 'Teenage Moana answers the Ocean\'s call and, for the first time, voyages beyond the reef of her island of Motunui with infamous demigod Maui on an unforgettable journey to restore prosperity to her people. Starring Catherine Lagaʻaia, Dwayne Johnson, Rena Owen, John Tui. Directed by Thomas Kail. Streamed in 4K UHD via Peachify.'
        },
        'disclosure_day': {
          title: 'DISCLOSURE DAY',
          hero: 'assets/images/disclosure_day_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/disclosure_day_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 26m',
          desc: 'A cybersecurity expert becomes a whistleblower after uncovering secrets about aliens, putting him on the run from a corporation. Meanwhile, a meteorologist experiencing strange phenomena joins forces with him to prove there\'s life beyond our understanding. Starring Emily Blunt, Josh O\'Connor, Colin Firth, Eve Hewson. Directed by Steven Spielberg. Streamed in 4K UHD via Peachify.'
        },
        'wuthering_heights': {
          title: 'WUTHERING HEIGHTS',
          hero: 'assets/images/wuthering_heights_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/wuthering_heights_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'A 18+', dur: '2h 16m',
          desc: 'Tragedy strikes when Heathcliff falls in love with Catherine Earnshaw, a woman from a wealthy family in 18th-century England. Starring Margot Robbie, Jacob Elordi, Hong Chau, Shazad Latif. Directed by Emerald Fennell. Streamed in 4K UHD via Peachify.'
        },
        'scream_7': {
          title: 'SCREAM 7',
          hero: 'assets/images/scream_7_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/scream_7_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'A 18+', dur: '1h 54m',
          desc: 'When a new Ghostface killer emerges in the quiet town where Sidney Prescott has built a new life, her darkest fears are realized as her daughter becomes the next target. Determined to protect her family, Sidney must face the horrors of her past to put an end to the bloodshed once and for all. Starring Neve Campbell, Isabel May, Courteney Cox, Jasmin Savoy Brown. Directed by Kevin Williamson. Streamed in 4K UHD via Peachify.'
        },
        'hanuman_ansh': {
          title: 'HANUMAN ANSH',
          hero: 'assets/images/hanuman_ansh_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/hanuman_ansh_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 7+', dur: '2h 10m',
          desc: 'A grieving boy seeks God to meet his departed mother, and in finding the divine, learns to serve humanity through the eternal devotion and inspiration of Lord Hanuman. Starring Shobhinaw Satyaa, Vihaan Shedge, Chandan Anand, Purnima Tiwari, Anil Rastogi. Directed by Vishal Chaturvedi. Streamed in 4K UHD via Peachify.'
        },
        'kon_city': {
          title: 'KON CITY',
          hero: 'assets/images/kon_city_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/kon_city_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 20m',
          desc: 'Saravana, Mithra, Jacky, and Janaki are skilled con artists hiding out as an ordinary family in Multan. Facing unexpected threats and gripping twists, they plan the ultimate heist. Starring Arjun Das, Anna Ben, Yogi Babu, Vadivukarasi, Thambi Ramaiah. Directed by Harish Durairaj. Streamed in 4K UHD via Peachify.'
        },
        'baththa': {
          title: 'BATHTHA',
          hero: 'assets/images/baththa_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/baththa_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 15m',
          desc: 'In 1986 Madras, a timid eight-year-old boy accidentally traps a feared gangster inside a deserted school toilet. As tension mounts and the hunt for the missing gangster intensifies, an unlikely bond and a chain of chaotic events reshape their lives. Starring Vijay Sethupathi, Sai Prithviraj, Lijomol Jose, and Sahasra Sree. Directed by Balaji Tharaneetharan. Streamed in 4K UHD via Peachify.'
        },
        'haiku': {
          title: 'HAIKU',
          hero: 'assets/images/haiku_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/haiku_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 10m',
          desc: 'A charismatic young man uses the delicate art of poetry to navigate the complex maze of modern romance and protect his fragile relationship against societal pressures. Starring Aegan, Sridevi Apalla, Femina George, and Adhirchi Arun. Directed by Yuvaraj Chinnasamy. Streamed in 4K UHD via Peachify.'
        },
        'gdn': {
          title: 'G.D.N',
          hero: 'assets/images/gdn_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/gdn_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 20m',
          desc: 'The inspiring biopic of G.D. Naidu, the Edison of India, who overcame insurmountable challenges and defied a repressive colonial regime to create transformative inventions and industrial breakthroughs. Starring R. Madhavan, Priyamani, Sathyaraj, and Jayaram. Directed by Krishnakumar Ramakumar. Streamed in 4K UHD via Peachify.'
        },
        'movie_418': {
          title: '418',
          hero: 'assets/images/movie_418_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/movie_418_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'A 18+', dur: '2h 05m',
          desc: 'Set in a medical college situated in a dread-stricken village, the gripping narrative confronts the rational science behind superstitions and the terrifying, superstitious truths lurking behind scientific reality. Starring Chaithra J Achar, Charan Lakkaraju, Preethi Pagadala, and Ramesh Indira. Directed by Kiran Nadagouda. Streamed in 4K UHD via Peachify.'
        },
        'steps': {
          title: 'STEPS',
          hero: 'assets/images/steps_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/steps_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 7+', dur: '1h 45m',
          desc: 'After being blamed for disrupting the Royal Ball with a stolen magic wand, a misunderstood stepsister accidentally turns her world upside down and embarks on an unforgettable fantasy adventure to restore harmony. Starring the vocal talents of Ali Wong, Amanda Seyfried, Stephanie Hsu, and Nikki Glaser. Directed by Alyce Tzue. Streamed in 4K UHD via Peachify.'
        },
        'kartavya': {
          title: 'KARTAVYA',
          hero: 'assets/images/kartavya_landscape.jpg?v=20261118_real_nflx',
          year: '2026', age: 'U/A 16+', dur: '1h 49m',
          desc: 'Local police officer Inspector Pawan Malik (Saif Ali Khan) is assigned to guard a fearless investigative journalist exposing a high-profile corruption racket tied to an influential spiritual cult. When the journalist is assassinated on his watch, Pawan must risk everything against political pressure and family threats to fulfill his sworn duty. Produced by Gauri Khan (Red Chillies Entertainment), directed by Pulkit. Starring Saif Ali Khan, Rasika Dugal, Sanjay Mishra. Streamed in 4K UHD via Peachify.',
          cast: 'Saif Ali Khan, Rasika Dugal, Sanjay Mishra, Zakir Hussain',
          director: 'Pulkit (Red Chillies Entertainment)',
          genres: 'Crime, Police Procedural, Drama, Thriller'
        },
        'gandhari': {
          title: 'GANDHARI',
          hero: 'assets/images/gandhari_landscape.jpg?v=20261118_real_nflx',
          year: '2026', age: 'A 18+', dur: '2h 10m',
          desc: 'When her young daughter is abducted from a crowded railway platform, mother Bani (Taapsee Pannu) is left temporarily blinded in the assault. Channeling the fierce mythical spirit of Gandhari, she transforms into an unstoppable lethal force of maternal vengeance to crush an interstate child trafficking syndicate and reclaim her child. Written & produced by Kanika Dhillon, directed by Devashish Makhija. Starring Taapsee Pannu, Ishwak Singh, Swastika Mukherjee. Streamed in 4K UHD via Peachify.',
          cast: 'Taapsee Pannu, Ishwak Singh, Swastika Mukherjee, Chhaya Kadam',
          director: 'Devashish Makhija (Written by Kanika Dhillon)',
          genres: 'Action, Maternal Revenge Thriller'
        },
        'toaster': {
          title: 'TOASTER',
          hero: 'assets/images/toaster_landscape.jpg?v=20261118_real_nflx',
          year: '2026', age: 'U/A 16+', dur: '1h 55m',
          desc: 'A hilarious and dark comic thriller following Ramakant (Rajkummar Rao), a hilariously stingy man who goes to absurdly extreme lengths to retrieve a luxury toaster he gifted after a wedding is suddenly called off. His relentless obsession inadvertently lands him straight into a chaotic web of murder, extortion, and absurd criminal mayhem. Produced by Patralekhaa & Rajkummar Rao, directed by Vivek Das Chaudhary. Starring Rajkummar Rao, Sanya Malhotra, Abhishek Banerjee, Farah Khan. Streamed in 4K UHD via Peachify.',
          cast: 'Rajkummar Rao, Sanya Malhotra, Abhishek Banerjee, Farah Khan',
          director: 'Vivek Das Chaudhary (Produced by Patralekhaa)',
          genres: 'Dark Comedy, Crime, Mystery'
        },
        'never-surrender': {
          title: 'NEVER SURRENDER',
          hero: 'assets/images/never_surrender_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/never_surrender_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'TV-MA 18+', dur: '2h 17m',
          desc: 'Hari (Lukman Sardi), an aging former special forces veteran living in a remote village, must protect his estranged grandchildren when a ruthless Jakarta crime syndicate storms their home seeking crucial evidence. Forced into survival, Hari unleashes his dormant combat skills to turn the house into an impenetrable fortress. Directed by Sidharta Tata, produced by Kimo Stamboel. Starring Lukman Sardi, Callista Arum, Donny Alamsyah, Derby Romero. Streamed in 4K UHD via Netflix / Peachify.',
          cast: 'Lukman Sardi, Callista Arum, Sulthan Hamonangan, Derby Romero, Donny Alamsyah',
          director: 'Sidharta Tata (Produced by Kimo Stamboel & Edwin Nazir)',
          genres: 'Action, Crime, Thriller, Special Forces'
        },
        'never_surrender': {
          title: 'NEVER SURRENDER',
          hero: 'assets/images/never_surrender_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/never_surrender_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'TV-MA 18+', dur: '2h 17m',
          desc: 'Hari (Lukman Sardi), an aging former special forces veteran living in a remote village, must protect his estranged grandchildren when a ruthless Jakarta crime syndicate storms their home seeking crucial evidence. Forced into survival, Hari unleashes his dormant combat skills to turn the house into an impenetrable fortress. Directed by Sidharta Tata, produced by Kimo Stamboel. Starring Lukman Sardi, Callista Arum, Donny Alamsyah, Derby Romero. Streamed in 4K UHD via Netflix / Peachify.',
          cast: 'Lukman Sardi, Callista Arum, Sulthan Hamonangan, Derby Romero, Donny Alamsyah',
          director: 'Sidharta Tata (Produced by Kimo Stamboel & Edwin Nazir)',
          genres: 'Action, Crime, Thriller, Special Forces'
        },
        'neversurrender': {
          title: 'NEVER SURRENDER',
          hero: 'assets/images/never_surrender_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/never_surrender_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'TV-MA 18+', dur: '2h 17m',
          desc: 'Hari (Lukman Sardi), an aging former special forces veteran living in a remote village, must protect his estranged grandchildren when a ruthless Jakarta crime syndicate storms their home seeking crucial evidence. Forced into survival, Hari unleashes his dormant combat skills to turn the house into an impenetrable fortress. Directed by Sidharta Tata, produced by Kimo Stamboel. Starring Lukman Sardi, Callista Arum, Donny Alamsyah, Derby Romero. Streamed in 4K UHD via Netflix / Peachify.',
          cast: 'Lukman Sardi, Callista Arum, Sulthan Hamonangan, Derby Romero, Donny Alamsyah',
          director: 'Sidharta Tata (Produced by Kimo Stamboel & Edwin Nazir)',
          genres: 'Action, Crime, Thriller, Special Forces'
        },
        'akka': {
          title: 'NEVER SURRENDER',
          hero: 'assets/images/never_surrender_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/never_surrender_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'TV-MA 18+', dur: '2h 17m',
          desc: 'Hari (Lukman Sardi), an aging former special forces veteran living in a remote village, must protect his estranged grandchildren when a ruthless Jakarta crime syndicate storms their home seeking crucial evidence. Forced into survival, Hari unleashes his dormant combat skills to turn the house into an impenetrable fortress. Directed by Sidharta Tata, produced by Kimo Stamboel. Starring Lukman Sardi, Callista Arum, Donny Alamsyah, Derby Romero. Streamed in 4K UHD via Netflix / Peachify.',
          cast: 'Lukman Sardi, Callista Arum, Sulthan Hamonangan, Derby Romero, Donny Alamsyah',
          director: 'Sidharta Tata (Produced by Kimo Stamboel & Edwin Nazir)',
          genres: 'Action, Crime, Thriller, Special Forces'
        }
,
        'spiderman_brand_new_day': {
          title: 'SPIDER-MAN: BRAND NEW DAY',
          hero: 'assets/images/spiderman_brand_new_day_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'PG-13', dur: 'Summer 2026',
          desc: 'Peter Parker begins a brand-new chapter navigating life after the worldwide memory wipe erased his civilian identity. As street-level crime escalates across New York City and formidable new adversaries emerge from the shadows, Spider-Man must forge unexpected alliances and discover what it truly costs to be a standalone hero.',
          cast: 'Tom Holland, Zendaya, Jacob Batalon, Mark Ruffalo',
          director: 'Destin Daniel Cretton (Marvel Studios / Sony Pictures)',
          genres: 'Superhero, Action, Adventure, Sci-Fi, Marvel Studios, Sony Pictures'
        },
        'clayface': {
          title: 'CLAYFACE',
          hero: 'assets/images/clayface_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'R', dur: 'Fall 2026',
          desc: 'A body-horror psychological noir exploring the tragic descent of Basil Karlo, a once-revered B-movie actor whose desperate quest for vanity and youth leads him to an experimental chemical treatment. Mutating into a monstrous, shape-shifting entity consumed by identity dysphoria, he wages a horrifying war against Gotham City\'s elite.',
          cast: 'Mike Flanagan Ensemble, DC Studios Cast',
          director: 'Mike Flanagan (DC Studios / Warner Bros. Pictures)',
          genres: 'Horror, Thriller, DC Studios, Crime, Sci-Fi, Psychological Drama'
        },
        'resident_evil_2026': {
          title: 'RESIDENT EVIL',
          hero: 'assets/images/resident_evil_2026_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'R', dur: 'Fall 2026',
          desc: 'A terrifying cinematic reboot returning to the claustrophobic survival-horror roots of Capcom\'s iconic franchise. Trapped deep inside the infected bio-weapons research complex of the Arklay Mountains, a specialized tactical team faces grotesque viral mutations and Umbrella Corporation\'s catastrophic bio-hazard cover-up.',
          cast: 'Zach Cregger Cast, Capcom Universe',
          director: 'Zach Cregger (Sony Pictures & PlayStation Productions)',
          genres: 'Survival Horror, Sci-Fi, Action, Capcom, Sony Pictures'
        },
        'street_fighter': {
          title: 'STREET FIGHTER',
          hero: 'assets/images/street_fighter_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'PG-13', dur: 'March 2026',
          desc: 'Legendary martial artists from across the globe converge to battle in the shadowy World Warrior Tournament orchestrated by M. Bison\'s Shadaloo syndicate. Ryu and Ken Masters must master the ancient power of Ansatsuken and overcome dark Hadou energy to prevent worldwide devastation.',
          cast: 'Legendary Action Cast, World Warrior Contenders',
          director: 'Kitao Sakurai (Legendary Entertainment & Capcom)',
          genres: 'Martial Arts, Action, Gaming, Capcom, Legendary Pictures'
        },
        'toy_story_5': {
          title: 'TOY STORY 5',
          hero: 'assets/images/toy_story_5_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'G', dur: 'June 2026',
          desc: 'Woody, Buzz Lightyear, and the beloved toy crew face their ultimate 21st-century existential challenge: competing for children\'s devotion against modern digital screens, tablets, and interactive electronics. Together, they embark on a hilarious, heartwarming quest to prove the enduring magic of imagination and playtime.',
          cast: 'Tom Hanks (Woody), Tim Allen (Buzz Lightyear), Joan Cusack (Jessie)',
          director: 'Andrew Stanton (Pixar Animation Studios & Walt Disney Pictures)',
          genres: 'Animation, Family, Adventure, Comedy, Pixar / Disney'
        },
        'supergirl_woman_of_tomorrow': {
          title: 'SUPERGIRL: WOMAN OF TOMORROW',
          hero: 'assets/images/supergirl_woman_of_tomorrow_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'PG-13', dur: 'June 2026',
          desc: 'Unlike her cousin Superman who was raised on Earth by loving parents, Kara Zor-El grew up on a chipped-off rock of Krypton, witnessing everyone around her die tragically. Hardened and accompanied by Krypto the Superdog, she embarks on an epic, interstellar revenge quest across the cosmos with an alien girl named Ruthye.',
          cast: 'Milly Alcock (Kara Zor-El / Supergirl), Matthias Schoenaerts (Krem), Eve Ridley (Ruthye)',
          director: 'Craig Gillespie (DC Studios / James Gunn & Peter Safran)',
          genres: 'Sci-Fi, Superhero, Space Opera, DC Studios, Warner Bros'
        },
        'mandalorian_and_grogu': {
          title: 'STAR WARS: THE MANDALORIAN AND GROGU',
          hero: 'assets/images/mandalorian_and_grogu_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'PG-13', dur: 'May 2026',
          desc: 'The legendary Mandalorian bounty hunter Din Djarin and his Force-sensitive apprentice Grogu transition to the grand theatrical big screen. Partnering with the fledgling New Republic, they hunt Imperial remnants scheming in the dark corners of the outer rim galaxy to protect the fragile peace.',
          cast: 'Pedro Pascal (Din Djarin / The Mandalorian), Sigourney Weaver, Grogu',
          director: 'Jon Favreau (Lucasfilm & Walt Disney Studios)',
          genres: 'Sci-Fi, Space Opera, Action, Lucasfilm, Disney'
        },
        'godzilla_minus_zero': {
          title: 'GODZILLA MINUS ZERO',
          hero: 'assets/images/godzilla_minus_zero_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'PG-13', dur: 'November 2026',
          desc: 'Following the Academy Award-winning global triumph of Godzilla Minus One, visionary director Takashi Yamazaki returns with the next colossal chapter in the Toho kaiju saga. As postwar Japan strives to rebuild, a terrifying atomic terror re-emerges from the oceanic abyss with catastrophic destructive fury.',
          cast: 'Ryunosuke Kamiki, Minami Hamabe, Toho Ensemble',
          director: 'Takashi Yamazaki (Toho Co., Ltd.)',
          genres: 'Kaiju, Monster, Sci-Fi, Historical Drama, Toho Studios'
        },
        'project_hail_mary': {
          title: 'PROJECT HAIL MARY',
          hero: 'assets/images/project_hail_mary_landscape.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'PG-13', dur: 'March 2026',
          desc: 'Ryland Grace, a middle-school science teacher turned lone survivor of an interstellar desperate mission, awakens from a coma with amnesia light-years from Earth. As our sun dies from an alien microbe, Grace must combine scientific deduction and an extraordinary interspecies friendship with an alien named Rocky to save humanity.',
          cast: 'Ryan Gosling (Ryland Grace), Sandra Hüller (Eva Stratt), Milana Vayntrub',
          director: 'Phil Lord & Christopher Miller (Amazon MGM Studios)',
          genres: 'Hard Sci-Fi, Space Exploration, Adventure, Amazon MGM Studios'
        },
        'daayra': {
          title: 'DAAYRA',
          hero: 'assets/images/daayra_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/daayra_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 21m',
          desc: 'Raman (Prithviraj Sukumaran), a seasoned police officer with a controversial record of staged encounters and harsh interrogations, finds himself locked in an intense psychological battle as Ajooni (Kareena Kapoor Khan) relentlessly challenges his methods at every step. Directed by Meghna Gulzar, produced by Junglee Pictures & Pen Studios. Streamed in 4K UHD via Peachify.',
          cast: 'Kareena Kapoor Khan, Prithviraj Sukumaran, Pragati Mishra, Prammod Sanghi, Sumali Khaniwale',
          director: 'Meghna Gulzar',
          genres: 'Crime, Drama'
        },
        'vishwanath_and_sons': {
          title: 'VISHWANATH & SONS',
          hero: 'assets/images/vishwanath_and_sons_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/vishwanath_and_sons_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 41m',
          desc: 'A heartwarming and gripping drama chronicling the legacy of a distinguished family firm. When unexpected corporate rivals and interpersonal tensions threaten everything their patriarch built, a devoted son steps forward to reclaim honor and justice. Starring Suriya, Mamitha Baiju, Raveena Tandon. Directed by Venky Atluri. Streamed in 4K UHD via Peachify.',
          cast: 'Suriya, Mamitha Baiju, Radhika Sarathkumar, Raveena Tandon, Sunil',
          director: 'Venky Atluri',
          genres: 'Drama, Romance, Comedy'
        },
        'gajab_raat': {
          title: 'GAJAB RAAT',
          hero: 'assets/images/gajab_raat_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/gajab_raat_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 4m',
          desc: 'A gripping nocturnal thriller where an unexpected chain of events plunges an ordinary town into a maze of crime, suspense, and dark revelations before sunrise. Starring Manoj Bajpayee, Divya Dutta, Akshay Oberoi, Saqib Saleem. Directed by Ritesh Shah. Streamed in 1080P HEVC via Peachify.',
          cast: 'Manoj Bajpayee, Divya Dutta, Akshay Oberoi, Saqib Saleem, Shraddha Das',
          director: 'Ritesh Shah',
          genres: 'Thriller, Crime'
        },
        'dilwali_diwali': {
          title: 'DILWALI DIWALI',
          hero: 'assets/images/dilwali_diwali_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/dilwali_diwali_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '1h 1m',
          desc: 'A lighthearted festive comedy exploring the chaotic, humorous, and emotional mishaps of a vibrant Indian family gathering for Diwali celebrations. Starring Mihir Ahuja, Manoj Pahwa, Neelu Kohli. Directed by Ritesh Menon. Streamed in 1080P HEVC via Peachify.',
          cast: 'Mihir Ahuja, Manoj Pahwa, Neelu Kohli, Aura Bhatnagar Badoni, Manmeet Singh Sawhney',
          director: 'Ritesh Menon',
          genres: 'Comedy'
        },
        'mahavatar_narsimha': {
          title: 'MAHAVATAR NARSIMHA',
          hero: 'assets/images/mahavatar_narsimha_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/mahavatar_narsimha_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2025', age: 'U/A 13+', dur: '2h 11m',
          desc: 'An epic animated cinematic saga portraying the divine avatar of Lord Vishnu—Narasimha—and his supreme manifestation to vanquish the demonic king Hiranyakashipu and protect his devout follower Prahlada. Directed by Ashwin Kumar. Streamed in 4K UHD via Peachify.',
          cast: 'Harjeet Walia, Aditya Raj Sharma, Haripriya Matta, Sanket Jaiswal, Priyanka Bhandari',
          director: 'Ashwin Kumar',
          genres: 'Animation, Action, Fantasy, Drama'
        },
        'border_2': {
          title: 'BORDER 2',
          hero: 'assets/images/border_2_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/border_2_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '3h 21m',
          desc: 'The grand military action sequel set against the backdrop of historical conflicts. A courageous battalion of Indian soldiers mounts an unyielding defense against overwhelming enemy forces, exemplifying ultimate valor, brotherhood, and patriotism. Starring Sunny Deol, Varun Dhawan, Diljit Dosanjh, Ahan Shetty. Directed by Anurag Singh. Streamed in 4K UHD via Peachify.',
          cast: 'Sunny Deol, Varun Dhawan, Diljit Dosanjh, Ahan Shetty, Mona Singh',
          director: 'Anurag Singh',
          genres: 'Action, Drama, War'
        },
        'ikkis': {
          title: 'IKKIS',
          hero: 'assets/images/ikkis_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/ikkis_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '2h 28m',
          desc: 'A deeply moving biographical war drama recounting the extraordinary bravery and sacrifice of Second Lieutenant Arun Khetarpal PVC, who fought heroically during the Battle of Basantar at the age of twenty-one. Starring Dharmendra, Jaideep Ahlawat, Agastya Nanda. Directed by Sriram Raghavan. Streamed in 1080P HEVC via Peachify.',
          cast: 'Dharmendra, Jaideep Ahlawat, Agastya Nanda, Simar Bhatia, Shree Bishnoi',
          director: 'Sriram Raghavan',
          genres: 'History, War, Drama'
        },
        'guarding_stars': {
          title: 'GUARDING STARS',
          hero: 'assets/images/guarding_stars_landscape.jpg?v=20261124_v133_turbo_speed',
          poster: 'assets/images/guarding_stars_poster.jpg?v=20261124_v133_turbo_speed',
          year: '2026', age: 'U/A 13+', dur: '1h 49m',
          desc: 'An engaging romantic comedy following a high-profile bodyguard tasked with protecting an eccentric international music star, only to find unexpected affection blossoming amidst chaos and spotlights. Starring Leighton Meester, Jared Padalecki, Andie MacDowell. Directed by Elizabeth Allen Rosenbaum. Streamed in 4K UHD via Peachify.',
          cast: 'Leighton Meester, Jared Padalecki, Andie MacDowell, Walker Hayes, Noah LaLonde',
          director: 'Elizabeth Allen Rosenbaum',
          genres: 'Romance, Comedy'
        },
      };

      var item = movieDetailsMap[movieKey];
      if (!item && typeof window.__realOpenMovieDetailsModal === 'function') {
        window.__realOpenMovieDetailsModal(movieKey);
        return;
      }
      if (item) {
        var titleEl = document.getElementById('nModalTitle');
        var heroImg = document.getElementById('nModalHeroImg');
        var yearEl = document.getElementById('nModalYear');
        var ageEl = document.getElementById('nModalAge');
        var durEl = document.getElementById('nModalDur');
        var descEl = document.getElementById('nModalDesc');
        var castEl = document.getElementById('nModalCast');
        var dirEl = document.getElementById('nModalDirector');
        var genEl = document.getElementById('nModalGenres');

        if (titleEl) titleEl.textContent = item.title;
        if (heroImg) heroImg.src = item.hero;
        if (yearEl) yearEl.textContent = item.year;
        if (ageEl) ageEl.textContent = item.age;
        if (durEl) durEl.textContent = item.dur;
        if (descEl) descEl.textContent = item.desc;
        if (castEl && item.cast) castEl.textContent = item.cast;
        if (dirEl && item.director) dirEl.textContent = item.director;
        if (genEl && item.genres) genEl.textContent = item.genres;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        return;
      }

      if (typeof window.__realOpenMovieDetailsModal === 'function') {
        window.__realOpenMovieDetailsModal(movieKey);
      }
    }
    window.openMovieDetailsModal = openMovieDetailsModal;

    function filterMoviesCatalog(category, buttonEl) {
      var pills = document.querySelectorAll('.movies-filter-bar .filter-pill');
      pills.forEach(function(p) { p.classList.remove('active'); });
      if (buttonEl) buttonEl.classList.add('active');

      var cards = document.querySelectorAll('.movies-grid .movie-banner-card');
      cards.forEach(function(card) {
        var cardCats = (card.getAttribute('data-category') || '').split(' ');
        if (category === 'all' || cardCats.indexOf(category) !== -1) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
    window.filterMoviesCatalog = filterMoviesCatalog;

    // Attach immediate click listeners for zero delay
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('[data-target="movies-view"]').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          switchPage('movies');
        });
      });

      var hash = (window.location.hash || '').replace('#', '');
      if (hash && ['home', 'movies', 'trailer', 'watch', 'gallery'].indexOf(hash) !== -1) {
        switchPage(hash);
      }
    });
