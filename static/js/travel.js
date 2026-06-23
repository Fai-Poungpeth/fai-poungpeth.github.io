(function () {
  'use strict';

  if (!document.getElementById('travel-map')) return;

  // ── Map init ───────────────────────────────────────────────────
  var map = L.map('travel-map', {
    center: [30, 10],
    zoom: 2,
    zoomControl: true,
    scrollWheelZoom: false,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  requestAnimationFrame(function () { map.invalidateSize(); });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    noWrap: true
  }).addTo(map);

  // ── Custom pin icon (SVG teardrop) ────────────────────────────
  function makeIcon(color, w) {
    var h = Math.round(w * 36 / 26);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 26 36">' +
      '<path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23S26 22.75 26 13C26 5.82 20.18 0 13 0z" fill="' + color + '" stroke="white" stroke-width="1.5"/>' +
      '<circle cx="13" cy="13" r="5" fill="white"/>' +
      '</svg>';
    return L.divIcon({
      className: 'travel-marker',
      html: svg,
      iconSize: [w, h],
      iconAnchor: [w / 2, h],
      popupAnchor: [0, -(h + 2)]
    });
  }

  function makeHouseIcon(size) {
    return L.divIcon({
      className: 'travel-marker',
      html: '<i class="fas fa-house" style="font-size:' + size + 'px;color:#C05746;display:block;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));"></i>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -(size + 6)]
    });
  }

  var defaultIcon      = makeIcon('#C05746', 18);
  var activeIcon       = makeIcon('#C05746', 32);
  var defaultHouseIcon = makeHouseIcon(20);
  var activeHouseIcon  = makeHouseIcon(34);
  var activeMarker = null;

  // ── Places data ────────────────────────────────────────────────
  var places = [
    {
      name: 'New York City',
      lat: 40.7128,
      lng: -74.0060,
      description: 'December 2022',
      images: [
        '/images/travel/nyc-1.jpg',
        '/images/travel/nyc-2.jpg',
        '/images/travel/nyc-3.jpg',
        '/images/travel/nyc-4.jpg'
      ]
    },
    {
      name: 'Chiang Mai',
      lat: 18.7883,
      lng: 98.9853,
      description: 'Home!!',
      images: [
        '/images/travel/cnx-1.jpg',
        '/images/travel/cnx-2.jpg',
        '/images/travel/cnx-3.jpg',
        '/images/travel/cnx-4.jpg',
        '/images/travel/cnx-5.jpg',
        '/images/travel/cnx-6.jpg'
      ]
    },
    {
      name: 'Evanston (and a bit of Chicago)',
      lat: 42.0568,
      lng: -87.6872,
      description: 'September 2022 - June 2026',
      images: [
        '/images/travel/evanston-1.jpg',
        '/images/travel/evanston-2.jpg',
        '/images/travel/evanston-3.jpg',
        '/images/travel/evanston-4.jpg',
        '/images/travel/evanston-5.jpg',
        '/images/travel/evanston-6.jpg',
        '/images/travel/evanston-7.jpg',
      ]
    },
    {
      name: 'Florida',
      lat: 27.9944,
      lng: -81.7602,
      description: 'December 2023',
      images: [
        '/images/travel/florida-1.jpg',
        '/images/travel/florida-2.jpg',
        '/images/travel/florida-3.jpg',
        '/images/travel/florida-4.jpg',
        '/images/travel/florida-5.jpg',
        '/images/travel/florida-6.jpg',
      ]
    },
    {
      name: 'Taipei',
      lat: 25.0330,
      lng: 121.5654,
      description: 'June 2024',
      images: [
        '/images/travel/taipei-1.jpg',
        '/images/travel/taipei-2.jpg',
        '/images/travel/taipei-3.jpg',
        '/images/travel/taipei-4.jpg'
      ]
    },
    {
      name: 'Rocky Mountain National Park',
      lat: 40.3772,
      lng: -105.5217,
      description: 'March 2025',
      images: [
        '/images/travel/colorado-1.jpg',
        '/images/travel/colorado-2.jpg'
      ]
    },
    {
      name: 'Glacier National Park',
      lat: 48.68998,
      lng: -113.687819,
      description: 'May 2026',
      images: [
        '/images/travel/glacier-1.jpg',
        '/images/travel/glacier-2.jpg',
        '/images/travel/glacier-3.jpg',
        '/images/travel/glacier-4.jpg'
      ]
    },
    {
      name: 'Mammoth Cave National Park',
      lat: 37.1975805,
      lng: -86.1308948,
      description: 'November 2025',
      images: [
        '/images/travel/mammoth-1.jpg',
        '/images/travel/mammoth-2.jpg'
      ]
    },
    {
      name: 'Great Smoky Mountains',
      lat: 35.6532,
      lng: -83.5070,
      description: 'November 2025',
      images: [
        '/images/travel/smoky-1.jpg',
        '/images/travel/smoky-2.jpg'
      ]
    },
    {
      name: 'Seattle',
      lat: 47.6061,
      lng: -122.3328,
      description: 'June - August 2025',
      images: [
        '/images/travel/seattle-1.jpg',
        '/images/travel/seattle-2.jpg',
        '/images/travel/seattle-3.jpg'
      ]
    },
    {
      name: 'Singapore',
      lat: 1.3521,
      lng: 103.8198,
      description: 'October 2020 - May 2022',
      images: [
        '/images/travel/singapore-1.jpg',
        '/images/travel/singapore-2.jpg'
      ]
    },
    {
      name: 'Koh Samui',
      lat: 9.5120,
      lng: 100.0136,
      description: 'May 2022',
      images: [
        '/images/travel/samui-1.jpg',
        '/images/travel/samui-2.jpg',
        '/images/travel/samui-3.jpg'
      ]
    }
  ];

  // ── Plane (persistent, fixed to viewport so it's never clipped) ─
  var mapEl = document.getElementById('travel-map');
  var plane = document.createElement('div');
  plane.className = 'travel-plane';
  plane.innerHTML = '<i class="fas fa-plane"></i>';
  document.body.appendChild(plane);

  var cnxPlace = places.filter(function (p) { return p.name === 'Chiang Mai'; })[0];
  var planeLL  = cnxPlace ? { lat: cnxPlace.lat, lng: cnxPlace.lng } : { lat: map.getCenter().lat, lng: map.getCenter().lng };
  var isAnimating = false;

  // Position plane at Chiang Mai once map has rendered
  plane.style.left      = '-300px';
  plane.style.top       = '-300px';
  plane.style.transform = 'translate(-50%,-50%) rotate(0deg)';
  map.whenReady(function () {
    requestAnimationFrame(function () {
      var pos = screenPos(planeLL);
      plane.style.left = pos.x + 'px';
      plane.style.top  = pos.y + 'px';
    });
  });

  // Convert lat/lng to fixed viewport coordinates
  function screenPos(ll) {
    var rect = mapEl.getBoundingClientRect();
    var pt   = map.latLngToContainerPoint(L.latLng(ll.lat, ll.lng));
    return { x: rect.left + pt.x, y: rect.top + pt.y };
  }

  var ROT_MS = 300;
  var FLY_MS = 2000;

  function flyTo(toLL, onArrived) {
    isAnimating = true;

    var fromPt = screenPos(planeLL);
    var toPt   = screenPos(toLL);
    var angle  = Math.atan2(toPt.y - fromPt.y, toPt.x - fromPt.x) * 180 / Math.PI;

    // Snap plane to current position before rotating
    plane.style.transition = 'none';
    plane.style.left       = fromPt.x + 'px';
    plane.style.top        = fromPt.y + 'px';

    // Rotate toward destination
    requestAnimationFrame(function () {
      plane.style.transition = 'transform ' + (ROT_MS / 1000) + 's ease';
      plane.style.transform  = 'translate(-50%,-50%) rotate(' + angle + 'deg)';
    });

    // Fly after rotation completes
    setTimeout(function () {
      var snapLL = { lat: planeLL.lat, lng: planeLL.lng };
      var t0     = null;

      function frame(ts) {
        if (!t0) t0 = ts;
        var t = Math.min((ts - t0) / FLY_MS, 1);
        var e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        var lat = snapLL.lat + (toLL.lat - snapLL.lat) * e;
        var lng = snapLL.lng + (toLL.lng - snapLL.lng) * e;
        var pos = screenPos({ lat: lat, lng: lng });

        plane.style.transition = 'none';
        plane.style.left = pos.x + 'px';
        plane.style.top  = pos.y + 'px';

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          planeLL     = { lat: toLL.lat, lng: toLL.lng };
          isAnimating = false;
          onArrived();
        }
      }

      requestAnimationFrame(frame);
    }, ROT_MS + 50);
  }

  // ── Popup builder ──────────────────────────────────────────────
  function buildPopup(place) {
    var html = '<div class="travel-popup-inner">';
    html += '<p class="popup-place-name">' + place.name + '</p>';

    if (place.images && place.images.length > 0) {
      html += '<div class="gallery-wrap">';
      html += '<img class="gallery-img" src="' + place.images[0] + '" alt="' + place.name + '">';
      if (place.images.length > 1) {
        html += '<button class="gallery-btn gallery-prev">&#8249;</button>';
        html += '<button class="gallery-btn gallery-next">&#8250;</button>';
        html += '<span class="gallery-counter">1 / ' + place.images.length + '</span>';
      }
      html += '</div>';
    } else {
      html += '<div class="gallery-placeholder"><span class="gallery-ph-icon">&#128247;</span><span>Photos coming soon</span></div>';
    }

    html += '<p class="popup-place-desc">' + place.description + '</p>';
    html += '</div>';
    return html;
  }

  // ── Wire gallery buttons after popup DOM is ready ──────────────
  function setupGallery(popup, place) {
    var el = popup.getElement();
    if (!el) return;
    var images = place.images;
    if (!images || images.length < 2) return;

    var idx     = 0;
    var img     = el.querySelector('.gallery-img');
    var counter = el.querySelector('.gallery-counter');
    var prev    = el.querySelector('.gallery-prev');
    var next    = el.querySelector('.gallery-next');

    if (prev) prev.addEventListener('click', function (e) {
      e.stopPropagation();
      idx = (idx - 1 + images.length) % images.length;
      img.src = images[idx];
      if (counter) counter.textContent = (idx + 1) + ' / ' + images.length;
    });
    if (next) next.addEventListener('click', function (e) {
      e.stopPropagation();
      idx = (idx + 1) % images.length;
      img.src = images[idx];
      if (counter) counter.textContent = (idx + 1) + ' / ' + images.length;
    });
  }

  // ── Open a popup and wire its gallery ─────────────────────────
  function openPlacePopup(place) {
    var popup = L.popup({ maxWidth: 300, className: 'travel-popup', autoPan: true })
      .setContent(buildPopup(place))
      .setLatLng([place.lat, place.lng])
      .openOn(map);
    setTimeout(function () { setupGallery(popup, place); }, 30);
    return popup;
  }

  // ── Add markers — click triggers fly-then-popup ────────────────
  var markerRefs = {};
  places.forEach(function (place) {
    var isHome     = place.name === 'Chiang Mai';
    var iconDef    = isHome ? defaultHouseIcon : defaultIcon;
    var iconActive = isHome ? activeHouseIcon  : activeIcon;

    var marker = L.marker([place.lat, place.lng], { icon: iconDef }).addTo(map);
    marker._iconDef    = iconDef;
    marker._iconActive = iconActive;
    markerRefs[place.name] = marker;

    marker.on('click', function () {
      if (isAnimating) return;
      map.closePopup();
      flyTo({ lat: place.lat, lng: place.lng }, function () {
        if (activeMarker) activeMarker.setIcon(activeMarker._iconDef);
        marker.setIcon(marker._iconActive);
        activeMarker = marker;
        openPlacePopup(place);
      });
    });
  });

  map.on('popupclose', function () {
    if (activeMarker) { activeMarker.setIcon(activeMarker._iconDef); activeMarker = null; }
  });

  // ── Travel button — auto-tour through random pins ──────────────
  var travelBtn = document.getElementById('travel-btn');
  if (travelBtn) travelBtn.addEventListener('click', startTravel);

  function startTravel() {
    if (isAnimating) return;
    var btn = document.getElementById('travel-btn');
    if (btn) btn.disabled = true;

    map.closePopup();
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();

    var pool    = places.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 4);
    var step    = 0;
    var SHOW_MS = 2500;

    function runStep() {
      if (step >= pool.length) {
        setTimeout(function () {
          map.dragging.enable();
          map.touchZoom.enable();
          map.doubleClickZoom.enable();
          if (btn) btn.disabled = false;
        }, 500);
        return;
      }

      var place  = pool[step++];
      var marker = markerRefs[place.name];
      flyTo({ lat: place.lat, lng: place.lng }, function () {
        if (activeMarker) activeMarker.setIcon(activeMarker._iconDef);
        if (marker) { marker.setIcon(marker._iconActive); activeMarker = marker; }
        openPlacePopup(place);
        setTimeout(function () {
          map.closePopup();
          if (activeMarker) { activeMarker.setIcon(activeMarker._iconDef); activeMarker = null; }
          setTimeout(runStep, 400);
        }, SHOW_MS);
      });
    }

    setTimeout(runStep, 150);
  }

}());
