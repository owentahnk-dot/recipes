(function () {
  "use strict";

  var RECIPES = window.RECIPES || [];
  var CATEGORIES = window.CATEGORIES || [];

  function byCategory(slug) {
    return RECIPES.filter(function (r) { return r.category === slug; })
      .sort(function (a, b) { return a.title.localeCompare(b.title); });
  }

  function catInfo(slug) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].slug === slug) return CATEGORIES[i];
    }
    return { slug: slug, name: slug };
  }

  function findRecipe(id) {
    for (var i = 0; i < RECIPES.length; i++) {
      if (RECIPES[i].id === id) return RECIPES[i];
    }
    return null;
  }

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : str;
    return d.innerHTML;
  }

  // ---------- Nav ----------

  function renderNav() {
    var nav = document.getElementById("siteNav");

    nav.querySelectorAll(".nav-tab").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        document.getElementById("navToggle").setAttribute("aria-expanded", "false");
      });
    });

    var toggle = document.getElementById("navToggle");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function updateActiveNav(routeName) {
    document.querySelectorAll(".nav-tab").forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-route") === routeName);
    });
  }

  // ---------- Views ----------

  function renderHome() {
    var about = window.ABOUT || { name: "Jeanne Tahnk", paragraphs: [] };
    var paragraphs = about.paragraphs || [];
    var lastIndex = paragraphs.length - 1;

    var html = '<div class="hero">';
    html += '<h1>Nai Nai’s Kitchen</h1>';
    html += '<p>A family recipe box, kept — one dish, one story at a time.</p>';
    html += '</div>';

    html += '<article class="about-article">';
    html += '<div class="article-kicker">The Story Behind the Recipes</div>';
    html += '<h2>About ' + esc(about.name) + '</h2>';
    html += '<div class="ornament-divider"><span class="ornament-mark"><span>奶</span></span></div>';

    html += '<figure class="article-lead-figure">';
    html += '<img src="images/jeanne/gallery-1.jpg" alt="' + esc(about.name) + ' surrounded by a table of her own cooking">';
    html += '<figcaption>Jeanne, surrounded by a table of her own cooking.</figcaption>';
    html += '</figure>';

    html += '<div class="article-body">';
    paragraphs.forEach(function (p, i) {
      if (i === 2) {
        html += '<figure class="article-inline-figure">';
        html += '<img src="images/jeanne/gallery-2.jpg" alt="' + esc(about.name) + ' filming her cooking show">';
        html += '<figcaption>On set, filming her cooking show.</figcaption>';
        html += '</figure>';
      }
      if (i === lastIndex) {
        html += '<blockquote class="article-pullquote">' + esc(p) + '</blockquote>';
      } else {
        html += '<p' + (i === 0 ? ' class="drop-cap"' : '') + '>' + esc(p) + '</p>';
      }
    });
    html += '</div>';

    html += '<div class="article-cta"><a class="cta-link" href="#/recipes">Browse all the recipes →</a></div>';
    html += '</article>';

    document.getElementById("main").innerHTML = html;
    window.scrollTo(0, 0);
  }

  function renderRecipesHub() {
    var html = '<div class="hero">';
    html += '<h1>Recipes</h1>';
    html += '<p>A collection of recipes, typed up and taught over the years — now kept safe, one dish at a time. Pick a category below to start cooking.</p>';
    html += '</div>';

    html += '<div class="search-box"><input type="search" id="searchInput" placeholder="Search recipes by name…" autocomplete="off"></div>';
    html += '<div id="searchResults"></div>';

    html += '<div class="cat-grid" id="catGrid">';
    CATEGORIES.forEach(function (cat) {
      var recipes = byCategory(cat.slug);
      if (!recipes.length) return;
      html += '<a class="cat-card" href="#/category/' + cat.slug + '">';
      html += '<h3>' + esc(cat.name) + '</h3>';
      html += '<p>' + recipes.length + (recipes.length === 1 ? ' recipe' : ' recipes') + '</p>';
      html += '</a>';
    });
    html += '</div>';

    document.getElementById("main").innerHTML = html;
    window.scrollTo(0, 0);

    var searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      var results = document.getElementById("searchResults");
      var catGrid = document.getElementById("catGrid");
      if (!q) {
        results.innerHTML = "";
        catGrid.style.display = "";
        return;
      }
      catGrid.style.display = "none";
      var matches = RECIPES.filter(function (r) {
        return r.title.toLowerCase().indexOf(q) !== -1 ||
          (r.chineseTitle && r.chineseTitle.indexOf(q) !== -1);
      }).sort(function (a, b) { return a.title.localeCompare(b.title); });

      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">No recipes found for “' + esc(searchInput.value) + '”.</div>';
        return;
      }
      var h = '<div class="recipe-grid">';
      matches.forEach(function (r) { h += recipeCardHtml(r); });
      h += '</div>';
      results.innerHTML = h;
      bindRecipeCards(results);
    });
  }

  function recipeCardHtml(r) {
    return '<a class="recipe-card" href="#/recipe/' + encodeURIComponent(r.id) + '">' +
      '<img src="' + esc(r.image) + '" alt="' + esc(r.title) + '" loading="lazy">' +
      '<div class="recipe-card-body"><h3>' + esc(r.title) + '</h3>' +
      (r.chineseTitle ? '<div class="chi">' + esc(r.chineseTitle) + '</div>' : '') +
      '</div></a>';
  }

  function bindRecipeCards(container) {
    // anchor tags handle navigation natively via hash; nothing extra needed.
  }

  function renderCategory(slug) {
    var cat = catInfo(slug);
    var recipes = byCategory(slug);
    var html = '<div class="cat-header">';
    html += '<div class="breadcrumb"><a href="#/recipes">Recipes</a> &rsaquo; ' + esc(cat.name) + '</div>';
    html += '<h1>' + esc(cat.name) + '</h1>';
    html += '</div>';

    if (!recipes.length) {
      html += '<div class="empty-state">No recipes in this category yet.</div>';
    } else {
      html += '<ul class="recipe-link-list">';
      recipes.forEach(function (r) {
        html += '<li><a href="#/recipe/' + encodeURIComponent(r.id) + '">' + esc(r.title) +
          (r.chineseTitle ? '<span class="chi">' + esc(r.chineseTitle) + '</span>' : '') + '</a></li>';
      });
      html += '</ul>';
    }
    document.getElementById("main").innerHTML = html;
    window.scrollTo(0, 0);
  }

  function sectionHtml(section) {
    var h = '<div class="section-block">';
    if (section.heading) h += '<h2>' + esc(section.heading) + '</h2>';
    if (section.type === "list") {
      h += '<ul class="ingredient-list">';
      (section.items || []).forEach(function (item) { h += '<li>' + esc(item) + '</li>'; });
      h += '</ul>';
    } else if (section.type === "steps") {
      h += '<ol class="steps-list">';
      (section.items || []).forEach(function (item) { h += '<li>' + esc(item) + '</li>'; });
      h += '</ol>';
    } else {
      h += '<div class="text-block">';
      (section.items || []).forEach(function (item) { h += '<p>' + esc(item) + '</p>'; });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  function renderRecipe(id) {
    var r = findRecipe(id);
    var main = document.getElementById("main");
    if (!r) {
      main.innerHTML = '<div class="empty-state">Recipe not found.<br><a class="back-link" href="#/recipes">Back to recipes</a></div>';
      return;
    }
    var cat = catInfo(r.category);
    var html = '<div class="recipe-detail">';
    html += '<div class="recipe-detail-header">';
    html += '<div class="breadcrumb"><a href="#/recipes">Recipes</a> &rsaquo; <a href="#/category/' + esc(r.category) + '">' + esc(cat.name) + '</a></div>';
    html += '<h1>' + esc(r.title) + '</h1>';
    if (r.chineseTitle) html += '<div class="chi">' + esc(r.chineseTitle) + '</div>';
    var provenance = [];
    if (r.occasion && r.occasion.event) {
      provenance.push('From Nai Nai’s "' + esc(r.occasion.event) + '"' + (r.occasion.date ? ' — ' + esc(r.occasion.date) : ''));
    }
    if (r.contributor) {
      provenance.push('Recipe by ' + esc(r.contributor));
    }
    if (provenance.length) {
      html += '<div class="provenance">' + provenance.join(' &middot; ') + '</div>';
    }
    html += '</div>';

    html += '<div class="recipe-body">';
    html += '<div class="recipe-scan"><img src="' + esc(r.image) + '" alt="Original recipe card for ' + esc(r.title) + '">';
    html += '<div class="scan-caption">Original recipe card</div></div>';
    html += '<div class="recipe-text">';
    (r.sections || []).forEach(function (s) { html += sectionHtml(s); });
    html += '</div></div>';

    html += '<div class="recipe-detail-footer"><a class="back-link" href="#/category/' + esc(r.category) + '">← Back to ' + esc(cat.name) + '</a></div>';
    html += '</div>';

    main.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function restaurantCardHtml(rest) {
    var h = '<div class="restaurant-card">';
    if (rest.image) {
      h += '<img src="' + esc(rest.image) + '" alt="' + esc(rest.name) + '" loading="lazy">';
    }
    h += '<div class="restaurant-card-body">';
    h += '<h3>' + esc(rest.name) + '</h3>';
    var meta = [rest.cuisine, rest.location].filter(Boolean).join(' · ');
    if (meta) h += '<div class="restaurant-meta">' + esc(meta) + '</div>';
    if (rest.note) h += '<p>' + esc(rest.note) + '</p>';
    if (rest.link) h += '<a class="cta-link small" href="' + esc(rest.link) + '" target="_blank" rel="noopener">Visit website →</a>';
    h += '</div></div>';
    return h;
  }

  function renderRestaurants() {
    var restaurants = window.RESTAURANTS || [];
    var html = '<div class="hero">';
    html += '<h1>Restaurants Jeanne Loves</h1>';
    html += '<p>A running list of places worth the trip.</p>';
    html += '</div>';

    if (!restaurants.length) {
      html += '<div class="empty-state">No restaurants added yet — ask to have one added here.</div>';
    } else {
      html += '<div class="restaurant-grid">';
      restaurants.forEach(function (rest) { html += restaurantCardHtml(rest); });
      html += '</div>';
    }
    document.getElementById("main").innerHTML = html;
    window.scrollTo(0, 0);
  }

  // ---------- Router ----------

  function route() {
    var hash = location.hash || "#/";
    var parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    document.getElementById("siteNav").classList.remove("open");
    document.getElementById("navToggle").setAttribute("aria-expanded", "false");

    if (parts.length === 0) {
      updateActiveNav("home");
      renderHome();
    } else if (parts[0] === "recipes") {
      updateActiveNav("recipes");
      renderRecipesHub();
    } else if (parts[0] === "restaurants") {
      updateActiveNav("restaurants");
      renderRestaurants();
    } else if (parts[0] === "category" && parts[1]) {
      updateActiveNav("recipes");
      renderCategory(decodeURIComponent(parts[1]));
    } else if (parts[0] === "recipe" && parts[1]) {
      updateActiveNav("recipes");
      renderRecipe(decodeURIComponent(parts[1]));
    } else {
      updateActiveNav("home");
      renderHome();
    }
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", function () {
    renderNav();
    route();
  });
})();
