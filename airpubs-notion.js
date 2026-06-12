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

            fetch(articleUrl)
                .then(function(res) { return res.text(); })
                .then(function(html) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, 'text/html');

                    // Method 1: Get from meta tags (most reliable)
                    var metaAuthors = doc.querySelectorAll('meta[name="citation_author"]');
                    var metaInstitutions = doc.querySelectorAll('meta[name="citation_author_institution"]');

                    var names = [];
                    var affs = [];

                    if (metaAuthors.length > 0) {
                        metaAuthors.forEach(function(m, idx) {
                            names.push(m.getAttribute('content'));
                            // Get corresponding institution
                            if (metaInstitutions[idx]) {
                                affs.push(metaInstitutions[idx].getAttribute('content'));
                            } else {
                                affs.push('');
                            }
                        });
                    }

                    // Fallback: Method 2 - from ul.authors li
                    if (names.length === 0) {
                        var authorLis = doc.querySelectorAll('.item.authors ul.authors li, section.item.authors ul.authors li');
                        authorLis.forEach(function(li) {
                            var nameEl = li.querySelector('.name');
                            var affEl = li.querySelector('.affiliation');
                            if (nameEl) names.push(nameEl.textContent.trim());
                            if (affEl) affs.push(affEl.textContent.trim());
                            else affs.push('');
                        });
                    }

                    // Build authors HTML with superscript
                    if (names.length > 0 && authorsDiv) {
                        var authHtml = '<div class="airpubs-authors"><i class="fas fa-users"></i> ';
                        names.forEach(function(name, idx) {
                            authHtml += '<strong>' + name + '</strong> <sup>(' + (idx + 1) + ')</sup>';
                            if (idx < names.length - 1) authHtml += ', ';
                        });
                        authHtml += '</div>';

                        // Affiliations
                        var hasAff = affs.some(function(a) { return a && a.length > 0; });
                        if (hasAff) {
                            authHtml += '<div class="airpubs-affiliations">';
                            affs.forEach(function(aff, idx) {
                                if (aff) {
                                    authHtml += '<div class="airpubs-aff-line">(' + (idx + 1) + ') ' + aff + '</div>';
                                }
                            });
                            authHtml += '</div>';
                        }

                        authorsDiv.innerHTML = authHtml;
                    }

                    // Get DOI from meta tag
                    var doiMeta = doc.querySelector('meta[name="DC.Identifier.DOI"]');
                    var doiText = doiMeta ? doiMeta.getAttribute('content') : '';
                    var doiHref = doiText ? 'https://doi.org/' + doiText : '';

                    // Get pages from meta
                    var pagesMeta = doc.querySelector('meta[name="DC.Identifier.pageNumber"]');
                    var pages = pagesMeta ? pagesMeta.getAttribute('content') : '';
                    if (!pages && pagesDiv) pages = pagesDiv.textContent.trim();

                    // Build enhanced meta section
                    var metaHtml = '<div class="airpubs-extra">';

                    // Stats row
                    metaHtml += '<div class="airpubs-meta-row">';
                    metaHtml += '<div class="airpubs-stats">';
                    // Galley download labels
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
                    var metaContainer = article.querySelector('.meta');
                    if (metaContainer) {
                        var extraDiv = document.createElement('div');
                        extraDiv.innerHTML = metaHtml;
                        metaContainer.parentNode.insertBefore(extraDiv, metaContainer.nextSibling);
                    }

                }).catch(function(err) {
                    console.log('AiRPubs: Error fetching', articleUrl, err);
                });
        });
    });
})();
