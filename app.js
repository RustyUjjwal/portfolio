// app.js - Portfolio interactivity

window.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------
       Loader & Video Preloading
    ------------------------------ */
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loader-progress');
  const loaderPercentage = document.getElementById('loader-percentage');

  function preloadVideos() {
    // Find all videos that need preloading
    const videosToPreload = [
      document.querySelector('.hero__video--dark'),
      document.querySelector('.hero__video--light')
    ];
    const videoPromises = [];

    videosToPreload.forEach(video => {
      if (video) {
        // Create a promise that resolves when the video is ready to play
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

  // This function runs the loader
  async function initLoader() {
    if (!loader || !loaderProgress || !loaderPercentage) return;

    let progress = 0;
    // Start a fake progress interval
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
      }
      loaderProgress.style.width = progress + '%';
      loaderPercentage.textContent = Math.floor(progress) + '%';
    }, 200);

    // Set a minimum display time for the loader (e.g., 2.5 seconds)
    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

    // Wait for both videos to be ready AND for the minimum delay to pass
    await Promise.all([preloadVideos(), minDelay]);

    // Finish the progress bar animation
    clearInterval(interval);
    loaderProgress.style.width = '100%';
    loaderPercentage.textContent = '100%';

    // Fade out the loader
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 400); // A small delay after reaching 100%
  }

  initLoader();

  /* ------------------------------
     Theme (Light/Dark Mode) Toggle
  ------------------------------ */
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const darkVideo = document.querySelector('.hero__video--dark');
  const lightVideo = document.querySelector('.hero__video--light');

  // Function to apply the saved theme
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  };

  // Check for saved theme in localStorage
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // If no saved theme, use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const isDarkMode = body.classList.contains('dark-mode');
    let currentTime = 0;

    // 1. Get the timestamp from the currently visible video
    if (isDarkMode && darkVideo) {
      currentTime = darkVideo.currentTime;
    } else if (!isDarkMode && lightVideo) {
      currentTime = lightVideo.currentTime;
    }

    // 2. Apply the theme switch
    const newTheme = isDarkMode ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // 3. Set the new video's timestamp and ensure it plays
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
      // Close menu after selection (mobile)
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
      const sectionTop = current.offsetTop - 150; // offset for header height
      const sectionId = current.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        link && link.classList.add('active');
      } else {
        link && link.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', activateNavLink);

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

  // Add fade-in class to sections & cards
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
      // update button active state
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

      // --- 1. Validation Loop ---
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

      // --- 2. If Validation Passes, Send Data to Both Endpoints ---
      if (isValid) {
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // --- Prepare data for both endpoints ---
        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData.entries());
        const json = JSON.stringify(object);

        // --- Define Endpoints ---
        const googleScriptURL = 'https://script.google.com/macros/s/AKfycby7dRAMt3MpYbBEVDSS7TQsnWfBPXP_RThYGnKlIPy4ts_VutaERx5qZAEUNvcNIbGN/exec';
        const web3FormsURL = 'https://api.web3forms.com/submit';

        // --- Create promises for both fetch requests ---
        const web3FormsPromise = fetch(web3FormsURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: json
        }).then(res => res.json());

        const googleScriptPromise = fetch(googleScriptURL, {
            method: 'POST',
            body: formData
        }).then(res => res.json());

        // --- Handle both promises concurrently ---
        Promise.all([web3FormsPromise, googleScriptPromise])
          .then(([web3FormsData, googleScriptData]) => {
            // Primary feedback is based on Web3Forms
            if (web3FormsData.success) {
                submitButton.textContent = 'Message Sent!';
            } else {
                console.error('Error from Web3Forms:', web3FormsData.message);
                submitButton.textContent = 'Submission Failed';
            }

            // Log the status of the Google Script submission for debugging
            if (googleScriptData.result === 'success') {
                 console.log('Successfully submitted to Google Script.');
            } else {
                 console.error('Error submitting to Google Script:', googleScriptData.details || 'Unknown Google Script error');
            }
          })
          .catch((error) => {
            console.error('Network or Fetch Error:', error);
            submitButton.textContent = 'Error!';
            alert('A network error occurred. Please try again.');
          })
          .finally(() => {
            setTimeout(() => {
                contactForm.reset();
                // Clear validation errors after reset
                ['name', 'email', 'subject', 'message'].forEach(field => {
                    const errorEl = document.getElementById(`${field}-error`);
                    if (errorEl) errorEl.textContent = '';
                });
                submitButton.textContent = 'Send Message';
                submitButton.disabled = false;
            }, 3000); // Wait 3 seconds before resetting the form and button
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

      // If deleting, remove a character. Otherwise, add one.
      if (isDeleting) {
        targetElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        targetElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      // Determine the speed of typing/deleting
      let typeSpeed = 150;
      if (isDeleting) {
        typeSpeed /= 2; // Faster when deleting
      }

      // If word is fully typed
      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000; // Pause at the end of the word
        isDeleting = true;
      }
      // If word is fully deleted
      else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length; // Move to the next word
        typeSpeed = 500; // Pause before typing new word
      }

      setTimeout(type, typeSpeed);
    }

    type(); // Start the effect
  }

  typewriterEffect(); // Initialize on load

  /* ------------------------------
     Code Snippet Modal
  ------------------------------ */
  const projectCodeSnippets = {
    solarTracker: {
      title: "Arduino Solar Tracker Logic",
      language: "cpp",
      code: `
// Simplified Arduino code for a dual-axis solar tracker
#include <Servo.h> 

Servo horizontalServo;
Servo verticalServo;

int ldrTopLeft = A0;
int ldrTopRight = A1;
int ldrBottomLeft = A2;
int ldrBottomRight = A3;

void setup() {
  horizontalServo.attach(9);
  verticalServo.attach(10);
}

void loop() {
  int topLeft = analogRead(ldrTopLeft);
  int topRight = analogRead(ldrTopRight);
  int bottomLeft = analogRead(ldrBottomLeft);
  int bottomRight = analogRead(ldrBottomRight);

  // Simple averaging for vertical and horizontal light differences
  int avgTop = (topLeft + topRight) / 2;
  int avgBottom = (bottomLeft + bottomRight) / 2;
  int avgLeft = (topLeft + bottomLeft) / 2;
  int avgRight = (topRight + bottomRight) / 2;

  if (avgTop < avgBottom) {
    verticalServo.write(verticalServo.read() + 1);
  }
  if (avgTop > avgBottom) {
    verticalServo.write(verticalServo.read() - 1);
  }
  
  if (avgLeft < avgRight) {
    horizontalServo.write(horizontalServo.read() + 1);
  }
  if (avgLeft > avgRight) {
    horizontalServo.write(horizontalServo.read() - 1);
  }

  delay(50); // Delay for servo movement
}`
    },
    inverter: {
      title: "Inverter Control Loop (Pseudocode)",
      language: "c",
      code: `
#define PI 3.14159
#define FREQUENCY 50 // 50 Hz
#define V_PEAK 325   // Peak voltage for 230V RMS

float sine_reference = 0;
float feedback_voltage = 0;
float error = 0;
float pwm_duty = 0;

void main() {
    init_adc();
    init_pwm();

    while(1) {
        // Generate sine wave reference
        float angle = 2 * PI * FREQUENCY * get_time_ms() / 1000.0;
        sine_reference = V_PEAK * sin(angle);

        // Read feedback voltage from the output
        feedback_voltage = read_adc_voltage();

        // PI controller (simplified)
        error = sine_reference - feedback_voltage;
        pwm_duty += 0.1 * error; // Proportional term

        // Set PWM duty cycle for H-Bridge
        set_pwm_duty(pwm_duty);
    }
}`
    },
    iotWeather: {
      title: "STM32 MQTT Data Transmission",
      language: "cpp",
      code: `
#include <MQTT.h>
#include <WiFi.h>
#include "BME280.h"

// WiFi and MQTT Broker credentials
const char* ssid = "YourSSID";
const char* password = "YourPassword";
const char* mqtt_server = "broker.hivemq.com";

WiFiClient espClient;
MQTTClient client;
BME280 bme; // I2C sensor

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.begin(mqtt_server, espClient);
  bme.begin();
}

void loop() {
  client.loop();
  
  if (!client.connected()) {
    reconnect();
  }

  // Read sensor data
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();

  // Publish data to MQTT topic
  char payload[50];
  sprintf(payload, "{\\"temp\\":%.2f, \\"hum\\":%.2f}", temperature, humidity);
  client.publish("home/weather/livingroom", payload);
  
  delay(60000); // Send data every minute
}`
    },
    plcMotor: {
      title: "PLC Ladder Logic (Description)",
      language: "text",
      code: `
-- NETWORK 1: Start/Stop Logic --
- A normally open (NO) contact for the "Start_PB" (Push Button) is in series with a normally closed (NC) contact for the "Stop_PB".
- This series logic controls a "Motor_Run" coil.
- A "Motor_Run" seal-in contact is placed in parallel with the "Start_PB" to keep the motor running after the button is released.

-- NETWORK 2: Overload Protection --
- An NC contact for "Motor_OL" (Overload) is placed in series with the "Motor_Run" coil in Network 1.
- If the overload trips, this contact opens, stopping the motor.

-- NETWORK 3: Run Light Indicator --
- An NO contact from the "Motor_Run" coil energizes a "Run_Light" output coil.
- The light is on whenever the motor is running.
`
    }
  };

  const modalOverlay = document.getElementById('code-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalCode = document.getElementById('modal-code');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const sourceCodeBtns = document.querySelectorAll('.source-code-btn');

  sourceCodeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.getAttribute('data-project');
      const projectData = projectCodeSnippets[projectId];

      if (projectData) {
        // Update modal content
        modalTitle.textContent = projectData.title;
        modalCode.textContent = projectData.code.trim();
        modalCode.className = `language-${projectData.language}`;

        // Highlight the new code
        Prism.highlightElement(modalCode);

        // Show the modal
        modalOverlay.classList.remove('hidden');
      }
    });
  });

  // Function to close the modal
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
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = +counter.getAttribute('data-target');
          const duration = 2000; // Animation duration in milliseconds
          const stepTime = Math.abs(Math.floor(duration / target));

          let current = 0;
          const timer = setInterval(() => {
            current += 1;
            counter.textContent = current + '+';
            if (current >= target) {
              // Ensure it ends on the exact target number
              counter.textContent = target + '+';
              clearInterval(timer);
            }
          }, stepTime);

          observer.unobserve(counter); // Stop observing after animation starts
        }
      });
    }, { threshold: 0.5 }); // Trigger when 50% of the element is visible

    counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  // Call the new function
  animatedCounter();

});
