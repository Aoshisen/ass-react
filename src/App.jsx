import React from "./core/React.js"
function Counter({ num }) {
	console.log(num, "this is counter")
	return <h1>{num}Counter</h1>
}
export default function App() {
	return (
		<div class="container">
			ass
			<Counter num={10} />
			<Counter num={20} />
		</div>)
}