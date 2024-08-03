let nextFiber = null;
function createTextNode(text) {
	return {
		type: "TEXT_ELEMENT",
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
	//在这里去初始化 我们的任务
	nextFiber = {
		dom: container,
		props: {
			children: [el]
		}
	}
}

function createDom(type) {
	return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type);
}
function updateProps(dom, props) {
	Object.keys(props).forEach(key => {
		if (key !== "children") {
			dom[key] = props[key];
		}
	})
}
function initChildren(fiber) {
	// 3. 建立当前的dom 元素的子父级,兄弟节点的关系
	const children = fiber.props.children;
	// 记录上一个节点, 方便给上一个节点绑定上sibling 属性
	let prevChild = null;
	children.forEach((child, index) => {
		let newFiber = {
			type: child.type,
			props: child.props,
			sibling: null,
			child: null,
			parent: fiber,
			dom: null
		}
		if (index === 0) {
			fiber.child = newFiber;
		}
		else {
			prevChild.sibling = newFiber;
		}
		prevChild = newFiber;
	});
}

function performWorkUnit(fiber) {
	if (!fiber.dom) {
		const dom = fiber.dom = createDom(fiber.type)
		console.log(dom)
		fiber.parent.dom.append(dom)
		updateProps(dom, fiber.props)
	}
	initChildren(fiber)
	if (fiber.child) {
		return fiber.child;
	}
	if (fiber.sibling) {
		return fiber.sibling;
	}
	return fiber.parent?.sibling;
}
function workerLoop(IdleDeadline) {
	let shouldYield = false;
	while (!shouldYield && nextFiber) {
		const remaining = IdleDeadline.timeRemaining()
		nextFiber = performWorkUnit(nextFiber)
		if (remaining < 1) {
			shouldYield = true;
		}
	}
	requestIdleCallback(workerLoop)
}

requestIdleCallback(workerLoop);

const React = {
	render, createElement
}
export default React