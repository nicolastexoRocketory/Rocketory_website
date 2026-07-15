(function () {
  var author = window.__RK_AUTHOR;
  if (!author || document.getElementById('rk-author-schema')) return;

  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'rk-author-schema';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': author.id,
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.bio,
    image: author.image,
    url: author.url,
    sameAs: author.sameAs,
    knowsAbout: author.knowsAbout,
    worksFor: {
      '@type': 'Organization',
      name: author.worksFor.name,
      url: author.worksFor.url
    }
  });

  document.head.appendChild(script);
})();
