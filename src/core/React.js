let nextWorkOfUnit = null;
// work in progress
let wipRoot = null;
let currentRoot = null;

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
	wipRoot = {
		dom: container,
		props: {
			children: [el]
		}
	}
	nextWorkOfUnit = wipRoot;
}

function update() {
	//在这里去初始化 我们的任务
	nextWorkOfUnit = {
		dom: currentRoot.dom,
		props: currentRoot.props,
		alternate: currentRoot,
	}
	wipRoot = nextWorkOfUnit;
}

function createDom(type) {
	return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type);
}

function updateProps(dom, nextProps, prevProps) {
	// 1. 老的有 新的没有 删除
	// 2. 老的没有 新的有 新增
	// 3. 老的有 新的也有 更新
	Object.keys(prevProps).forEach((key) => {
		if (key !== "children") {
			if (!(key in nextProps)) {
				dom.removeAttribute(key)
			}
		}
	})
	Object.keys(nextProps).forEach((key) => {
		if (key !== "children") {
			if (nextProps[key] !== prevProps[key]) {
				if (key.startsWith("on")) {
					let eventName = key.slice(2).toLowerCase();
					dom.removeEventListener(eventName, prevProps[key])
					dom.addEventListener(eventName, nextProps[key]);
				} else {
					dom[key] = nextProps[key];
				}
			}
		}
	})

}

// initChildren to reconcile
function reconcileChildren(fiber, children) {
	let oldFiber = fiber.alternate?.child;
	let prevChild = null;
	children.forEach((child, index) => {
		const sameType = oldFiber && oldFiber.type === child.type;
		let newFiber;
		if (sameType) {
			// 更新
			newFiber = {
				type: child.type,
				props: child.props,
				sibling: null,
				child: null,
				parent: fiber,
				dom: oldFiber.dom,
				effectTag: "update",
				alternate: oldFiber,
			}
		} else {
			newFiber = {
				type: child.type,
				props: child.props,
				sibling: null,
				child: null,
				parent: fiber,
				dom: null,
				effectTag: "placement"
			}
		}
		if (oldFiber) {
			oldFiber = oldFiber.sibling
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
	reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
	if (!fiber.dom) {
		const dom = fiber.dom = createDom(fiber.type)
		updateProps(dom, fiber.props, {})
	}
	const children = fiber.props.children;
	reconcileChildren(fiber, children)
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
	commitWork(wipRoot.child)
	currentRoot = wipRoot;
	wipRoot = null;
}

function commitWork(fiber) {
	if (!fiber) return void 0;
	let parent = fiber.parent;
	while (!parent.dom) {
		parent = parent.parent;
	}
	if (fiber.effectTag === "update") {
		updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
	} else if (fiber.effectTag === "placement") {
		if (fiber.dom) {
			parent.dom.append(fiber.dom)
		}
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
	if (!nextWorkOfUnit && wipRoot) {
		commitRoot()
	}
	requestIdleCallback(workerLoop)
}

requestIdleCallback(workerLoop);

const React = {
	render, createElement, update
}
export default React