jQuery(function ($) {
	$('.tus-kader-upload').on('click', function (e) {
		e.preventDefault();
		var frame = wp.media({
			title: 'Kader-Hero-Bild',
			multiple: false,
			library: { type: 'image' }
		});
		frame.on('select', function () {
			var att = frame.state().get('selection').first().toJSON();
			$('#tus_kader_hero_id').val(att.id);
			$('#tus-kader-hero-preview').attr('src', att.url).show();
		});
		frame.open();
	});
});
