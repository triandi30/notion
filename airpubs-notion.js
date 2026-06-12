/**
 * AiRPubs OJS Enhancement Script v2
 * Universal - works on any OJS 3.2.x journal
 */
(function() {
    'use strict';

    function init() {
        // Load external CSS via JS (bypass server blocking)
        var extCss = document.createElement('link');
        extCss.rel = 'stylesheet';
        extCss.href = 'https://cdn.jsdelivr.net/gh/triandi30/cssv2@main/notion.css';
        document.head.appendChild(extCss);

        // Inject article styles
        var css = document.createElement('style');
        css.textContent = '' +
            '.obj_article_summary { padding:20px; margin-bottom:16px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; transition:all .2s ease; }' +
            '.obj_article_summary:hover { box-shadow:0 4px 15px rgba(0,0,0,.06); border-color:#1565c0; }' +
            '.obj_article_summary .title a { color:#1565c0; font-weight:700; font-size:15px; text-decoration:none; }' +
            '.obj_article_summary .title a:hover { text-decoration:underline; }' +
            '.airpubs-authors { font-size:14px; color:#374151; margin-bottom:6px; }' +
            '.airpubs-authors sup { font-size:10px; color:#1565c0; font-weight:700; }' +
            '.airpubs-extra { margin-top:12px; padding-top:12px; border-top:1px solid #f3f4f6; }' +
            '.airpubs-doi-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }' +
            '.airpubs-galley-btns { display:flex; gap:8px; flex-wrap:wrap; }' +
            '.airpubs-galley-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 16px; border:1.5px solid #dc3545; border-radius:5px; font-size:12.5px; font-weight:600; color:#dc3545; text-decoration:none; transition:all .2s ease; }' +
            '.airpubs-galley-btn:hover { background:#dc3545; color:#fff; text-decoration:none; }' +
            '.airpubs-pages { font-size:13px; color:#6b7280; display:inline-flex; align-items:center; gap:5px; }' +
            '.airpubs-doi a { color:#4b5563; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }' +
            '.airpubs-doi a:hover { color:#1565c0; }' +
            '.airpubs-doi-badge { display:inline-block; background:#f59e0b; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px; }' +
            '.airpubs-stat { font-size:13px; color:#6b7280; display:inline-flex; align-items:center; gap:5px; }' +
            '';
        document.head.appendChild(css);

        var articles = document.querySelectorAll('.obj_article_summary');
        if (!articles.length) return;

        articles.forEach(function(article) {
            if (article.getAttribute('data-airpubs-done')) return;
            article.setAttribute('data-airpubs-done', '1');

            var titleLink = article.querySelector('.title a') || article.querySelector('h3 a') || article.querySelector('h4 a');
            if (!titleLink) return;

            var articleUrl = titleLink.getAttribute('href');
            var authorsDiv = article.querySelector('.meta .authors');
            var pagesDiv = article.querySelector('.meta .pages');
            var galleysList = article.querySelector('.galleys_links');

            // 1. Read data FIRST
            var authorsText = authorsDiv ? authorsDiv.textContent.trim() : '';
            var pages = pagesDiv ? pagesDiv.textContent.trim() : '';
            var galleys = [];
            if (galleysList) {
                var gLinks = galleysList.querySelectorAll('a');
                for (var i = 0; i < gLinks.length; i++) {
                    galleys.push({ label: gLinks[i].textContent.trim(), href: gLinks[i].getAttribute('href') });
                }
            }

            // 2. Build authors with superscript
            if (authorsText && authorsDiv) {
                var authorNames = authorsText.split(',');
                var authHtml = '<div class="airpubs-authors"><i class="fas fa-users"></i> ';
                for (var j = 0; j < authorNames.length; j++) {
                    var name = authorNames[j].trim();
                    if (name) {
                        authHtml += '<strong>' + name + '</strong><sup>(' + (j + 1) + ')</sup>';
                        if (j < authorNames.length - 1) authHtml += ', ';
                    }
                }
                authHtml += '</div>';
                authorsDiv.innerHTML = authHtml;
            }

            // 3. Build bottom section
            var bottomHtml = '<div class="airpubs-extra"><div class="airpubs-doi-row">';
            // Galley buttons
            bottomHtml += '<div class="airpubs-galley-btns">';
            for (var k = 0; k < galleys.length; k++) {
                bottomHtml += '<a href="' + galleys[k].href + '" class="airpubs-galley-btn"><i class="fas fa-file-pdf"></i> ' + galleys[k].label + '</a>';
            }
            bottomHtml += '</div>';
            // Pages
            if (pages) {
                bottomHtml += '<span class="airpubs-pages"><i class="far fa-file-alt"></i> ' + pages + '</span>';
            }
            bottomHtml += '</div>';

            // DOI from URL
            var articleId = articleUrl.match(/\/view\/(\d+)/);
            if (articleId && articleId[1]) {
                var journalPath = window.location.pathname.match(/\/index\.php\/([^\/]+)/);
                var journalSlug = journalPath ? journalPath[1] : '';
                var volIssue = '';
                var pageTitle = document.querySelector('h1, .current_issue_title');
                if (pageTitle) {
                    var volMatch = pageTitle.textContent.match(/Vol\.\s*(\d+)\s*No\.\s*(\d+)/i);
                    if (volMatch) volIssue = 'v' + volMatch[1] + 'i' + volMatch[2] + '.';
                }
                if (journalSlug && volIssue) {
                    var doiText = '10.12928/' + journalSlug + '.' + volIssue + articleId[1];
                    bottomHtml += '<div class="airpubs-doi"><a href="https://doi.org/' + doiText + '" target="_blank"><span class="airpubs-doi-badge">DOI</span> ' + doiText + '</a></div>';
                }
            }

            bottomHtml += '</div>';

            // 4. Remove originals
            if (pagesDiv && pagesDiv.parentNode) pagesDiv.parentNode.removeChild(pagesDiv);
            if (galleysList && galleysList.parentNode) galleysList.parentNode.removeChild(galleysList);

            // 5. Insert
            article.insertAdjacentHTML('beforeend', bottomHtml);
        });

        // Article detail page
        var detailAuthors = document.querySelector('.obj_article_details .item.authors ul.authors');
        if (detailAuthors && !detailAuthors.getAttribute('data-airpubs-done')) {
            detailAuthors.setAttribute('data-airpubs-done', '1');
            var lis = detailAuthors.querySelectorAll('li');
            var authDetailHtml = '<div class="airpubs-authors" style="margin-bottom:8px"><i class="fas fa-users"></i> ';
            var affDetailHtml = '<div style="padding-left:10px">';
            var hasAff = false;

            for (var m = 0; m < lis.length; m++) {
                var nameEl = lis[m].querySelector('.name');
                var affEl = lis[m].querySelector('.affiliation');
                var nm = nameEl ? nameEl.textContent.trim() : '';
                var af = affEl ? affEl.textContent.trim() : '';
                if (nm) {
                    authDetailHtml += '<strong>' + nm + '</strong><sup>(' + (m + 1) + ')</sup>';
                    if (m < lis.length - 1) authDetailHtml += ', ';
                }
                if (af) {
                    hasAff = true;
                    affDetailHtml += '<div style="font-size:12.5px;color:#9ca3af;line-height:1.5">(' + (m + 1) + ') ' + af + '</div>';
                }
            }
            authDetailHtml += '</div>';
            affDetailHtml += '</div>';
            detailAuthors.innerHTML = '<li>' + authDetailHtml + (hasAff ? affDetailHtml : '') + '</li>';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
