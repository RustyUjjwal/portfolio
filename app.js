// app.js - Portfolio interactivity
function debounce(func, delay = 100) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

window.onbeforeunload = function () {
  window.scrollTo(-1, -1);
};

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('copyright-year').textContent = new Date().getFullYear();
  document.body.classList.add('loading');

  /* ------------------------------
       Loader & Video Preloading
    ------------------------------ */
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loader-progress');
  const loaderPercentage = document.getElementById('loader-percentage');

  function preloadVideos() {
    const videosToPreload = [
      document.querySelector('.hero__video--dark'),
      document.querySelector('.hero__video--light')
    ];
    const videoPromises = [];

    videosToPreload.forEach(video => {
      if (video) {
        const promise = new Promise((resolve) => {
          if (video.readyState >= 4) { // HAVE_ENOUGH_DATA
            resolve();
          } else {
            video.addEventListener('canplaythrough', resolve, { once: true });
          }
        });
        videoPromises.push(promise);
      }
    });

    return Promise.all(videoPromises);
  }

  async function initLoader() {
    if (!loader || !loaderProgress || !loaderPercentage) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
      }
      loaderProgress.style.width = progress + '%';
      loaderPercentage.textContent = Math.floor(progress) + '%';
    }, 200);

    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));
    await Promise.all([preloadVideos(), minDelay]);

    clearInterval(interval);
    loaderProgress.style.width = '100%';
    loaderPercentage.textContent = '100%';

    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, 400);
  }

  initLoader();

  /* ------------------------------
     Theme (Light/Dark Mode) Toggle
  ------------------------------ */
  function updatePrismTheme(theme) {
    const prismThemeLink = document.getElementById('prism-theme');
    if (prismThemeLink) {
      prismThemeLink.href = theme === 'dark' ? 'prism-pro-dark.css' : 'prism-pro-light.css';
    }
  }
  
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const darkVideo = document.querySelector('.hero__video--dark');
  const lightVideo = document.querySelector('.hero__video--light');

  const applyTheme = (theme) => {
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(theme + '-mode');
    // Add this line to update the Prism theme
    updatePrismTheme(theme); 
  };

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const isDarkMode = body.classList.contains('dark-mode');
    let currentTime = 0;

    if (isDarkMode && darkVideo) {
      currentTime = darkVideo.currentTime;
    } else if (!isDarkMode && lightVideo) {
      currentTime = lightVideo.currentTime;
    }

    const newTheme = isDarkMode ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'light' && lightVideo) {
      lightVideo.currentTime = currentTime;
      lightVideo.play();
    } else if (newTheme === 'dark' && darkVideo) {
      darkVideo.currentTime = currentTime;
      darkVideo.play();
    }
  });

  /* ------------------------------
     Mobile Navigation Toggle
  ------------------------------ */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle && navToggle.classList.remove('active');
      }
    });
  });

  /* ------------------------------
     Active Navigation Link on Scroll
  ------------------------------ */
  const sections = document.querySelectorAll('section[id]');
  function activateNavLink() {
    let scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150;
      const sectionId = current.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        link && link.classList.add('active');
      } else {
        link && link.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', debounce(activateNavLink));

  /* ------------------------------
     Interactive Skills Section
  ------------------------------ */
  const skills = document.querySelectorAll('.skill');
  skills.forEach(skill => {
    const progress = skill.querySelector('.skill__progress');
    const level = skill.getAttribute('data-level');

    skill.addEventListener('mouseover', () => {
      if (progress) {
        progress.style.width = level + '%';
      }
    });

    skill.addEventListener('mouseout', () => {
      if (progress) {
        progress.style.width = '0%';
      }
    });
  });


  /* ------------------------------
     Fade-in Elements on Scroll
  ------------------------------ */
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('section, .project-card, .service-card').forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
  });

  /* ------------------------------
     Project Filtering
  ------------------------------ */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || filterValue === cardCategory) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

