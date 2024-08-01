
// [https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback]
function startWorkLoop() {
	let taskId = 1;
	function workerLoop(IdleDeadline) {
		let shouldYield = false;
		taskId++;
		while (!shouldYield && taskId < 10) {
			const remaining = IdleDeadline.timeRemaining()
			console.log(`${taskId}=>`)
			if (remaining < 1) {
				shouldYield = true;
			}
		}
		requestIdleCallback(workerLoop)
	}
	requestIdleCallback(workerLoop);
}