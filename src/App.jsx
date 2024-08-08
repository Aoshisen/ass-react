import React from "./core/React.js"
function Counter({ num, onClick }) {
	return <h1>{num}Counter <button onClick={onClick}>clickMe</button></h1>
}
export default function App() {
	function handleClick(event) {
		console.log(event,"click")
	}
	return (
		<div class="container">
			ass
			<Counter num={10} onClick={handleClick} />
			{/* <Counter num={20} /> */}
		</div>)
}