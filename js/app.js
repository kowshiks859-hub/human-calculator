document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Scroll Effects ---
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  // Sticky header class switch
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile navigation toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Highlight active page link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-links a');
  navItems.forEach(item => {
    const itemPath = item.getAttribute('href');
    if (itemPath === currentPath) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // --- Calculator Functionality ---
  const sleepSlider = document.getElementById('sleep-slider');
  const waterSlider = document.getElementById('water-slider');
  const exerciseSlider = document.getElementById('exercise-slider');

  const sleepVal = document.getElementById('sleep-val');
  const waterVal = document.getElementById('water-val');
  const exerciseVal = document.getElementById('exercise-val');

  const moodButtons = document.querySelectorAll('.emoji-btn');
  const calcBtn = document.getElementById('calc-btn');

  const batteryFill = document.querySelector('.battery-fill');
  const batteryPctText = document.querySelector('.battery-percentage-text');
  const resultMsg = document.querySelector('.result-message');

  let selectedMoodValue = 75; // Default: Happy/Neutral 🙂

  // Update slider displays
  if (sleepSlider && sleepVal) {
    sleepSlider.addEventListener('input', (e) => {
      sleepVal.textContent = `${e.target.value}h`;
    });
  }

  if (waterSlider && waterVal) {
    waterSlider.addEventListener('input', (e) => {
      waterVal.textContent = `${e.target.value}L`;
    });
  }

  if (exerciseSlider && exerciseVal) {
    exerciseSlider.addEventListener('input', (e) => {
      exerciseVal.textContent = `${e.target.value}m`;
    });
  }

  // Mood selector handlers
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      moodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMoodValue = parseInt(btn.getAttribute('data-value'), 10);
    });
  });

  // Compute and Animate battery
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      // Calculate scores (normalized to 100 scale)
      const sleepHours = parseFloat(sleepSlider.value);
      const waterLiters = parseFloat(waterSlider.value);
      const exerciseMins = parseFloat(exerciseSlider.value);

      // Sleep calculation (best: 8h = 100%)
      let sleepScore = (sleepHours / 8) * 100;
      if (sleepHours > 8) {
        // Sleep over 9h starts bringing down efficiency slightly, but let's cap at 100 for simplicity
        sleepScore = 100 - (sleepHours - 8) * 10; 
      }
      sleepScore = Math.max(0, Math.min(100, sleepScore));

      // Water calculation (best: 3L = 100%)
      const waterScore = Math.min(100, (waterLiters / 3) * 100);

      // Exercise calculation (best: 45m = 100%)
      const exerciseScore = Math.min(100, (exerciseMins / 45) * 100);

      // Mood score from active selection
      const moodScore = selectedMoodValue;

      // Weighted percentage: Sleep (40%), Water (20%), Mood (20%), Exercise (20%)
      const batteryPercent = Math.round(
        (sleepScore * 0.40) + 
        (waterScore * 0.20) + 
        (moodScore * 0.20) + 
        (exerciseScore * 0.20)
      );

      // Animate filling the battery
      animateBattery(batteryPercent);
    });
  }

  function animateBattery(targetPercent) {
    if (!batteryFill || !batteryPctText || !resultMsg) return;

    // Reset view initially
    batteryFill.style.height = '0%';
    batteryPctText.textContent = '0%';
    
    // Disable button during animation to prevent overlaps
    if (calcBtn) calcBtn.disabled = true;

    setTimeout(() => {
      // Fill animation using CSS transitions
      batteryFill.style.height = `${targetPercent}%`;

      // Set colors based on percentage
      if (targetPercent < 35) {
        batteryFill.style.backgroundColor = 'var(--accent-coral)'; // Red alert
      } else if (targetPercent <= 75) {
        batteryFill.style.backgroundColor = 'var(--accent-yellow)'; // Warning yellow
      } else {
        batteryFill.style.backgroundColor = 'var(--accent-green)'; // Cool green
      }

      // Count up text
      let currentVal = 0;
      const duration = 1000; // 1s matches height transition
      const intervalTime = Math.max(10, Math.floor(duration / targetPercent));
      
      const counter = setInterval(() => {
        if (currentVal >= targetPercent) {
          batteryPctText.textContent = `${targetPercent}%`;
          clearInterval(counter);
          if (calcBtn) calcBtn.disabled = false;
        } else {
          currentVal++;
          batteryPctText.textContent = `${currentVal}%`;
        }
      }, intervalTime);

      // Update feedback advice message
      let msg = "";
      if (targetPercent < 35) {
        msg = "Running on low power. Recharge recommended! 🔋";
      } else if (targetPercent <= 60) {
        msg = "Coffee mode activated. Take a deep breath. ☕";
      } else if (targetPercent <= 80) {
        msg = "Charging nicely. You're doing great! 🚶‍♂️";
      } else if (targetPercent <= 95) {
        msg = "High power levels detected. Enjoy your day! ⚡";
      } else {
        msg = "Fully charged & ready to fly! Antigravity active. 🛸";
      }

      resultMsg.style.opacity = 0;
      setTimeout(() => {
        resultMsg.textContent = msg;
        resultMsg.style.opacity = 1;
        resultMsg.style.transition = 'opacity 0.3s ease';
      }, 300);

    }, 100);
  }
});
