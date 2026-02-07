export default function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
			<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
			<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
		</svg>
	);
}
