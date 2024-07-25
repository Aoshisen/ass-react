//创建一个元素并挂载到视图上面
// version 1
// ReactDOM.createRoot(node).render(<APP/>)
// const container = document.querySelector("#root")

// const node = document.createElement("div")
// node.innerText = "app";

// version 2
// const container = document.querySelector("#root")
// const rootNode = document.createElement("div");
// const textNode = document.createTextNode("app")
// rootNode.appendChild(textNode)
// container.appendChild(rootNode)

// version 3
// const container = document.querySelector("#root")

// const rootNode = createElement("div");
// const textNode = createElement("TextNode", "app")

// rootNode.appendChild(textNode)
// container.appendChild(rootNode)
// function createElement(type, props) {
// 	const element = document[type === "TextNode" ? "createTextNode" : "createElement"](props);
// 	return element;
// }
//Version 4

const container = document.getElementById("root")
//构建虚拟树
const nodes = {
	type: "div",
	props: { id: "container" },
	data: null,
	children: [{
		type: "TextNode",
		data: "app",
		props: {},
		children: []
	}
	]

}
function setAttribute(element, props) {
	Object.keys(props).forEach(key=>{
		element.setAttribute(key,props[key])
	})
}
function createElement(node) {
	const isTextNode = node.type === "TextNode"
	const params = isTextNode ? [node.data] : [node.type];
	const result = document[isTextNode ? "createTextNode" : "createElement"](...params);
	setAttribute(result,node.props)
	return result;
}
function render(nodes, container) {
	const currentNode = createElement(nodes);
	container.appendChild(currentNode)
	// console.log(container,currentNode)
	if (nodes.children.length) {
		nodes.children.forEach(child => render(child, currentNode))
	}
}

const ReactDOM = {
	createRoot(root) {
		return {
			render(nodes) {
				render(nodes, root)
			}
		}
	}
}

const app = ReactDOM.createRoot(container).render(nodes)
