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
   Theme Toggle
------------------------------ */
  const themeToggle = document.getElementById('theme-toggle');
  const docElement = document.documentElement;
  const body = document.body;
  const darkVideo = document.querySelector('.hero__video--dark');
  const lightVideo = document.querySelector('.hero__video--light');

  const applyTheme = (theme) => {
    const themeClass = theme + '-mode';
    docElement.classList.remove('light-mode', 'dark-mode');
    body.classList.remove('light-mode', 'dark-mode');
    docElement.classList.add(themeClass);
    body.classList.add(themeClass);
  };

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  const currentTheme = docElement.classList.contains('dark-mode') ? 'dark' : 'light';
  if (themeToggle) {
    themeToggle.checked = currentTheme === 'light';
  }

  themeToggle.addEventListener('change', () => {
    const isDarkMode = docElement.classList.contains('dark-mode');
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
      document.body.classList.toggle('no-scroll');
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
      const sectionTop = current.offsetTop - 600;
      const sectionId = current.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        link && link.classList.add('active');
      } else {
        link && link.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', debounce(activateNavLink)); // Run once on page load to highlight the initial section

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
       Contact Form Validation & Dual Submission (Email & Sheet)
    ------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formFields = ['name', 'email', 'subject', 'message'];

  if (contactForm) {
    // Basic validators
    const validators = {
      name: (value) => value.trim().length >= 2,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      subject: (value) => value.trim().length >= 3,
      message: (value) => value.trim().length >= 10
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Instantly stop default browser submission
      let isValid = true;
      const submitButton = contactForm.querySelector('button[type="submit"]');

      // 1. Check all fields and show inline errors
      formFields.forEach(field => {
        const input = contactForm.elements[field];
        const errorEl = document.getElementById(`${field}-error`);
        if (input && errorEl) {
          if (!input.value.trim()) {
            // Show custom inline error if empty
            errorEl.textContent = `*${field.charAt(0).toUpperCase() + field.slice(1)} required`;
            isValid = false;
          } else if (!validators[field](input.value)) {
            // Show custom inline error if invalid format
            errorEl.textContent = `*Valid ${field} required`;
            isValid = false;
          } else {
            // Clear error if perfectly valid
            errorEl.textContent = '';
          }
        }
      });

      // 2. If valid, proceed with dual Google Script submission
      if (isValid) {
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        const formData = new FormData(contactForm);

        // URL 1: Your NEW script that sends the HTML Email
        const emailScriptURL = 'https://script.google.com/macros/s/AKfycbwHCPqe59BZiL5sKY5TU9ScDX9BuP_iG2ClpEqXNRFlfo0DO0d0zFXI_undPd9GGScSUw/exec';

        // URL 2: Your ORIGINAL script that updates the Google Sheet
        const sheetScriptURL = 'https://script.google.com/macros/s/AKfycbw5iMeqci8YZSSZwUs8GtoQpJtgoHLHfyQkEKMZjX_PyPIfvjYZHKbO3eI9ARYCCcE/exec';

        // Create two separate fetch requests
        const emailPromise = fetch(emailScriptURL, {
          method: 'POST',
          body: formData
        }).then(res => res.json()).catch(err => ({ result: "error", error: err }));

        const sheetPromise = fetch(sheetScriptURL, {
          method: 'POST',
          body: formData
        }).then(res => res.json()).catch(err => ({ result: "error", error: err }));

        // Execute both simultaneously
        Promise.all([emailPromise, sheetPromise])
          .then(([emailData, sheetData]) => {
            console.log('Email Script Status:', emailData);
            console.log('Sheet Script Status:', sheetData);

            // As long as at least one succeeds, show success to the user
            if (emailData.result === "success" || sheetData.result === "success") {
              submitButton.textContent = 'Message Sent Successfully!';
              contactForm.reset();
            } else {
              submitButton.textContent = 'Submission Failed';
            }
          })
          .catch((error) => {
            console.error('Network Error:', error);
            submitButton.textContent = 'Error sending message';
          })
          .finally(() => {
            // Reset the form and button after 3 seconds
            setTimeout(() => {
              formFields.forEach(field => {
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
