import React from "./core/React.js"
let toggle = true;
export default function App() {
	const foo = (
		<div>foo
			<div>child 1</div>
			<div>child 2</div>
		</div>
	);
	const bar = <div>bar</div>
	function toggleFooBar() {
		toggle = !toggle;
		React.update(App, null)
	}
	return <div>
		<button onClick={toggleFooBar}>toggle</button>
		{toggle&&foo}
	</div>

}