/* ------------------------------
     Contact Form Validation & Dual Submission
  ------------------------------ */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const validators = {
      name: (value) => value.trim().length >= 2,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      subject: (value) => value.trim().length >= 3,
      message: (value) => value.trim().length >= 10
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      const submitButton = contactForm.querySelector('button[type="submit"]');

      ['name', 'email', 'subject', 'message'].forEach(field => {
        const input = contactForm.elements[field];
        const errorEl = document.getElementById(`${field}-error`);
        if (input && errorEl) {
          if (!validators[field](input.value)) {
            errorEl.textContent = `Please enter a valid ${field}.`;
            isValid = false;
          } else {
            errorEl.textContent = '';
          }
        }
      });

      if (isValid) {
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData.entries());
        const json = JSON.stringify(object);

        const googleScriptURL = 'https://script.google.com/macros/s/AKfycbw5iMeqci8YZSSZwUs8GtoQpJtgoHLHfyQkEKMZjX_PyPIfvjYZHKbO3eI9ARYCCcE/exec';
        const web3FormsURL = 'https://api.web3forms.com/submit';

        const web3FormsPromise = fetch(web3FormsURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: json
        }).then(res => res.json());

        const googleScriptPromise = fetch(googleScriptURL, {
            method: 'POST',
            body: formData
        }).then(res => res.json());

        Promise.all([web3FormsPromise, googleScriptPromise])
          .then(([web3FormsData, googleScriptData]) => {
            if (web3FormsData.success) {
                submitButton.textContent = 'Message Sent!';
            } else {
                console.error('Error from Web3Forms:', web3FormsData.message);
                submitButton.textContent = 'Submission Failed';
            }
            console.log('Google Script submission status:', googleScriptData.result);
          })
          .catch((error) => {
            console.error('Network or Fetch Error:', error);
            submitButton.textContent = 'Error!';
            alert('A network error occurred. Please try again.');
          })
          .finally(() => {
            setTimeout(() => {
                contactForm.reset();
                ['name', 'email', 'subject', 'message'].forEach(field => {
                    const errorEl = document.getElementById(`${field}-error`);
                    if (errorEl) errorEl.textContent = '';
                });
                submitButton.textContent = 'Send Message';
                submitButton.disabled = false;
            }, 3000);
          });
      }
    });
  }

  /* ------------------------------
     Typewriter Effect
  ------------------------------ */
  function typewriterEffect() {
    const targetElement = document.getElementById('typewriter-text');
    if (!targetElement) return;

    const words = ["Electrical Engineer", "Innovator", "Problem Solver", "Embedded Systems Dev"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        targetElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        targetElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = 150;
      if (isDeleting) typeSpeed /= 2;

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }
    type();
  }
  typewriterEffect();

  /* ------------------------------
     Experience/Education Tabs
  ------------------------------ */
  const aboutContainer = document.querySelector('.about__container');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.timeline-section');
  const timelineCloseBtn = document.querySelector('.timeline-close-btn');
  const myselfButton = document.querySelector('.tab-btn[data-tab="myself"]');

  const showDefaultView = () => {
    aboutContainer.classList.remove('timeline-active');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    if (myselfButton) {
        myselfButton.classList.add('active');
    }
  };

  showDefaultView();

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        if (tab === 'education' || tab === 'experience') {
            aboutContainer.classList.add('timeline-active');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === `${tab}-content`);
            });
        } else {
            showDefaultView();
        }
    });
  });

  if (timelineCloseBtn) {
    timelineCloseBtn.addEventListener('click', showDefaultView);
  }

  /* ------------------------------
     Code Snippet Modal (FIXED)
  ------------------------------ */
  let projectCodeSnippets = {};
  const modalOverlay = document.getElementById('code-modal');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const modalTabsContainer = document.getElementById('modal-tabs-container');
  const modalCodePre = document.getElementById('modal-code-block-pre');
  const modalCode = document.getElementById('modal-code-block-code');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Function to update the code displayed in the modal
  function updateCodeBlock(code, lang) {
      modalCode.textContent = code.trim();
      modalCode.className = `language-${lang}`;
      modalCodePre.className = `line-numbers language-${lang}`;
      Prism.highlightAll();
  }
  
  // Function to set up the click listeners for all "Source Code" buttons
  function setupModalButtons() {
      const sourceCodeBtns = document.querySelectorAll('.source-code-btn');
      sourceCodeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const projectId = btn.getAttribute('data-project');
          const projectData = projectCodeSnippets[projectId];

          if (projectData && projectData.files) {
            // Clear any existing tabs
            modalTabsContainer.innerHTML = '';
            
            // Set the project title in the modal
            modalProjectTitle.textContent = projectData.title;

            const files = projectData.files;
            const fileNames = Object.keys(files);

            // Create a tab button for each file
            fileNames.forEach((fileName, index) => {
                const fileInfo = files[fileName];
                const button = document.createElement('button');
                button.textContent = fileName;
                button.className = 'tab-btn text-sm font-medium text-gray-400 hover:text-white pb-2 flex-shrink-0';
                button.dataset.lang = fileInfo.lang;
                
                button.addEventListener('click', () => {
                    modalTabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    button.classList.add('active');
                    updateCodeBlock(fileInfo.code, fileInfo.lang);
                });

                modalTabsContainer.appendChild(button);

                if (index === 0) {
                    button.classList.add('active');
                    updateCodeBlock(fileInfo.code, fileInfo.lang);
                }
            });

            // Show the modal
            modalOverlay.classList.remove('hidden');
          } else {
            console.error(`No data or files found for project: ${projectId}`);
          }
        });
      });
  }

  // Fetch the snippets, and ONLY when it's done, set up the buttons
  fetch('snippets.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
      projectCodeSnippets = data;
      // *** THIS IS THE IMPORTANT PART ***
      // We now call the function to add listeners AFTER the data is loaded.
      setupModalButtons(); 
    })
    .catch(error => console.error('Error loading or parsing code snippets:', error));


  // Logic for closing the modal (remains the same)
  const closeModal = () => {
    modalOverlay.classList.add('hidden');
  };

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });


  /* ------------------------------
   Animated Counter on Scroll
------------------------------ */
function animatedCounter() {
  const counters = document.querySelectorAll('.highlight__number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const duration = 1500;
        let current = 0;
        counter.textContent = '0+';
        const increment = target / (duration / 16); 

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current) + '+';
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target + '+';
          }
        };
        requestAnimationFrame(updateCounter);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(counter => {
    observer.observe(counter);
  });
}
animatedCounter();
  
});