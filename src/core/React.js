let nextWorkOfUnit = null;
// work in progress
let wipRoot = null;
let currentRoot = null;
let deletions = [];
//正在处理的fiber;
let wipFiber = null;

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
	let currentFiber = wipFiber;
	//更改了wipRoot 和下一个任务
	return () => {
		wipRoot = {
			...currentFiber,
			alternate: currentFiber,
		}
		nextWorkOfUnit = wipRoot;
	}
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
			if (child) {
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
			//如果类型不一样的话就去删除当前的节点, 创建当前需要删除节点的一个数组, 在重新commitRoot 的时候再去删除数组里面的元素
			if (oldFiber) {
				// console.log("should delete", oldFiber)
				deletions.push(oldFiber)
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
		if (newFiber) {
			prevChild = newFiber;
		}
	});

	while (oldFiber) {
		deletions.push(oldFiber)
		oldFiber = oldFiber.sibling;
	}
}

function updateFunctionComponent(fiber) {
	stateHooks = []
	effectHooks = []
	stateHooksIndex = 0
	wipFiber = fiber;
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

function commitDeletions(fiber) {
	if (fiber.dom) {
		let fiberParent = fiber.parent;
		while (!fiberParent.dom) {
			fiberParent = fiberParent.parent;
		}
		fiberParent.dom.removeChild(fiber.dom)
	} else {
		commitDeletions(fiber.child)
	}
}

function commitRoot() {
	//删除需要删除的节点
	deletions.forEach(commitDeletions)
	commitEffectHook()
	commitWork(wipRoot.child)
	currentRoot = wipRoot;
	wipRoot = null;
	deletions = []
}
function commitEffectHook() {
	//针对所有的function component 检查一下是否有effectHook ,如果有就执行它,
	// 两个参数的时候区分是否是初始化的时候,如果是初始化的时候执行所有的callback,如果不是初始化的时候,看看deps 有没有改变,如果改变了执行其callback
	function run(fiber) {
		if (!fiber) return;
		if (!fiber.alternate) {
			//init
			fiber.effectHooks?.forEach(effectHook => {
				effectHook?.callback()
			})
		}
		else {
			//update
			//如何判断当前的deps 有没有发生改变呢
			fiber.effectHooks?.forEach((newHook, index) => {
				if (newHook.deps > 0) {
					const oldEffectHook = fiber.alternate?.effectHooks[index];
					const shouldUpdate = oldEffectHook?.deps.some((oldDep, i) => {
						return oldDep !== newHook.deps[i]
					})
					if (shouldUpdate) {
						newHook.callback()
					}
				}
			})
		}

		run(fiber.sibling);
		run(fiber.child)
	}
	run(wipRoot)
}

function commitWork(fiber) {
	if (!fiber) return void 0;
	let fiberParent = fiber.parent;
	while (!fiberParent.dom) {
		fiberParent = fiberParent.parent;
	}
	if (fiber.effectTag === "update") {
		updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
	} else if (fiber.effectTag === "placement") {
		if (fiber.dom) {
			fiberParent.dom.append(fiber.dom)
		}
	}
	commitWork(fiber.child)
	commitWork(fiber.sibling)
}

function workerLoop(IdleDeadline) {
	let shouldYield = false;
	while (!shouldYield && nextWorkOfUnit) {
		nextWorkOfUnit = performWorkUnit(nextWorkOfUnit)
		// 特别注意 这里并不是wipFiber de sibling 而是wipRoot de sibling ,在初始渲染的时候wipRoot 永远都为root 节点,在更新的时候会变化,
		if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
			nextWorkOfUnit = undefined;
		}
		shouldYield = IdleDeadline.timeRemaining() < 1
	}
	if (!nextWorkOfUnit && wipRoot) {
		commitRoot()
	}
	requestIdleCallback(workerLoop)
}

let stateHooks;
let stateHooksIndex;

function useState(initialState) {
	//存储state 的值到当前currentFiber 上
	let currentFiber = wipFiber;
	const oldHook = currentFiber.alternate?.stateHooks[stateHooksIndex];
	const stateHook = {
		state: oldHook ? oldHook.state : initialState,
		queue: oldHook ? oldHook.queue : []
	}

	stateHook.queue.forEach(action => {
		stateHook.state = action(stateHook.state)
	})

	stateHook.queue = [];
	stateHooks.push(stateHook);
	currentFiber.stateHooks = stateHooks;
	stateHooksIndex++;
	const setState = (action) => {
		const _action = typeof action === "function" ? action : () => action;
		const eagerState = _action(stateHook.state);
		if (eagerState === stateHook.state) return;
		stateHook.queue.push(_action)
		//更新视图
		wipRoot = {
			...currentFiber,
			alternate: currentFiber,
		}
		nextWorkOfUnit = wipRoot;
	}
	return [stateHook.state, setState]
}

let effectHooks;
function useEffect(callback, deps) {
	const effectHook = {
		callback: callback,
		deps: deps
	}
	effectHooks.push(effectHook)
	wipFiber.effectHooks = effectHooks;
}

requestIdleCallback(workerLoop);

const React = {
	render, createElement, update, useState, useEffect
}

export default React