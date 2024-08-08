let nextWorkOfUnit = null;
let root = null;

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
			children: children.map(child => {
				const isTextNode = typeof child === "string" || typeof child === "number";
				return isTextNode
					? createTextNode(child)
					: child
			}
			)
		}
	}
}

function render(el, container) {
	//在这里去初始化 我们的任务
	nextWorkOfUnit = {
		dom: container,
		props: {
			children: [el]
		}
	}
	root = nextWorkOfUnit;
}

function createDom(type) {
	return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type);
}

function updateProps(dom, props) {
	Object.keys(props).forEach(key => {
		if (key !== "children") {
			if (key.startsWith("on")) {
				let eventName = key.slice(2).toLowerCase();
				dom.addEventListener(eventName, props[key]);
			} else {
				dom[key] = props[key];
			}
		}
	})
}

function initChildren(fiber, children) {
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

function updateFunctionComponent(fiber) {
	const children = [fiber.type(fiber.props)];
	initChildren(fiber, children)
}

function updateHostComponent(fiber) {
	if (!fiber.dom) {
		const dom = fiber.dom = createDom(fiber.type)
		updateProps(dom, fiber.props)
	}
	const children = fiber.props.children;
	initChildren(fiber, children)
}

function performWorkUnit(fiber) {
	const isFunctionComponent = typeof fiber.type === 'function';
	if (isFunctionComponent) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}

	if (fiber.child) {
		return fiber.child;
	}
	if (fiber.sibling) {
		return fiber.sibling;
	}
	let nextFiberParent = fiber.parent;
	while (nextFiberParent) {
		if (nextFiberParent.sibling) {
			return nextFiberParent.sibling;
		}
		nextFiberParent = nextFiberParent.parent;
	}
}

function commitRoot() {
	commitWork(root.child)
	root = null;
}

function commitWork(fiber) {
	if (!fiber) return void 0;
	let parent = fiber.parent;
	while (!parent.dom) {
		parent = parent.parent;
	}
	if (fiber.dom) {
		parent.dom.append(fiber.dom)
	}
	commitWork(fiber.child)
	commitWork(fiber.sibling)
}
function workerLoop(IdleDeadline) {
	let shouldYield = false;
	while (!shouldYield && nextWorkOfUnit) {
		const remaining = IdleDeadline.timeRemaining()
		nextWorkOfUnit = performWorkUnit(nextWorkOfUnit)
		if (remaining < 1) {
			shouldYield = true;
		}
	}
	if (!nextWorkOfUnit && root) {
		commitRoot()
	}
	requestIdleCallback(workerLoop)
}

requestIdleCallback(workerLoop);

const React = {
	render, createElement
}
export default React