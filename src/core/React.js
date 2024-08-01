function createTextNode(text) {
	return {
		type: "TEXT_NODE",
		props: {
			nodeValue: text,
			children: []
		}
	}
}
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child =>
				typeof child === "string"
					? createTextNode(child)
					: child
			)
		}
	}
}

function render(el, container) {
	const { props: { children, nodeValue, ...resetProps }, type } = el;
	const dom = type === "TEXT_NODE" ? document.createTextNode(nodeValue) : document.createElement(type);
	Object.keys(resetProps).forEach(key => {
		dom.setAttribute(key, resetProps[key])
	})
	children.map(child => render(child, dom))
	container.append(dom)
}

const React = {
	render, createElement
}
export default React