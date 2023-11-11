function includeHTML(file) {
    return new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            const el = document.createElement('div');
            el.innerHTML = this.responseText;
            document.body.appendChild(el);
            resolve();
          } else {
            reject(new Error('Page not found.'));
          }
        }
      };
      xhttp.open('GET', file, true);
      xhttp.send();
    });
  }
  
  async function loadHTML() {
    try {
      await includeHTML('/inc/header.html');
      const toggle = document.querySelector('.mobile-nav-toggle');
      const navbar = document.querySelector('#navbar');
      await includeHTML('/inc/footer.html')
      toggle.addEventListener('click', function(e) {
        navbar.classList.toggle('navbar-mobile');
        this.classList.toggle('bi-list')
        this.classList.toggle('bi-x')
      });
    } catch (error) {
      console.error(error);
    }
  }