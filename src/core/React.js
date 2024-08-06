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
			dom[key] = props[key];
		}
	})
}
function initChildren(fiber, children) {
	// 3. 建立当前的dom 元素的子父级,兄弟节点的关系
	// const children = fiber.props.children;
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
	const isFunctionComponent = typeof fiber.type === 'function';
	if (isFunctionComponent) {
		console.log(fiber.type(), "type performed");
	} else {
		if (!fiber.dom) {
			const dom = fiber.dom = createDom(fiber.type)
			// fiber.parent.dom.append(dom)
			// 统一的在commitRoot 里面去处理添加到视图的逻辑
			updateProps(dom, fiber.props)
		}
	}
	// 需要注意的是这里是一个数组
	const children = isFunctionComponent ? [fiber.type()] : fiber.props.children;
	initChildren(fiber, children)

	if (fiber.child) {
		return fiber.child;
	}
	if (fiber.sibling) {
		return fiber.sibling;
	}
	return fiber.parent?.sibling;
}
function commitRoot() {
	commitWork(root.child)
	root = null;
}
function commitWork(fiber) {
	if (!fiber) return void 0;
	// 由于functionComponent 没有dom 所以需要递归的去查找有dom 的父级容器进行添加
	let parent = fiber.parent;
	while (!parent.dom) {
		parent = parent.parent;
	}
	if (fiber.dom) {
		// 在为function 的时候其fiber.dom 不存在
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
		//dom 节点已经处理完成了
		commitRoot()
	}
	requestIdleCallback(workerLoop)
}

requestIdleCallback(workerLoop);

const React = {
	render, createElement
}
export default React