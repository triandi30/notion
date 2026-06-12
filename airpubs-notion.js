/**
 * AiRPubs OJS Enhancement Script
 * For OJS 3.2.x - No fetch (server blocks cross-requests)
 * Works with data available on the page only
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var articles = document.querySelectorAll('.obj_article_summary');
        if (!articles.length) return;

        articles.forEach(function(article) {
            var titleLink = article.querySelector('.title a');
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

            // Get article ID from URL for DOI
            var articleId = articleUrl.match(/\/view\/(\d+)/);

            // Build enhanced meta section
            var pages = pagesDiv ? pagesDiv.textContent.trim() : '';

            var metaHtml = '<div class="airpubs-extra">';

            // Stats row
            metaHtml += '<div class="airpubs-meta-row">';
            metaHtml += '<div class="airpubs-stats">';
            if (galleysList) {
                var gLinks = galleysList.querySelectorAll('a');
                gLinks.forEach(function(g) {
                    metaHtml += '<span class="airpubs-stat"><i class="fas fa-download"></i> ' + g.textContent.trim() + '</span>';
                });
            }
            metaHtml += '</div>';
            if (pages) {
                metaHtml += '<span class="airpubs-pages"><i class="far fa-file-alt"></i> ' + pages + '</span>';
            }
            metaHtml += '</div>';

            // Galley buttons + DOI row
            metaHtml += '<div class="airpubs-doi-row">';
            metaHtml += '<div class="airpubs-galley-btns">';
            if (galleysList) {
                var gLinks2 = galleysList.querySelectorAll('a');
                gLinks2.forEach(function(g) {
                    metaHtml += '<a href="' + g.getAttribute('href') + '" class="airpubs-galley-btn"><i class="fas fa-file-pdf"></i> ' + g.textContent.trim() + '</a>';
                });
            }
            metaHtml += '</div>';

            // DOI from article URL pattern - auto detect journal path
            if (articleId && articleId[1]) {
                var journalPath = window.location.pathname.match(/\/index\.php\/([^\/]+)/);
                var journalSlug = journalPath ? journalPath[1] : 'unknown';
                // Try to get volume/issue from page
                var volIssue = '';
                var pageTitle = document.querySelector('h1, .current_issue_title');
                if (pageTitle) {
                    var volMatch = pageTitle.textContent.match(/Vol\.\s*(\d+)\s*No\.\s*(\d+)/i);
                    if (volMatch) {
                        volIssue = 'v' + volMatch[1] + 'i' + volMatch[2] + '.';
                    }
                }
                var doiPrefix = '10.12928/' + journalSlug + '.';
                var doiLink = 'https://doi.org/' + doiPrefix + volIssue + articleId[1];
                var doiDisplay = doiPrefix + volIssue + articleId[1];
                metaHtml += '<div class="airpubs-doi"><a href="' + doiLink + '" target="_blank"><span class="airpubs-doi-badge">DOI</span> ' + doiDisplay + '</a></div>';
            }
            metaHtml += '</div>';
            metaHtml += '</div>';

            // Hide original pages and galleys
            if (pagesDiv) pagesDiv.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;';
            if (galleysList) galleysList.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;';

            // Insert after meta div
            var metaContainer = article.querySelector('.meta');
            if (metaContainer) {
                var extraDiv = document.createElement('div');
                extraDiv.innerHTML = metaHtml;
                metaContainer.parentNode.insertBefore(extraDiv, metaContainer.nextSibling);
            }
        });

        // === Enhancement for Article Detail Page ===
        // Add superscript to authors on article detail page
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
