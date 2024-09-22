import React from "./core/React.js"
let fooCount = 1;
let barCount = 1;
let appCount = 1;
function Foo() {
	console.log("Foo component updated")
	const update = React.update()
	function handleOnclick() {
		fooCount++;
		update()
	}
	return <div>
		count:{fooCount}
		<button onClick={handleOnclick}>add</button>
	</div>
}

function Bar() {
	console.log("Bar component updated")
	const update = React.update()
	function handleOnclick() {
		barCount++;
		update()
	}
	return <div>
		count:{barCount}
		<button onClick={handleOnclick}>add</button>
	</div>
}
export default function App() {
	console.log("App component updated")
	const update = React.update()
	function handleOnclick() {
		appCount++;
		update()
	}
	return <div>
		count:{appCount}
		<button onClick={handleOnclick}>add</button>
		<Foo />
		<Bar />
	</div>
}