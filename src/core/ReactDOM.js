import React from './React.js'
// createRoot 函数返回一个render 方法,render 方法传入一个element 然后会挂载到对应的节点上
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