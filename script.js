document.addEventListener('DOMContentLoaded', function() {
  const modeToggle = document.getElementById('modeToggle');
  const body = document.body;
  const footer = document.querySelector('footer');
  const header = document.querySelector('header');
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  
  function setMode(mode) {
    if (mode === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
      header.classList.add('dark-mode');
      header.classList.remove('light-mode');
      footer.classList.add('dark-mode');
      footer.classList.remove('light-mode');
      modeToggle.classList.remove('fa-sun');
      modeToggle.classList.add('fa-moon');
    } else {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
      header.classList.remove('dark-mode');
      header.classList.add('light-mode');
      footer.classList.remove('dark-mode');
      footer.classList.add('light-mode');
      modeToggle.classList.remove('fa-moon');
      modeToggle.classList.add('fa-sun');
    }
  }

  modeToggle.addEventListener('click', function() {
    if (body.classList.contains('dark-mode')) {
      setMode('light');
    } else {
      setMode('dark');
    }
  });

  fullscreenToggle.addEventListener('click', function() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        header.style.display = 'none';
        footer.style.display = 'none';
        fullscreenToggle.textContent = 'Exit Full Screen';
      });
    } else {
      document.exitFullscreen().then(() => {
        header.style.display = 'flex';
        footer.style.display = 'block';
        fullscreenToggle.textContent = 'Full Screen';
      });
    }
  });

  // Set the initial mode
  setMode('light');

  // Update the year in the footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Function to update time, date, and day
  function updateTime() {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = days[now.getDay()];
    const date = now.toLocaleDateString('en-GB'); // Format date as DD/MM/YYYY
    const time = now.toLocaleTimeString();
    document.getElementById('day').textContent = day;
    document.getElementById('date').textContent = date;
    document.getElementById('time').textContent = time;
  }

  // Update time every second
  setInterval(updateTime, 1000);
  updateTime(); // Initial call to display time immediately

  // Prevent screen from going to sleep
  if ('wakeLock' in navigator) {
    let wakeLock = null;
    async function requestWakeLock() {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          console.log('Wake lock was released');
          requestWakeLock();
        });
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    }

    requestWakeLock();
  }
});
