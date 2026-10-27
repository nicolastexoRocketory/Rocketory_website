document.addEventListener('DOMContentLoaded', function () {
	var groupTitles = document.querySelectorAll('.pt-group-title');
	groupTitles.forEach(function (title) {
		title.addEventListener('click', function () {
			this.parentElement.classList.toggle('is-open');
		});
	});

	var cards = document.querySelectorAll('.pt-card');
	var modal = document.getElementById('pt-modal');
	if (!modal) {
		return;
	}

	var overlay = modal.querySelector('.pt-modal-overlay');
	var closeBtn = modal.querySelector('.pt-modal-close');

	function openModal() {
		modal.classList.add('is-active');
		modal.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		modal.classList.remove('is-active');
		modal.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
	}

	function fillModal(card) {
		var name = card.getAttribute('data-name');
		var img = card.getAttribute('data-img');
		var sponsor = card.getAttribute('data-sponsor');
		var statsMap = ['number', 'position', 'birthday', 'nationality', 'height'];

		document.getElementById('pt-modal-name').textContent = name || '';
		var imgEl = document.getElementById('pt-modal-img');
		imgEl.src = img || '';
		imgEl.alt = name || '';
		imgEl.style.display = img ? 'block' : 'none';

		statsMap.forEach(function (stat) {
			var val = card.getAttribute('data-' + stat);
			var row = document.getElementById('pt-modal-row-' + stat);
			if (val && val.trim() !== '') {
				document.getElementById('pt-modal-' + stat).textContent = val;
				row.style.display = 'flex';
			} else {
				row.style.display = 'none';
			}
		});

		var sponsorWrapper = document.getElementById('pt-modal-sponsor-wrapper');
		if (sponsor && sponsor.trim() !== '') {
			document.getElementById('pt-modal-sponsor-img').src = sponsor;
			sponsorWrapper.style.display = 'block';
		} else {
			sponsorWrapper.style.display = 'none';
		}

		openModal();
	}

	function openCard(card, updateUrl) {
		if (!card) {
			return;
		}
		var group = card.closest('.pt-group');
		if (group && !group.classList.contains('is-open')) {
			group.classList.add('is-open');
		}
		fillModal(card);
		if (updateUrl && card.getAttribute('data-slug') && window.history && window.history.replaceState) {
			var url = new URL(window.location.href);
			url.searchParams.set('spieler', card.getAttribute('data-slug'));
			window.history.replaceState({}, '', url.toString());
		}
		card.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}

	cards.forEach(function (card) {
		card.addEventListener('click', function () {
			openCard(card, true);
		});
	});

	if (closeBtn) {
		closeBtn.addEventListener('click', closeModal);
	}
	if (overlay) {
		overlay.addEventListener('click', closeModal);
	}

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && modal.classList.contains('is-active')) {
			closeModal();
		}
	});

	var params = new URLSearchParams(window.location.search);
	var slug = params.get('spieler');
	if (slug) {
		var safe = (window.CSS && CSS.escape) ? CSS.escape(slug) : slug.replace(/["'\\]/g, '');
		var match = document.querySelector('.pt-card[data-slug="' + safe + '"]');
		if (match) {
			openCard(match, false);
		}
	}
});
