import React from "./core/React.js"
let toggle = true;
export default function App() {
	const Foo = () => <p>foo</p>;
	const bar = <div>bar</div>
	function toggleFooBar() {
		toggle = !toggle;
		React.update(App, null)
	}
	return <div>
		test for update
		<div>
			{
				toggle ? <Foo /> : bar
			}
		</div>
		<button onClick={toggleFooBar}>toggle</button>
	</div>

}