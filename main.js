    // About Section Slideshow
    document.addEventListener('DOMContentLoaded', () => {
      const bio = document.getElementById('about-bio');
      const slides = Array.from(document.querySelectorAll('#about-slideshow .about-slide'));
      let slideIdx = 0;
      function showSlide(idx) {
        slides.forEach((el, i) => el.classList.toggle('active', i === idx));
      }
      function nextSlide() {
        slideIdx = (slideIdx + 1) % slides.length;
        showSlide(slideIdx);
      }
      setTimeout(() => {
        bio.classList.add('slideshow-active');
        showSlide(slideIdx);
        setInterval(nextSlide, 3200);
      }, 8000);
    });

    // About image hover swap
    document.addEventListener('DOMContentLoaded', () => {
      const aboutImg = document.getElementById('about-img');
      if (aboutImg) {
        const orig = aboutImg.getAttribute('src');
        const alt = aboutImg.getAttribute('data-alt-src');
        aboutImg.addEventListener('mouseenter', () => { aboutImg.src = alt; });
        aboutImg.addEventListener('mouseleave', () => { aboutImg.src = orig; });
        aboutImg.addEventListener('focus', () => { aboutImg.src = alt; });
        aboutImg.addEventListener('blur', () => { aboutImg.src = orig; });
      }
    });

    // Divine Idle Universe Animation (kept as is for brevity)
    // ...existing animation code...

    // Divine Idle Universe Animation (Smooth Phase Transitions)
    const canvas = document.getElementById('universe-bg');
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth, height = window.innerHeight, dpr = window.devicePixelRatio || 1;
    
    function resizeCanvas() {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let idleTimer, idleStart, idleActive = false, animationFrame;
    let currentPhase = 0, phaseProgress = 0;
    let stars = [], blooms = [], nebulae = [], shootingStars = [], auroras = [], sacred = null, dust = [];
    let phaseElements = new Map(); // Track when elements were added for smooth transitions

    function resetIdle() {
      if (idleActive) endDivineIdle();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(startDivineIdle, 10000);
    }
    ['mousemove','keydown','touchstart','scroll'].forEach(ev =>
      window.addEventListener(ev, resetIdle, {passive:true})
    );
    resetIdle();

    function startDivineIdle() {
      idleActive = true;
      idleStart = performance.now();
      document.body.classList.add('divine-idle');
      canvas.classList.add('active');
      currentPhase = 0;
      phaseProgress = 0;
      stars = []; blooms = []; nebulae = []; shootingStars = []; auroras = []; dust = [];
      sacred = null;
      phaseElements.clear();
      animateDivine();
    }
    
    function endDivineIdle() {
      idleActive = false;
      document.body.classList.remove('divine-idle');
      canvas.classList.remove('active');
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0,0,width,height);
    }

    function smoothStep(t) {
      return t * t * (3 - 2 * t);
    }

    function getPhaseAlpha(elementPhase, currentPhase, phaseProgress) {
      // Elements introduced in previous phases should be fully visible
      if (elementPhase < currentPhase) return 1;
      
      // Elements introduced in current phase fade in smoothly
      if (elementPhase === currentPhase) return smoothStep(phaseProgress);
      
      // Elements introduced in future phases are not visible yet
      if (elementPhase > currentPhase) return 0;
      
      return 1;
    }

    function animateDivine() {
      if (!idleActive) return;
      let t = performance.now();
      let elapsed = Math.min(60, (t - idleStart)/1000);
      
      // Smooth phase progression
      let totalPhase = elapsed / 8; // Slower, smoother transitions
      currentPhase = Math.floor(totalPhase);
      phaseProgress = totalPhase - currentPhase;
      
      // Smoothly introduce elements based on phase progress
      introduceElements(currentPhase, phaseProgress, t);

      // Smooth background transition
      let bgIntensity = Math.min(1, elapsed / 30);
      let grad = ctx.createLinearGradient(0, 0, 0, height);
      
      // Simpler background that gets darker over time
      let darkness = Math.min(0.8, currentPhase * 0.15);
      let topColor = `rgb(${Math.floor(16 + darkness * 18)}, ${Math.floor(16 + darkness * 18)}, ${Math.floor(16 + darkness * 18)})`;
      let bottomColor = `rgb(${Math.floor(darkness * 10)}, ${Math.floor(darkness * 10)}, ${Math.floor(darkness * 10)})`;
      
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, bottomColor);
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,width,height);

      // Render all elements with smooth transitions
      nebulae.forEach(n => {
        n.update(t, elapsed);
        let alpha = getPhaseAlpha(n.introPhase, currentPhase, phaseProgress);
        n.draw(ctx, alpha);
      });
      
      blooms.forEach(b => {
        let alpha = getPhaseAlpha(b.introPhase, currentPhase, phaseProgress);
        b.draw(ctx, t, elapsed, alpha);
      });
      
      stars.forEach(s => {
        s.update(t, elapsed);
        let alpha = getPhaseAlpha(s.introPhase, currentPhase, phaseProgress);
        s.draw(ctx, alpha);
      });
      
      shootingStars.forEach(s => {
        s.update(t, elapsed);
        let alpha = getPhaseAlpha(s.introPhase || 3, currentPhase, phaseProgress);
        s.draw(ctx, alpha);
      });
      shootingStars = shootingStars.filter(s => s.alive);
      
      auroras.forEach(a => {
        let alpha = getPhaseAlpha(a.introPhase, currentPhase, phaseProgress);
        a.draw(ctx, t, elapsed, alpha);
      });
      
      dust.forEach(d => {
        d.update();
        let alpha = getPhaseAlpha(d.introPhase, currentPhase, phaseProgress);
        d.draw(ctx, alpha);
      });
      
      if (sacred) {
        let alpha = getPhaseAlpha(sacred.introPhase, currentPhase, phaseProgress);
        sacred.draw(ctx, t, elapsed, alpha);
      }

      animationFrame = requestAnimationFrame(animateDivine);
    }

    function interpolateColors(colors, weights) {
      let totalWeight = weights.reduce((sum, w) => sum + w, 0);
      if (totalWeight === 0) return colors[0];
      
      let r = 0, g = 0, b = 0;
      colors.forEach((color, i) => {
        let weight = weights[i] / totalWeight;
        let rgb = hexToRgb(color);
        r += rgb.r * weight;
        g += rgb.g * weight;
        b += rgb.b * weight;
      });
      
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    function hexToRgb(hex) {
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
      return {r, g, b};
    }

    function introduceElements(phase, progress, t) {
      // Phase 0: First gentle stars
      if (phase >= 0 && !phaseElements.has('stars1')) {
        for (let i = 0; i < 12; i++) {
          let star = new Star({fadeIn: 2000 + Math.random() * 3000, introPhase: 0});
          stars.push(star);
        }
        phaseElements.set('stars1', true);
      }
      
      // Phase 1: Twinkling stars and first nebula
      if (phase >= 1 && !phaseElements.has('stars2')) {
        for (let i = 0; i < 25; i++) {
          let star = new Star({
            twinkle: true, 
            fadeIn: 1500 + Math.random() * 2500,
            introPhase: 1
          });
          stars.push(star);
        }
        
        let nebula = new Nebula({
          x: width * 0.3, 
          y: height * 0.4, 
          r: width * 0.22, 
          color: "rgba(255,255,255,0.13)",
          introPhase: 1
        });
        nebulae.push(nebula);
        phaseElements.set('stars2', true);
      }
      
      // Phase 2: Bloom and orbital stars
      if (phase >= 2 && !phaseElements.has('bloom1')) {
        let bloom = new Bloom({
          x: width * 1.08, 
          y: height * 0.5, 
          r: Math.max(width, height) * 0.45,
          introPhase: 2
        });
        blooms.push(bloom);
        
        for (let i = 0; i < 6; i++) {
          let star = new Star({
            big: true, 
            pulse: true, 
            fadeIn: 4000 + Math.random() * 3000,
            introPhase: 2
          });
          stars.push(star);
        }
        
        let nebula2 = new Nebula({
          x: width * 0.7, 
          y: height * 0.7, 
          r: width * 0.18, 
          color: "rgba(255,255,255,0.11)",
          introPhase: 2
        });
        nebulae.push(nebula2);
        
        // Set orbital motion for some stars
        let center = {x: width * 1.08, y: height * 0.5};
        stars.slice(0, Math.floor(stars.length * 0.25)).forEach(s => {
          s.setOrbit(center, Math.random() * width * 0.45 + width * 0.1);
        });
        
        phaseElements.set('bloom1', true);
      }
      
      // Phase 3: Shooting stars and more nebulae
      if (phase >= 3 && !phaseElements.has('shooting1')) {
        scheduleShootingStar();
        
        let nebula3 = new Nebula({
          x: width * 0.5, 
          y: height * 0.6, 
          r: width * 0.13, 
          color: "rgba(255,255,255,0.09)",
          introPhase: 3
        });
        nebulae.push(nebula3);
        
        for (let i = 0; i < 60; i++) {
          let dustParticle = new Dust();
          dustParticle.introPhase = 3;
          dust.push(dustParticle);
        }
        phaseElements.set('shooting1', true);
      }
      
      // Phase 4: More dust and aurora
      if (phase >= 4 && !phaseElements.has('aurora1')) {
        for (let i = 0; i < 80; i++) {
          let dustParticle = new Dust();
          dustParticle.introPhase = 4;
          dust.push(dustParticle);
        }
        
        let aurora = new Aurora();
        aurora.introPhase = 4;
        auroras.push(aurora);
        phaseElements.set('aurora1', true);
      }
      
      // Phase 5: Sacred geometry and divine aurora
      if (phase >= 5 && !phaseElements.has('sacred1')) {
        sacred = new Sacred();
        sacred.introPhase = 5;
        
        let divineAurora = new Aurora(true);
        divineAurora.introPhase = 5;
        auroras.push(divineAurora);
        
        let nebula4 = new Nebula({
          x: width * 0.2, 
          y: height * 0.8, 
          r: width * 0.18, 
          color: "rgba(255,255,255,0.09)",
          introPhase: 5
        });
        nebulae.push(nebula4);
        phaseElements.set('sacred1', true);
      }
    }

    function Star(opts = {}) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.r = opts.big ? Math.random() * 2.2 + 1.2 : Math.random() * 0.7 + 0.5;
      this.baseR = this.r;
      this.alpha = 0;
      this.maxAlpha = opts.big ? 0.85 : Math.random() * 0.4 + 0.3;
      this.twinkle = opts.twinkle || false;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.8 + 0.2;
      this.pulse = opts.pulse || false;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.5 + 0.2;
      this.fadeIn = opts.fadeIn || 1000;
      this.created = performance.now();
      this.orbital = false;
      this.orbitCenter = null;
      this.orbitRadius = 0;
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitSpeed = (Math.random() * 0.0007 + 0.0003) * (Math.random() < 0.5 ? 1 : -1);
      this.introPhase = opts.introPhase || 0;
    }
    
    Star.prototype.setOrbit = function(center, radius) {
      this.orbital = true;
      this.orbitCenter = center;
      this.orbitRadius = radius;
    };
    
    Star.prototype.update = function(t, elapsed) {
      let since = t - this.created;
      this.alpha = Math.min(this.maxAlpha, this.maxAlpha * (since / this.fadeIn));
      
      if (this.twinkle) {
        this.alpha = this.maxAlpha * (0.7 + 0.3 * Math.sin(this.twinklePhase + t * this.twinkleSpeed * 0.001));
      }
      
      if (this.pulse) {
        this.r = this.baseR * (0.8 + 0.25 * Math.sin(this.pulsePhase + t * this.pulseSpeed * 0.001));
      }
      
      if (this.orbital && this.orbitCenter) {
        this.orbitAngle += this.orbitSpeed;
        this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;
      }
    };
    
    Star.prototype.draw = function(ctx, phaseAlpha = 1) {
      ctx.save();
      // Use the minimum of star's own alpha and phase alpha, but ensure visibility once faded in
      let finalAlpha = Math.min(this.alpha, 1) * phaseAlpha;
      ctx.globalAlpha = finalAlpha;
      
      let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2.5);
      grad.addColorStop(0, "#fff");
      grad.addColorStop(0.6, "#fff");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = this.r * 6;
      ctx.fill();
      ctx.restore();
    };

    function Bloom(opts) {
      this.x = opts.x;
      this.y = opts.y;
      this.r = opts.r;
      this.introPhase = opts.introPhase || 0;
    }
    
    Bloom.prototype.draw = function(ctx, t, elapsed, phaseAlpha = 1) {
      let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(0.15, "rgba(255,255,255,0.25)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.globalAlpha = (0.7 + 0.2 * Math.sin(t * 0.0005)) * phaseAlpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.filter = 'blur(18px)';
      ctx.fill();
      ctx.filter = 'none';
      ctx.restore();
    };

    function Nebula(opts) {
      this.x = opts.x;
      this.y = opts.y;
      this.r = opts.r;
      this.color = opts.color;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = 0.00013 + Math.random() * 0.00007;
      this.introPhase = opts.introPhase || 0;
    }
    
    Nebula.prototype.update = function(t) {
      this.phase += this.speed;
    };
    
    Nebula.prototype.draw = function(ctx, phaseAlpha = 1) {
      ctx.save();
      ctx.globalAlpha = (0.22 + 0.13 * Math.sin(this.phase)) * phaseAlpha;
      let grad = ctx.createRadialGradient(this.x, this.y, this.r * 0.2, this.x, this.y, this.r);
      grad.addColorStop(0, this.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.filter = 'blur(12px)';
      ctx.fill();
      ctx.filter = 'none';
      ctx.restore();
    };

    function ShootingStar() {
      let edge = Math.random() < 0.5 ? 'left' : 'top';
      let colorChoices = ['#fff', '#eee', '#ccc', '#b6b6b6', '#fff'];
      this.color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      
      if (edge === 'left') {
        this.x = -80;
        this.y = Math.random() * height * 0.8 + height * 0.1;
        this.vx = Math.random() * 8 + 7;
        this.vy = Math.random() * 2 - 1;
      } else {
        this.x = Math.random() * width * 0.8 + width * 0.1;
        this.y = -80;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 8 + 7;
      }
      
      this.len = Math.random() * width * 0.25 + width * 0.25;
      this.alpha = 0;
      this.maxAlpha = 0.7 + Math.random() * 0.2;
      this.birth = performance.now();
      this.life = 1700 + Math.random() * 1100;
      this.trail = [];
      this.alive = true;
    }
    
    ShootingStar.prototype.update = function(t) {
      let dt = t - this.birth;
      if (dt < 200) this.alpha = this.maxAlpha * (dt / 200);
      else if (dt > this.life - 250) this.alpha = this.maxAlpha * (1 - (dt - (this.life - 250)) / 250);
      else this.alpha = this.maxAlpha;
      
      this.trail.push({x: this.x, y: this.y});
      if (this.trail.length > 30) this.trail.shift();
      this.x += this.vx;
      this.y += this.vy;
      if (dt > this.life) this.alive = false;
    };
    
    ShootingStar.prototype.draw = function(ctx, phaseAlpha = 1) {
      ctx.save();
      ctx.globalAlpha = this.alpha * phaseAlpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < this.trail.length; i++) {
        let p = this.trail[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
    };

    function scheduleShootingStar() {
      if (!idleActive) return;
      shootingStars.push(new ShootingStar());
      let interval = currentPhase >= 5 ? 2500 + Math.random() * 2000 : 6500 + Math.random() * 2000;
      setTimeout(scheduleShootingStar, interval);
    }

    function Aurora(divine) {
      this.divine = divine;
      this.introPhase = 0;
    }
    
    Aurora.prototype.draw = function(ctx, t, elapsed, phaseAlpha = 1) {
      let grad = ctx.createLinearGradient(0, height * 0.1, width, height * 0.9);
      grad.addColorStop(0, this.divine ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)');
      grad.addColorStop(0.5 + 0.2 * Math.sin(t * 0.0005), this.divine ? 'rgba(200,200,200,0.23)' : 'rgba(200,200,200,0.13)');
      grad.addColorStop(1, this.divine ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)');
      ctx.save();
      let baseAlpha = this.divine ? 0.33 + 0.13 * Math.sin(t * 0.0007) : 0.22 + 0.13 * Math.sin(t * 0.0007);
      ctx.globalAlpha = baseAlpha * phaseAlpha;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    };

    function Dust() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.r = Math.random() * 1.2 + 0.2;
      this.alpha = Math.random() * 0.15 + 0.05;
      this.vx = (Math.random() - 0.5) * 0.1;
      this.vy = (Math.random() - 0.5) * 0.1;
      this.introPhase = 0;
    }
    
    Dust.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x += width;
      if (this.x > width) this.x -= width;
      if (this.y < 0) this.y += height;
      if (this.y > height) this.y -= height;
    };
    
    Dust.prototype.draw = function(ctx, phaseAlpha = 1) {
      ctx.save();
      ctx.globalAlpha = this.alpha * phaseAlpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    };

    function Sacred() {
      this.introPhase = 0;
    }
    
    Sacred.prototype.draw = function(ctx, t, elapsed, phaseAlpha = 1) {
      let cx = width / 2, cy = height / 2, R = Math.min(width, height) * 0.22;
      let petals = 6, circles = 2;
      ctx.save();
      let baseAlpha = 0.045 + 0.03 * Math.sin(t * 0.0002);
      ctx.globalAlpha = baseAlpha * phaseAlpha;
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth = 0.7;
      ctx.setLineDash([2, 8]);
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.00009);
      for (let i = 0; i < petals; i++) {
        let angle = i * Math.PI * 2 / petals;
        for (let j = 1; j <= circles; j++) {
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * R * j / 2, Math.sin(angle) * R * j / 2, R, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      ctx.restore();
    };

     // About image hover swap
    document.addEventListener('DOMContentLoaded', function() {
      const aboutImg = document.getElementById('about-img');
      if (aboutImg) {
        const orig = aboutImg.getAttribute('src');
        const alt = aboutImg.getAttribute('data-alt-src');
        aboutImg.addEventListener('mouseenter', () => { aboutImg.src = alt; });
        aboutImg.addEventListener('mouseleave', () => { aboutImg.src = orig; });
        aboutImg.addEventListener('focus', () => { aboutImg.src = alt; });
        aboutImg.addEventListener('blur', () => { aboutImg.src = orig; });
      }
    }); 