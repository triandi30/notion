/**
 * AiRPubs OJS Enhancement Script
 * For OJS 3.2.x - Universal (works on any journal)
 * No fetch, no hardcoded DOI
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        // Force hide all original galleys via style injection
        var style = document.createElement('style');
        style.textContent = '.obj_article_summary .galleys_links, .obj_article_summary .meta .pages { display:none!important; visibility:hidden!important; height:0!important; overflow:hidden!important; margin:0!important; padding:0!important; }';
        document.head.appendChild(style);

        var articles = document.querySelectorAll('.obj_article_summary');
        if (!articles.length) return;

        articles.forEach(function(article) {
            var titleLink = article.querySelector('.title a') || article.querySelector('h3 a') || article.querySelector('h4 a');
            if (!titleLink) return;

            var articleUrl = titleLink.getAttribute('href');
            var authorsDiv = article.querySelector('.meta .authors');
            var pagesDiv = article.querySelector('.meta .pages');
            var galleysList = article.querySelector('.galleys_links');

            // Parse authors from existing text (comma separated)
            if (authorsDiv) {
                var authorsText = authorsDiv.textContent.trim();
                var authorNames = authorsText.split(',').map(function(n) { return n.trim(); }).filter(function(n) { return n.length > 0; });

                if (authorNames.length > 0) {
                    var authHtml = '<div class="airpubs-authors"><i class="fas fa-users"></i> ';
                    authorNames.forEach(function(name, idx) {
                        authHtml += '<strong>' + name + '</strong> <sup>(' + (idx + 1) + ')</sup>';
                        if (idx < authorNames.length - 1) authHtml += ', ';
                    });
                    authHtml += '</div>';
                    authorsDiv.innerHTML = authHtml;
                }
            }

            // Get pages
            var pages = pagesDiv ? pagesDiv.textContent.trim() : '';

            // Build enhanced meta section
            var metaHtml = '<div class="airpubs-extra">';

            // Row: galley buttons left, pages right
            metaHtml += '<div class="airpubs-doi-row">';
            metaHtml += '<div class="airpubs-galley-btns">';
            if (galleysList) {
                var gLinks = galleysList.querySelectorAll('a');
                gLinks.forEach(function(g) {
                    metaHtml += '<a href="' + g.getAttribute('href') + '" class="airpubs-galley-btn"><i class="fas fa-file-pdf"></i> ' + g.textContent.trim() + '</a>';
                });
            }
            metaHtml += '</div>';
            if (pages) {
                metaHtml += '<span class="airpubs-pages"><i class="far fa-file-alt"></i> ' + pages + '</span>';
            }
            metaHtml += '</div>';

            metaHtml += '</div>';

            // Remove original elements from DOM
            if (galleysList) galleysList.remove();
            if (pagesDiv) pagesDiv.remove();

            // Insert after meta div
            var metaContainer = article.querySelector('.meta');
            if (metaContainer) {
                var extraDiv = document.createElement('div');
                extraDiv.innerHTML = metaHtml;
                metaContainer.parentNode.insertBefore(extraDiv, metaContainer.nextSibling);
            }
        });

        // === Enhancement for Article Detail Page ===
        var detailAuthors = document.querySelector('.obj_article_details .item.authors ul.authors');
        if (detailAuthors) {
            var lis = detailAuthors.querySelectorAll('li');
            var authDetailHtml = '<div class="airpubs-authors" style="margin-bottom:8px;"><i class="fas fa-users"></i> ';
            var affDetailHtml = '<div class="airpubs-affiliations">';

            lis.forEach(function(li, idx) {
                var nameEl = li.querySelector('.name');
                var affEl = li.querySelector('.affiliation');
                var name = nameEl ? nameEl.textContent.trim() : '';
                var aff = affEl ? affEl.textContent.trim() : '';

                if (name) {
                    authDetailHtml += '<strong>' + name + '</strong> <sup>(' + (idx + 1) + ')</sup>';
                    if (idx < lis.length - 1) authDetailHtml += ', ';
                }
                if (aff) {
                    affDetailHtml += '<div class="airpubs-aff-line">(' + (idx + 1) + ') ' + aff + '</div>';
                }
            });

            authDetailHtml += '</div>';
            affDetailHtml += '</div>';

            detailAuthors.innerHTML = '<li>' + authDetailHtml + affDetailHtml + '</li>';
        }
    });
})();
