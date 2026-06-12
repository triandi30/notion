/**
 * AiRPubs OJS Enhancement Script
 * Inject via Custom Tags: <script src="URL"></script>
 * Transforms article list display on OJS 3.2+
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // Only run on issue/current pages (article listing)
        var articles = document.querySelectorAll('.obj_article_summary');
        if (!articles.length) return;

        articles.forEach(function(article) {
            // Get article link to fetch detail
            var titleLink = article.querySelector('.title a') || article.querySelector('h3 a') || article.querySelector('h4 a');
            if (!titleLink) return;

            var articleUrl = titleLink.getAttribute('href');
            var authorEl = article.querySelector('.authors');
            var galleyEls = article.querySelectorAll('.galleys_links a, .galley_link a');

            // Fetch article page to get affiliation data
            if (articleUrl && authorEl) {
                fetch(articleUrl)
                    .then(function(res) { return res.text(); })
                    .then(function(html) {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(html, 'text/html');

                        // Get authors with affiliations
                        var authorsList = doc.querySelectorAll('.authors .author, .item.authors .value .author');
                        var affiliationsList = doc.querySelectorAll('.item.authors .affiliation, .authors .affiliation');

                        if (authorsList.length > 0) {
                            var authorsHtml = '<div class="airpubs-authors">';
                            var affsHtml = '<div class="airpubs-affiliations">';
                            var affsMap = {};

                            authorsList.forEach(function(auth, idx) {
                                var name = auth.querySelector('.name') ? auth.querySelector('.name').textContent.trim() : auth.textContent.trim();
                                var aff = auth.querySelector('.affiliation') ? auth.querySelector('.affiliation').textContent.trim() : '';

                                if (!aff && affiliationsList[idx]) {
                                    aff = affiliationsList[idx].textContent.trim();
                                }

                                var num = idx + 1;
                                authorsHtml += '<span class="airpubs-author-name">' + name + ' <sup>(' + num + ')</sup></span>';
                                if (idx < authorsList.length - 1) authorsHtml += ', ';

                                if (aff) {
                                    affsHtml += '<div class="airpubs-aff-line">(' + num + ') ' + aff + '</div>';
                                }
                            });

                            authorsHtml += '</div>';
                            affsHtml += '</div>';

                            authorEl.innerHTML = authorsHtml + affsHtml;
                        }

                        // Get views/downloads from article page
                        var viewsEl = doc.querySelector('.item.views .value, .views .value, #articleAbstractViews');
                        var abstractViews = '';
                        if (viewsEl) {
                            abstractViews = viewsEl.textContent.trim();
                        }

                        // Get DOI
                        var doiEl = doc.querySelector('.item.doi .value a, .doi .value a');
                        var doiText = '';
                        var doiHref = '';
                        if (doiEl) {
                            doiText = doiEl.textContent.trim().replace('https://doi.org/', '');
                            doiHref = doiEl.getAttribute('href');
                        }

                        // Get pages
                        var pagesEl = doc.querySelector('.item.pages .value, .pages .value');
                        var pages = pagesEl ? pagesEl.textContent.trim() : '';

                        // Build meta row
                        var metaHtml = '<div class="airpubs-meta-row">';
                        metaHtml += '<div class="airpubs-stats">';
                        if (abstractViews) {
                            metaHtml += '<span class="airpubs-stat"><i class="fas fa-chart-line"></i> Abstract : ' + abstractViews + '</span>';
                        }

                        // Galley downloads
                        galleyEls.forEach(function(g) {
                            metaHtml += '<span class="airpubs-stat"><i class="fas fa-download"></i> ' + g.textContent.trim() + '</span>';
                        });

                        metaHtml += '</div>';
                        if (pages) {
                            metaHtml += '<span class="airpubs-pages"><i class="far fa-file-alt"></i> ' + pages + '</span>';
                        }
                        metaHtml += '</div>';

                        // DOI row
                        if (doiText) {
                            metaHtml += '<div class="airpubs-doi-row">';
                            // Galley buttons
                            metaHtml += '<div class="airpubs-galley-btns">';
                            galleyEls.forEach(function(g) {
                                metaHtml += '<a href="' + g.getAttribute('href') + '" class="airpubs-galley-btn"><i class="fas fa-file-pdf"></i> ' + g.textContent.trim() + '</a>';
                            });
                            metaHtml += '</div>';
                            metaHtml += '<div class="airpubs-doi"><a href="' + doiHref + '" target="_blank"><span class="airpubs-doi-badge">DOI</span> ' + doiText + '</a></div>';
                            metaHtml += '</div>';
                        } else {
                            // Just galley buttons without DOI
                            metaHtml += '<div class="airpubs-doi-row"><div class="airpubs-galley-btns">';
                            galleyEls.forEach(function(g) {
                                metaHtml += '<a href="' + g.getAttribute('href') + '" class="airpubs-galley-btn"><i class="fas fa-file-pdf"></i> ' + g.textContent.trim() + '</a>';
                            });
                            metaHtml += '</div></div>';
                        }

                        // Hide original galleys
                        var origGalleys = article.querySelector('.galleys_links, .galley_links');
                        if (origGalleys) origGalleys.style.display = 'none';

                        // Append meta after authors
                        var metaDiv = document.createElement('div');
                        metaDiv.className = 'airpubs-extra';
                        metaDiv.innerHTML = metaHtml;
                        authorEl.parentNode.insertBefore(metaDiv, authorEl.nextSibling);

                    }).catch(function() {});
            }
        });
    });
})();
