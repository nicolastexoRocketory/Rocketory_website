jQuery(function ($) {
	function reindex($tbody) {
		$tbody.children('tr.tus-kader-order-row').each(function (index) {
			$(this).find('.tus-kader-order-input').val(index);
		});
	}

	$('.tus-kader-sortable').each(function () {
		var $tbody = $(this);
		$tbody.sortable({
			items: '> tr.tus-kader-order-row',
			handle: '.tus-kader-drag-handle',
			axis: 'y',
			cursor: 'grabbing',
			placeholder: 'tus-kader-sortable-placeholder',
			forcePlaceholderSize: true,
			tolerance: 'pointer',
			helper: function (e, ui) {
				ui.children().each(function () {
					$(this).width($(this).width());
				});
				return ui;
			},
			update: function () {
				reindex($tbody);
			}
		});
	});
});
