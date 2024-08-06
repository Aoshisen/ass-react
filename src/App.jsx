import React from "./core/React.js"
function Counter({ num }) {
	console.log(num,"<<<<<<<<<<<<<<<")
	return <h1>Counter {num}</h1>
}
export default function App() {
	return (
		<div class="container">
			ass
			<Counter num={10} />
		</div>)
}