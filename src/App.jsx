import React from "./core/React.js"
let num = 10;
function Counter() {
	function handleClick() {
		num++;
		React.update()
	}
	return <h1>{num}Counter <button onClick={handleClick}>clickMe</button></h1>
}
export default function App() {
	return (
		<div class="container">
			ass
			<Counter />
		</div>)
}