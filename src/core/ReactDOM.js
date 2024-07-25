import React from './React.js'
function createRoot(root) {
	function render(App) {
		React.render(App, root)
	}

	return {
		render,
	}
}
const ReactDOM = {
	createRoot,
}
export default ReactDOM;