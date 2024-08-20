import React from "./core/React.js"
let toggle = true;
export default function App() {
	const foo = <p>foo</p>;
	const bar = <div>bar</div>
	function toggleFooBar() {
		toggle = !toggle;
		React.update(App, null)
	}
	return <div>
		test for update
		<div>
			{
				toggle ? foo : bar
			}
		</div>
		<button onClick={toggleFooBar}>toggle</button>
	</div>

}