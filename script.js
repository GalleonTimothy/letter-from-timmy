'use strict';

document.addEventListener ('DOMContentLoaded', function () {
  // Confetti Logic
  var random = Math.random,
    cos = Math.cos,
    sin = Math.sin,
    PI = Math.PI,
    PI2 = PI * 2,
    timer = undefined,
    frame = undefined,
    confetti = [];

  var particles = 10,
    spread = 40,
    sizeMin = 3,
    sizeMax = 12 - sizeMin,
    eccentricity = 10,
    deviation = 100,
    dxThetaMin = -0.1,
    dxThetaMax = -dxThetaMin - dxThetaMin,
    dyMin = 0.13,
    dyMax = 0.18,
    dThetaMin = 0.4,
    dThetaMax = 0.7 - dThetaMin;

  var colorThemes = [
    function () {
      return color (
        (200 * random ()) | 0,
        (200 * random ()) | 0,
        (200 * random ()) | 0
      );
    },
    function () {
      var black = (200 * random ()) | 0;
      return color (200, black, black);
    },
    function () {
      var black = (200 * random ()) | 0;
      return color (black, 200, black);
    },
    function () {
      var black = (200 * random ()) | 0;
      return color (black, black, 200);
    },
    function () {
      return color (200, 100, (200 * random ()) | 0);
    },
    function () {
      return color ((200 * random ()) | 0, 200, 200);
    },
    function () {
      var black = (256 * random ()) | 0;
      return color (black, black, black);
    },
    function () {
      return colorThemes[random () < 0.5 ? 1 : 2] ();
    },
    function () {
      return colorThemes[random () < 0.5 ? 3 : 5] ();
    },
    function () {
      return colorThemes[random () < 0.5 ? 2 : 4] ();
    },
  ];

  function color (r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function interpolation (a, b, t) {
    return (1 - cos (PI * t)) / 2 * (b - a) + a;
  }

  var radius = 1 / eccentricity, radius2 = radius + radius;

  function createPoisson () {
    var domain = [radius, 1 - radius], measure = 1 - radius2, spline = [0, 1];
    while (measure) {
      var dart = measure * random (), i, l, interval, a, b, c, d;

      for ((i = 0), (l = domain.length), (measure = 0); i < l; i += 2) {
        (a = domain[i]), (b = domain[i + 1]), (interval = b - a);
        if (dart < measure + interval) {
          spline.push ((dart += a - measure));
          break;
        }
        measure += interval;
      }
      (c = dart - radius), (d = dart + radius);

      for (i = domain.length - 1; i > 0; i -= 2) {
        (l = i - 1), (a = domain[l]), (b = domain[i]);
        if (a >= c && a < d)
          if (b > d) domain[l] = d;
          else domain.splice (l, 2);
        else if (a < c && b > c)
          if (b <= d) domain[i] = c;
          else domain.splice (i, 0, c, d);
      }

      for (
        (i = 0), (l = domain.length), (measure = 0);
        i < l;
        i += 2
      ) measure += domain[i + 1] - domain[i];
    }

    return spline.sort ();
  }

  var container = document.createElement ('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '0';
  container.style.overflow = 'visible';
  container.style.zIndex = '9999';

  function Confetto (theme) {
    this.frame = 0;
    this.outer = document.createElement ('div');
    this.inner = document.createElement ('div');
    this.outer.appendChild (this.inner);

    var outerStyle = this.outer.style, innerStyle = this.inner.style;
    outerStyle.position = 'absolute';
    outerStyle.width = sizeMin + sizeMax * random () + 'px';
    outerStyle.height = sizeMin + sizeMax * random () + 'px';
    innerStyle.width = '100%';
    innerStyle.height = '100%';
    innerStyle.backgroundColor = theme ();

    outerStyle.perspective = '50px';
    outerStyle.transform = 'rotate(' + 360 * random () + 'deg)';
    this.axis =
      'rotate3D(' + cos (360 * random ()) + ',' + cos (360 * random ()) + ',0,';
    this.theta = 360 * random ();
    this.dTheta = dThetaMin + dThetaMax * random ();
    innerStyle.transform = this.axis + this.theta + 'deg)';

    this.x = window.innerWidth * random ();
    this.y = -deviation;
    this.dx = sin (dxThetaMin + dxThetaMax * random ());
    this.dy = dyMin + dyMax * random ();
    outerStyle.left = this.x + 'px';
    outerStyle.top = this.y + 'px';

    this.splineX = createPoisson ();
    this.splineY = [];
    for (
      var i = 1, l = this.splineX.length - 1;
      i < l;
      ++i
    ) this.splineY[i] = deviation * random ();
    this.splineY[0] = this.splineY[l] = deviation * random ();

    this.update = function (height, delta) {
      this.frame += delta;
      this.x += this.dx * delta;
      this.y += this.dy * delta;
      this.theta += this.dTheta * delta;

      var phi = this.frame % 7777 / 7777, i = 0, j = 1;
      while (phi >= this.splineX[j])
        i = j++;
      var rho = interpolation (
        this.splineY[i],
        this.splineY[j],
        (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
      );
      phi *= PI2;

      outerStyle.left = this.x + rho * cos (phi) + 'px';
      outerStyle.top = this.y + rho * sin (phi) + 'px';
      innerStyle.transform = this.axis + this.theta + 'deg)';
      return this.y > height + deviation;
    };
  }

  function poof () {
    if (!frame) {
      document.body.appendChild (container);
      var theme = colorThemes[0], count = 0;
      (function addConfetto () {
        var confetto = new Confetto (theme);
        confetti.push (confetto);
        container.appendChild (confetto.outer);
        timer = setTimeout (addConfetto, spread * random ());
      }) (0);

      var prev = undefined;
      requestAnimationFrame (function loop (timestamp) {
        var delta = prev ? timestamp - prev : 0;
        prev = timestamp;
        var height = window.innerHeight;

        for (var i = confetti.length - 1; i >= 0; --i) {
          if (confetti[i].update (height, delta)) {
            container.removeChild (confetti[i].outer);
            confetti.splice (i, 1);
          }
        }

        if (timer || confetti.length)
          return (frame = requestAnimationFrame (loop));

        document.body.removeChild (container);
        frame = undefined;
      });
    }
  }

  poof ();

// Merrywrap Logic
var merrywrap = document.getElementById ('merrywrap');
var box = merrywrap.getElementsByClassName ('giftbox')[0];

// Create a new Audio object for the sound effect
var clickSound = new Audio ('assets/box-open.mp3'); // Replace with your sound file path

function init () {
  box.addEventListener (
    'click',
    function () {
      // Play the sound when the box is clicked
      clickSound.play ();

      // Add the wobble class to trigger the animation
      box.classList.add ('wobble');

      // Remove the wobble class after animation so you can click again
      setTimeout (function () {
        box.classList.remove ('wobble');
      }, 1000); // same as wobble animation time (0.5s)
    },
    false
  );
}

init ();


});

// Get the giftbox, cover, and letter-card elements
var giftbox = document.querySelector ('.giftbox');
var cover = giftbox.querySelector ('.cover');
var letterCard = document.querySelector ('.letter-card');

// Add event listener to giftbox
giftbox.addEventListener ('click', function () {
  // Add 'open' class to cover to trigger lid animation
  cover.classList.add ('open');

  // Wait for the lid animation to finish before showing the letter card
  setTimeout (function () {
    // Add 'show' class to letter-card to reveal it with animation
    letterCard.classList.add ('show');
  }, 1000); // Delay this action by 1 second (time for lid animation)
});



// open letter ---------------
const openCheckbox = document.getElementById ('open');
const letterText = document.querySelector ('.letter-text');
const music = document.getElementById ('card-music'); // Background music
const openCloseSound = document.getElementById ('open-close-sound'); // Open/close sound
const heartImg = document.getElementById ('heart-img'); // Image inside the label

// Handle open/close of the card
openCheckbox.addEventListener ('change', () => {
  if (openCheckbox.checked) {
    // Card is opened
    music.currentTime = 0;
    music.play ();

    openCloseSound.currentTime = 0;
    openCloseSound.play ();

    // Remove the scroll animation
    letterText.style.animation = ''; // No scroll animation applied

    // Change the image to heart-unlock.png when checkbox is checked
    heartImg.src = 'assets/heart-unlock.png';
  } else {
    // Card is closed
    music.pause ();
    music.currentTime = 0;

    openCloseSound.currentTime = 0;
    openCloseSound.play ();

    // Reset animation when the card is closed
    letterText.style.animation = 'none'; // Stop animation
    letterText.offsetHeight; // Force reflow
    letterText.style.animation = ''; // Clear animation

    // Revert the image to heart-lock.png when checkbox is unchecked
    heartImg.src = 'assets/heart-lock.png';

    // Reset scroll position to the top when the card is closed
    letterText.scrollTop = 0;
  }
});

// Reset button to close everything (your reset-all button)
document.getElementById ('reset-all').addEventListener ('click', e => {
  e.stopPropagation ();
  e.preventDefault ();
  openCheckbox.checked = false;
  music.pause ();
  music.currentTime = 0;
  letterText.style.animation = 'none'; // Clear animation
  letterText.scrollTop = 0; // Reset scroll position to the top
  setTimeout (() => {
    location.reload ();
  }, 300);
});


// end ----------------