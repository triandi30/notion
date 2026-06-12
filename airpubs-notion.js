/**
 * AiRPubs OJS Enhancement Script
 * For OJS 3.2.x - journal2.uad.ac.id/index.php/notion
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

            // Fetch article detail page
            fetch(articleUrl)
                .then(function(res) { return res.text(); })
                .then(function(html) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, 'text/html');

                    // Get authors with affiliations
                    var authorItems = doc.querySelectorAll('.authors .list-group-item, .item.authors .sub_item');
                    var names = [];
                    var affs = [];

                    if (authorItems.length > 0) {
                        authorItems.forEach(function(item, idx) {
                            var nameEl = item.querySelector('.name') || item.querySelector('strong');
                            var affEl = item.querySelector('.affiliation') || item.querySelector('.value:not(.name)');
                            var name = nameEl ? nameEl.textContent.trim() : item.textContent.trim().split('\n')[0].trim();
                            var aff = affEl ? affEl.textContent.trim() : '';
                            if (name) {
                                names.push(name);
                                affs.push(aff);
                            }
                        });
                    }

                    // If no structured authors found, try alternate selectors
                    if (names.length === 0) {
                        var authBlock = doc.querySelector('.item.authors .value');
                        if (authBlock) {
                            var spans = authBlock.querySelectorAll('span.name, .author');
                            spans.forEach(function(s) {
                                names.push(s.textContent.trim());
                            });
                            var affSpans = authBlock.querySelectorAll('.affiliation');
                            affSpans.forEach(function(s, i) {
                                affs[i] = s.textContent.trim();
                            });
                        }
                    }

                    // Build authors HTML with superscript
                    if (names.length > 0 && authorsDiv) {
                        var authHtml = '<div class="airpubs-authors"><i class="fas fa-users"></i> ';
                        names.forEach(function(name, idx) {
                            authHtml += '<strong>' + name + '</strong> <sup>(' + (idx+1) + ')</sup>';
                            if (idx < names.length - 1) authHtml += ', ';
                        });
                        authHtml += '</div>';

                        // Affiliations
                        var hasAff = affs.some(function(a) { return a.length > 0; });
                        if (hasAff) {
                            authHtml += '<div class="airpubs-affiliations">';
                            affs.forEach(function(aff, idx) {
                                if (aff) {
                                    authHtml += '<div class="airpubs-aff-line">(' + (idx+1) + ') ' + aff + '</div>';
                                }
                            });
                            authHtml += '</div>';
                        }

                        authorsDiv.innerHTML = authHtml;
                    }

                    // Get abstract views
                    var viewsEl = doc.querySelector('.item.views .value') || doc.querySelector('.views .value');
                    var abstractViews = viewsEl ? viewsEl.textContent.trim() : '';

                    // Get DOI
                    var doiEl = doc.querySelector('.item.doi .value a') || doc.querySelector('.doi .value a');
                    var doiText = '';
                    var doiHref = '';
                    if (doiEl) {
                        doiHref = doiEl.getAttribute('href') || '';
                        doiText = doiHref.replace('https://doi.org/', '').replace('http://doi.org/', '');
                    }

                    // Get galley views
                    var galleyViews = [];
                    var galleyItems = doc.querySelectorAll('.item.galleys .value a, .galleys_links a');
                    // Try to get download counts from article page
                    var countEls = doc.querySelectorAll('.download .value, .item.galleys_count .value');

                    // Build meta section
                    var pages = pagesDiv ? pagesDiv.textContent.trim() : '';
                    var metaHtml = '<div class="airpubs-extra">';

                    // Stats row
                    metaHtml += '<div class="airpubs-meta-row">';
                    metaHtml += '<div class="airpubs-stats">';
                    if (abstractViews) {
                        metaHtml += '<span class="airpubs-stat"><i class="fas fa-chart-line"></i> Abstract : ' + abstractViews + '</span>';
                    }
                    // Galley labels
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
                    if (doiText) {
                        metaHtml += '<div class="airpubs-doi"><a href="' + doiHref + '" target="_blank"><span class="airpubs-doi-badge">DOI</span> ' + doiText + '</a></div>';
                    }
                    metaHtml += '</div>';
                    metaHtml += '</div>';

                    // Hide original pages and galleys
                    if (pagesDiv) pagesDiv.style.display = 'none';
                    if (galleysList) galleysList.style.display = 'none';

                    // Insert after meta div
                    var metaDiv = article.querySelector('.meta');
                    if (metaDiv) {
                        var extraDiv = document.createElement('div');
                        extraDiv.innerHTML = metaHtml;
                        metaDiv.parentNode.insertBefore(extraDiv, metaDiv.nextSibling);
                    }

                }).catch(function(err) {
                    console.log('AiRPubs: Could not fetch article', err);
                });
        });
    });
})();
