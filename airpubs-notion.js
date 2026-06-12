/**
 * AiRPubs OJS Enhancement Script v2
 * Universal - works on any OJS 3.2.x journal
 */
(function() {
    'use strict';

    function init() {
        var articles = document.querySelectorAll('.obj_article_summary');
        if (!articles.length) return;

        articles.forEach(function(article) {
            // Skip if already processed
            if (article.getAttribute('data-airpubs-done')) return;
            article.setAttribute('data-airpubs-done', '1');

            var titleLink = article.querySelector('.title a') || article.querySelector('h3 a') || article.querySelector('h4 a');
            if (!titleLink) return;

            var authorsDiv = article.querySelector('.meta .authors');
            var pagesDiv = article.querySelector('.meta .pages');
            var galleysList = article.querySelector('.galleys_links');

            // 1. Read data FIRST before modifying
            var authorsText = authorsDiv ? authorsDiv.textContent.trim() : '';
            var pages = pagesDiv ? pagesDiv.textContent.trim() : '';
            var galleys = [];
            if (galleysList) {
                var gLinks = galleysList.querySelectorAll('a');
                for (var i = 0; i < gLinks.length; i++) {
                    galleys.push({
                        label: gLinks[i].textContent.trim(),
                        href: gLinks[i].getAttribute('href')
                    });
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

            // 3. Build bottom section (galley buttons + pages)
            var bottomHtml = '<div class="airpubs-extra"><div class="airpubs-doi-row">';
            bottomHtml += '<div class="airpubs-galley-btns">';
            for (var k = 0; k < galleys.length; k++) {
                bottomHtml += '<a href="' + galleys[k].href + '" class="airpubs-galley-btn"><i class="fas fa-file-pdf"></i> ' + galleys[k].label + '</a>';
            }
            bottomHtml += '</div>';
            if (pages) {
                bottomHtml += '<span class="airpubs-pages"><i class="far fa-file-alt"></i> ' + pages + '</span>';
            }
            bottomHtml += '</div></div>';

            // 4. NOW hide originals
            if (pagesDiv) pagesDiv.style.display = 'none';
            if (galleysList) galleysList.style.display = 'none';

            // 5. Insert new content
            var insertPoint = galleysList || article.querySelector('.meta');
            if (insertPoint) {
                var extraDiv = document.createElement('div');
                extraDiv.innerHTML = bottomHtml;
                article.appendChild(extraDiv);
            }
        });

        // Article detail page - superscript authors + affiliations
        var detailAuthors = document.querySelector('.obj_article_details .item.authors ul.authors');
        if (detailAuthors && !detailAuthors.getAttribute('data-airpubs-done')) {
            detailAuthors.setAttribute('data-airpubs-done', '1');
            var lis = detailAuthors.querySelectorAll('li');
            var authDetailHtml = '<div class="airpubs-authors" style="margin-bottom:8px"><i class="fas fa-users"></i> ';
            var affDetailHtml = '<div class="airpubs-affiliations">';
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
                    affDetailHtml += '<div class="airpubs-aff-line">(' + (m + 1) + ') ' + af + '</div>';
                }
            }

            authDetailHtml += '</div>';
            affDetailHtml += '</div>';

            detailAuthors.innerHTML = '<li>' + authDetailHtml + (hasAff ? affDetailHtml : '') + '</li>';
        }
    }

    // Run when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
