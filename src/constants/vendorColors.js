export const VENDOR_COLORS = [
	'#6b9fff',
	'#a67de8',
	'#f5a030',
	'#4dbf7a',
	'#ff6b6b',
	'#36c5e8',
	'#cc8855',
	'#8bc34a',
	'#d46bd4',
	'#5b9bd5',
];

export function vendorColor(vendorKeys, vendor) {
	const idx = vendorKeys.indexOf(vendor) % VENDOR_COLORS.length;
	return VENDOR_COLORS[idx < 0 ? 0 : idx];
}
